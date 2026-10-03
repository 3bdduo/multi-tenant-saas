const path = require('path');
const sharp = require(path.resolve(__dirname, '../../clinic-saas back/node_modules/sharp'));

const frontPublic = path.resolve(__dirname, '../public');

async function optimize() {
  console.log('Optimizing images...');

  // 1. nabd-logo: 512x512 webp (high-res for modals & displays)
  await sharp(path.join(frontPublic, 'images', 'nabd-logo.jpeg'))
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(frontPublic, 'images', 'nabd-logo.webp'));

  // 2. nabd-logo-sm: 128x128 webp (for navbar, footer, icons)
  await sharp(path.join(frontPublic, 'images', 'nabd-logo.jpeg'))
    .resize(128, 128, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(frontPublic, 'images', 'nabd-logo-sm.webp'));

  // 3. arc-logo: 256x256 webp
  await sharp(path.join(frontPublic, 'logo', 'arc-logo.jpg'))
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(frontPublic, 'logo', 'arc-logo.webp'));

  // 4. also copy nabd-logo.webp into public/logo/
  await sharp(path.join(frontPublic, 'images', 'nabd-logo.jpeg'))
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(path.join(frontPublic, 'logo', 'nabd-logo.webp'));

  console.log('Images converted to WebP successfully!');
}

optimize().catch(console.error);
