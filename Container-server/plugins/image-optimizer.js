    const sharp = require('sharp');
    const path = require('path');
    const fs = require('fs');

    module.exports = function(hooks) {
    hooks.on('build:done', async ({ duration }) => {
        const dist = path.join(__dirname, '..', 'output', 'dist');
        const images = fs.readdirSync(dist).filter(f => /\.(png|jpe?g)$/.test(f));
        for (const img of images) {
        const p = path.join(dist, img);
        const base = img.replace(/\.(png|jpe?g)$/, '');
        await sharp(p)
            .resize(800)
            .toFile(path.join(dist, `${base}-800.webp`));
        }
        console.log(`Image-optimizer: processed ${images.length} images.`);
    });
    };
