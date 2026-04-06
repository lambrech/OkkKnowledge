import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const logoSvg = readFileSync('public/icons/logo.svg');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(logoSvg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Favicon
await sharp(logoSvg)
  .resize(32, 32)
  .png()
  .toFile('public/favicon.png');
console.log('Generated favicon.png');

console.log('Done! All icons generated from logo.svg');
