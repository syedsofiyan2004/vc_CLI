const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { EventEmitter } = require('events');
const Redis = require('ioredis');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
const pLimit = require('p-limit');

const hooks = new EventEmitter();
const publishLog = (msg) => {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log: msg }));
  hooks.emit('log', msg);
};

const publisher = new Redis(process.env.REDIS_URL);
const PROJECT_ID = process.env.PROJECT_ID;
const S3_BUCKET  = process.env.S3_BUCKET;
const s3Client   = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Spawn + stream helper
function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { shell: true, ...opts });
    p.stdout.on('data', d => publishLog(`[${cmd}] ${d}`));
    p.stderr.on('data', d => publishLog(`[${cmd}] ${d}`));
    p.on('error', reject);
    p.on('close', code => code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)));
  });
}

// Load all builder modules
function loadBuilders() {
  const B = path.join(__dirname, 'builders');
  if (!fs.existsSync(B)) return [];
  return fs.readdirSync(B)
    .filter(f => f.endsWith('.js'))
    .map(f => require(path.join(B, f)));
}

async function initDeploy() {
  const projectDir = path.join(__dirname, 'output');
  const builders  = loadBuilders();
  const builder   = builders.find(b => b.detect(projectDir));

  if (!builder) {
    publishLog('No builder matched – falling back to static-copy');
  } else {
    publishLog(`Using builder: ${builder.name}`);
  }

  // 1) Build step
  hooks.emit('build:start');
  publishLog('Build started…');
  const buildStart = Date.now();

  let distDir;
  if (builder) {
    distDir = await builder.build(projectDir, { runCommand, publishLog, hooks });
  } else {
    // static fallback: copy all files to /output/dist
    distDir = path.join(projectDir, 'dist');
    fs.mkdirSync(distDir, { recursive: true });
    fs.readdirSync(projectDir).forEach(f => {
      if (f !== 'dist') fs.copyFileSync(path.join(projectDir, f), path.join(distDir, f));
    });
  }

  const buildTime = Date.now() - buildStart;
  publishLog(`Build done in ${buildTime}ms → ${distDir}`);
  hooks.emit('build:done', { duration: buildTime, distDir });

  // 2) Upload step (unchanged parallel uploader)
  const files = fs.readdirSync(distDir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name);

  publishLog(`Uploading ${files.length} files…`);
  hooks.emit('upload:start', { count: files.length });

  const limit    = pLimit(5);
  const gitSha   = execSync(`git -C ${projectDir} rev-parse --short HEAD`).toString().trim();
  let totalBytes = 0;

  await Promise.all(files.map(f =>
    limit(async () => {
      const fp = path.join(distDir, f);
      const size = fs.statSync(fp).size;
      totalBytes += size;

      const cmd = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `__outputs/${PROJECT_ID}/${f}`,
        Body: fs.createReadStream(fp),
        ContentType: mime.lookup(fp) || 'application/octet-stream',
        Metadata: { commit: gitSha, builder: builder?.name || 'static' }
      });
      await s3Client.send(cmd);
      publishLog(`Uploaded ${f} (${size} bytes)`);
    })
  ));

  publishLog(`Upload complete: ${files.length} files, ${totalBytes} bytes`);
  hooks.emit('upload:done', { count: files.length, bytes: totalBytes });
  publishLog('✅ Deployment finished');
  hooks.emit('done');
}

if (require.main === module) {
  initDeploy().catch(err => {
    publishLog(`Error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { initDeploy, hooks };
