const fs   = require('fs');
const path = require('path');

module.exports = {
  name: 'golang',
  detect: dir => fs.existsSync(path.join(dir, 'go.mod')),
  build: async (dir, { runCommand }) => {
    const dist      = path.join(dir, 'dist');
    const binary    = path.basename(dir);
    fs.mkdirSync(dist, { recursive: true });
    await runCommand('go', ['build', '-o', path.join(dist, binary)], { cwd: dir });
    return dist;
  }
};
