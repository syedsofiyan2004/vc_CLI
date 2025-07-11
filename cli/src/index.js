#!/usr/bin/env node
import { Command } from 'commander';
import registerLogin  from './commands/login.js';
import registerDeploy from './commands/deploy.js';
import registerLogs   from './commands/logs.js';

const program = new Command();
program.name('vc').description('Vercel-Clone CLI');

registerLogin(program);
registerDeploy(program);
registerLogs(program);

program.parse(process.argv);
