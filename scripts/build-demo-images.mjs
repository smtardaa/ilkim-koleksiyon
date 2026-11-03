/**
 * Demo ürün görsellerini WebP'ye çevirir.
 *
 * Girdi : kaynak görsellerin indirildiği klasör (DEMO_RAW_DIR/images/{kaynakId}-{sıra}.jpg)
 * Çıktı : public/demo/urun/{kaynakId}-{sıra}-{720|360}.webp
 *         demo-kaynak/gorsel-olculeri.json  (genişlik/yükseklik + içerik oranı)
 *
 * - Yalnızca düz beyaz kenar boşluğu kırpılır (eşik düşük); para kenarı kesilmez,
 *   ardından %3 beyaz pay eklenir. Filigranlar olduğu gibi kalır.
 * - Görsel üzerine metin/işaret eklenmez.
 *
 * Kullanım: node scripts/build-demo-images.mjs <DEMO_RAW_DIR>
 */
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = process.argv[2] ?? process.env.DEMO_RAW_DIR;
if (!RAW) { console.error('Kullanım: node scripts/build-demo-images.mjs <DEMO_RAW_DIR>'); process.exit(1); }
const SRC = join(RAW, 'images');
const OUT = 'public/demo/urun';
mkdirSync(OUT, { recursive: true });
mkdirSync('demo-kaynak', { recursive: true });

const metaPath = 'demo-kaynak/gorsel-olculeri.json';
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
const files = readdirSync(SRC).filter((f) => /^\d+-\d+\.jpg$/.test(f));
let done = 0, skipped = 0, failed = 0;

for (const f of files) {
  const key = f.replace(/\.jpg$/, '');
  const large = join(OUT, `${key}-720.webp`);
  const small = join(OUT, `${key}-360.webp`);
  if (meta[key] && existsSync(large) && existsSync(small)) { skipped++; continue; }
  try {
    const input = readFileSync(join(SRC, f));
    const orig = await sharp(input).metadata();
    // Beyaz zemini kırp (yalnızca kenarlardaki tekdüze açık renk)
    const { data: trimmed, info } = await sharp(input)
      .flatten({ background: '#ffffff' })
      .trim({ background: '#ffffff', threshold: 12 })
      .toBuffer({ resolveWithObject: true });
    const pad = Math.round(Math.max(info.width, info.height) * 0.03);
    const padded = await sharp(trimmed)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' })
      .toBuffer({ resolveWithObject: true });
    const w = padded.info.width, h = padded.info.height;
    const l = await sharp(padded.data).resize({ width: Math.min(720, w), height: Math.min(720, h), fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(large);
    const s = await sharp(padded.data).resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(small);
    meta[key] = {
      original: { width: orig.width, height: orig.height },
      contentAspect: +(info.width / info.height).toFixed(3),
      large: { width: l.width, height: l.height },
      small: { width: s.width, height: s.height },
    };
    done++;
  } catch (err) {
    meta[key] = { error: String(err.message ?? err).slice(0, 200) };
    failed++;
  }
  if ((done + failed) % 100 === 0) writeFileSync(metaPath, JSON.stringify(meta));
}
writeFileSync(metaPath, JSON.stringify(meta, null, 0));
console.log(`Görseller: ${done} işlendi, ${skipped} zaten vardı, ${failed} hata → ${OUT}`);
