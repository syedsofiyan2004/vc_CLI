const fs   = require('fs');
const path = require('path');

module.exports = {
  name: 'node',
  detect: dir => fs.existsSync(path.join(dir, 'package.json')),
  build: async (dir, { runCommand }) => {
    await runCommand('npm', ['ci'], { cwd: dir });
    await runCommand('npm', ['run', 'build'], { cwd: dir });
    const dist = path.join(dir, 'dist');
    if (!fs.existsSync(dist)) throw new Error('`dist/` not found after build');
    return dist;
  }
};
