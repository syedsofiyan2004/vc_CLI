import { Command } from 'commander';
import fetch from 'node-fetch';
import WebSocket from 'ws';
import { getConfig } from '../config.js';

export default function registerDeploy(program) {
  program
    .command('deploy <gitURL>')
    .option('--slug <slug>', 'custom project slug')
    .description('Enqueue a build and stream logs')
    .action(async (gitURL, opts) => {
      const { apiUrl, apiToken } = getConfig();
      if (!apiUrl || !apiToken) {
        console.error('Please run `vc login` first.');
        process.exit(1);
      }
      const res = await fetch(`${apiUrl}/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ gitURL, slug: opts.slug })
      });
      const { data } = await res.json();
      console.log(`Build queued for ${data.projectSlug}`);
      console.log(`Streaming logs from ${apiUrl.replace('http','ws')}`);
      const ws = new WebSocket(apiUrl.replace(/^http/, 'ws') + '/');
      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'subscribe', channel: `logs:${data.projectSlug}` }));
      });
      ws.on('message', msg => {
        process.stdout.write(msg + '\n');
        if (msg.includes('Deployment finished')) {
          console.log(`Visit: http://${data.projectSlug}.sofiyan.com`);
          ws.close();
          process.exit(0);
        }
      });
    });
}
