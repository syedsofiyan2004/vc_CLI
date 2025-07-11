const fs   = require('fs');
const path = require('path');

module.exports = {
  name: 'python',
  detect: dir =>
    fs.existsSync(path.join(dir, 'requirements.txt')) ||
    fs.existsSync(path.join(dir, 'pyproject.toml')),
  build: async (dir, { runCommand }) => {
    const dist = path.join(dir, 'dist');
    fs.mkdirSync(dist, { recursive: true });

    if (fs.existsSync(path.join(dir, 'requirements.txt'))) {
      await runCommand('pip', ['install', '-r', 'requirements.txt', '-t', dist], { cwd: dir });
    }
    // copy .py files
    fs.readdirSync(dir).forEach(f => {
      if (f.endsWith('.py')) {
        fs.copyFileSync(path.join(dir, f), path.join(dist, f));
      }
    });
    return dist;
  }
};
