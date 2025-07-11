const fs   = require('fs');

module.exports = {
  name: 'dotnet',
  detect: dir =>
    fs.readdirSync(dir).some(f => f.endsWith('.csproj')),
  build: async (dir, { runCommand }) => {
    const dist = require('path').join(dir, 'dist');
    fs.mkdirSync(dist, { recursive: true });
    await runCommand('dotnet', ['publish', '-c', 'Release', '-o', dist], { cwd: dir });
    return dist;
  }
};
