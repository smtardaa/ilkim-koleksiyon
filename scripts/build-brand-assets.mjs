// Marka varlıklarını özgün logodan türetir. Özgün PNG değiştirilmez.
// Amblem: logodaki sikke bölgesi oransal olarak kırpılır (deforme edilmez, yazılar değiştirilmez).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'İLKİM KOLEKSİYON için Osmanlı sikkeli logo.png';
const OUT = 'public/brand';
mkdirSync(OUT, { recursive: true });

// Sikke merkezi ve yarıçapı (1254×1254 kaynak üzerinde ölçüldü)
const CX = 627, CY = 455, R = 290;
const box = { left: CX - R, top: CY - R, width: R * 2, height: R * 2 };
const circleMask = (s) => Buffer.from(`<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#fff"/></svg>`);

async function emblem(size, file) {
  await sharp(SRC).extract(box).resize(size, size)
    .composite([{ input: circleMask(size), blend: 'dest-in' }])
    .png({ compressionLevel: 9 }).toFile(`${OUT}/${file}`);
}
await emblem(96, 'amblem-96.png');
await emblem(192, 'amblem-192.png');
await sharp(SRC).extract(box).resize(512, 512).composite([{ input: circleMask(512), blend: 'dest-in' }]).webp({ quality: 86 }).toFile(`${OUT}/amblem-512.webp`);
await sharp(SRC).extract(box).resize(192, 192)
  .composite([{ input: circleMask(192), blend: 'dest-in' }]).webp({ quality: 88 }).toFile(`${OUT}/amblem-192.webp`);
// Favicon / apple-touch
await emblem(32, 'favicon-32.png');
await sharp(SRC).extract(box).resize(180, 180).flatten({ background: '#FAF8F2' }).png().toFile(`${OUT}/apple-touch-icon.png`);
// Tam logo (özgün oran 1:1, yalnızca yeniden boyutlandırma)
await sharp(SRC).resize(640, 640).webp({ quality: 86 }).toFile(`${OUT}/ilkim-koleksiyon-logo-640.webp`);
await sharp(SRC).resize(320, 320).webp({ quality: 86 }).toFile(`${OUT}/ilkim-koleksiyon-logo-320.webp`);
// Paylaşım görseli 1200×630: zümrüt zemin üzerinde logonun tamamı (kırpılmadan)
const logo = await sharp(SRC).resize(560, 560).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#003F35' } })
  .composite([{ input: logo, left: 320, top: 35 }]).jpeg({ quality: 84 }).toFile(`${OUT}/og-default.jpg`);
console.log('Marka varlıkları üretildi →', OUT);
