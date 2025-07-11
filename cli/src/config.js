// simple JSON file in the user’s home directory
import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs';

const cfgPath = join(homedir(), '.vc-clone-config.json');

export function getConfig() {
  if (!fs.existsSync(cfgPath)) return {};
  return JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
}

export function saveConfig(cfg) {
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
}
