import { Command } from 'commander';
import inquirer from 'inquirer';
import { saveConfig } from '../config.js';

export default function registerLogin(program) {
  program
    .command('login')
    .description('Store your API endpoint & token')
    .action(async () => {
      const answers = await inquirer.prompt([
        { name: 'apiUrl',   message: 'API URL (e.g. https://api.foo.com):' },
        { name: 'apiToken', message: 'API token (or AWS profile):' }
      ]);
      saveConfig(answers);
      console.log('Logged in! Config saved to ~/.vc-clone-config.json');
    });
}
