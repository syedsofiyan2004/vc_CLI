const fs   = require('fs');
const path = require('path');

module.exports = {
  name: 'angular',
  detect: dir => fs.existsSync(path.join(dir, 'angular.json')),
  build: async (dir, { runCommand }) => {
    await runCommand('npm', ['ci'], { cwd: dir });
    await runCommand('npx', ['ng', 'build', '--prod', '--output-path', 'dist'], { cwd: dir });
    const dist = path.join(dir, 'dist');
    if (!fs.existsSync(dist)) throw new Error('`dist/` missing');
    return dist;
  }
};
