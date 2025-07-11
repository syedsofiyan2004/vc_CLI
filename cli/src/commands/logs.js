import { Command } from 'commander';
import WebSocket from 'ws';
import { getConfig } from '../config.js';

export default function registerLogs(program) {
  program
    .command('logs <slug>')
    .description('Stream real-time logs for a deployed project')
    .action((slug) => {
      const { apiUrl, apiToken } = getConfig();
      if (!apiUrl || !apiToken) {
        console.error(' Please run `vc login` first.');
        process.exit(1);
      }

      const wsUrl = apiUrl
        .replace(/^https?:\/\//, 'ws://')
        .replace(/:\d+/, `:${process.env.WS_PORT || 9002}`);

      console.log(`Connecting to ${wsUrl}…`);
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          action:  'subscribe',
          channel: `logs:${slug}`
        }));
        console.log(`Subscribed to logs:${slug}`);
      });

      ws.on('message', (data) => {
        try {
          const obj = JSON.parse(data);
          process.stdout.write(obj.log + '\n');
        } catch {
          process.stdout.write(data + '\n');
        }
      });

      ws.on('close', () => {
        console.log('Connection closed.');
        process.exit(0);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
        process.exit(1);
      });
    });
}
