import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const root = new URL('../', import.meta.url),
  brand = new URL('apps/web/public/brand/', root);
for (const size of [192, 512, 1024])
  await sharp(await readFile(new URL('app-icon.svg', brand)))
    .resize(size, size)
    .png()
    .toFile(decodeURIComponent(new URL(`icon-${size}.png`, brand).pathname));
await sharp(await readFile(new URL('maskable.svg', brand)))
  .resize(512, 512)
  .png()
  .toFile(decodeURIComponent(new URL('icon-maskable-512.png', brand).pathname));
await sharp(await readFile(new URL('app-icon.svg', brand)))
  .resize(180, 180)
  .png()
  .toFile(decodeURIComponent(new URL('apps/web/app/apple-icon.png', root).pathname));
const source = await readFile(new URL('apps/web/app/icon.svg', root));
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) {
  const png = await sharp(source).resize(size, size).png().toBuffer();
  images.push(png);
  await writeFile(new URL(`favicon-${size}.png`, brand), png);
}
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
for (let i = 0; i < sizes.length; i++) {
  const at = 6 + i * 16;
  head[at] = sizes[i];
  head[at + 1] = sizes[i];
  head.writeUInt16LE(1, at + 4);
  head.writeUInt16LE(32, at + 6);
  head.writeUInt32LE(images[i].length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
}
await writeFile(new URL('apps/web/app/favicon.ico', root), Buffer.concat([head, ...images]));
await sharp(await readFile(new URL('logo.svg', brand)))
  .resize({ width: 1410 })
  .png()
  .toFile(decodeURIComponent(new URL('logo-transparent.png', brand).pathname));
await sharp(await readFile(new URL('design/brand/brand-board.svg', root)))
  .png()
  .toFile(decodeURIComponent(new URL('design/brand/brand-board.png', root).pathname));
console.log('Brand icons, transparent logo and preview exported.');
