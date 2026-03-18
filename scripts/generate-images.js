/**
 * Build-time image generator (GitHub Pages friendly).
 *
 * Input:  public/images/...(recursive).../*.{png,jpg,jpeg}
 * Output: dist/images-gen/<same-relative-dir>/<name>-w<width>.{avif,webp}
 *
 * Runtime convention (no manifest required):
 *   original: /images/foo.png
 *   variants: /images-gen/foo-w640.avif  (and .webp)
 *
 * Notes:
 * - We keep the original file as the ultimate fallback in <img src>.
 * - AVIF/WebP will be picked by supporting browsers via <picture>.
 * - The runtime mapping is implemented in `src/utils/media.ts`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';
import { Writable } from 'node:stream';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicImagesDir = path.join(rootDir, 'public', 'images');
const distDir = path.join(rootDir, 'dist');
const outRoot = path.join(distDir, 'images-gen');

/**
 * Output widths.
 * - Must include small widths for thumbs (details page thumbs, color swatches).
 * - Keep the list short enough to avoid massive dist size growth.
 * - If you change this list, also consider updating:
 *   - `src/utils/media.ts` DEFAULT_WIDTHS
 *   - any hardcoded `widths: [...]` passed by callers (thumbs etc.)
 */
const widths = [160, 240, 320, 640, 960, 1280, 1600];

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);

async function listFilesRecursive(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...await listFilesRecursive(full));
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function baseNameWithoutExt(filePath) {
  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
}

function relFromPublicImages(absPath) {
  const rel = path.relative(publicImagesDir, absPath);
  return rel;
}

function outPathForVariant(relPath, width, format) {
  const dir = path.dirname(relPath);
  const name = baseNameWithoutExt(relPath);
  const outRel = path.join(dir, `${name}-w${width}.${format}`);
  return path.join(outRoot, outRel);
}

async function fileSize(p) {
  try {
    const st = await fs.stat(p);
    return st.size;
  } catch {
    return 0;
  }
}

async function writeIfSmaller(outFile, buf, originalFile) {
  await ensureDir(path.dirname(outFile));
  const origSize = await fileSize(originalFile);
  if (origSize > 0 && buf.length >= origSize * 1.1) {
    // If variant is unexpectedly larger than original by 10%+, still write it.
    // Browsers will likely pick it due to srcset sizing; keep deterministic output.
  }
  await fs.writeFile(outFile, buf);
}

async function generateVariantsForFile(absPath) {
  const rel = relFromPublicImages(absPath);
  const ext = path.extname(rel).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return { rel, generated: 0 };

  /**
   * Skip very small images (icons, qrcodes, etc.).
   * For small assets the overhead of multiple variants can outweigh wins.
   */
  const st = await fs.stat(absPath);
  if (st.size < 8 * 1024) return { rel, generated: 0 };

  const img = sharp(absPath, { failOn: 'none' });
  const meta = await img.metadata();
  const w0 = meta.width ?? 0;
  const h0 = meta.height ?? 0;
  if (!w0 || !h0) return { rel, generated: 0 };

  /**
   * IMPORTANT: we generate the full `widths` list even when the original is slightly smaller.
   *
   * Why:
   * - Runtime srcset uses a fixed list of candidate widths (no manifest).
   * - If we omit a width (e.g. original 1500px but srcset contains 1600w),
   *   some browsers may pick the missing candidate and the image breaks.
   *
   * Trade-off:
   * - For originals smaller than a target width, this will upscale a bit.
   *   In practice our assets are high-res and the small upscale (e.g. 1500→1600)
   *   is visually acceptable and prevents broken images.
   */
  const effectiveWidths = widths.slice();

  let generated = 0;
  for (const w of effectiveWidths) {
    const resized = sharp(absPath, { failOn: 'none' }).resize({
      width: w
    });

    // AVIF: prioritize byte size (quality kept moderate)
    {
      const outFile = outPathForVariant(rel, w, 'avif');
      const buf = await resized
        .clone()
        .avif({
          quality: 45,
          effort: 4
        })
        .toBuffer();
      await writeIfSmaller(outFile, buf, absPath);
      generated++;
    }

    // WebP: good compatibility + strong compression
    {
      const outFile = outPathForVariant(rel, w, 'webp');
      const buf = await resized
        .clone()
        .webp({
          quality: 72,
          effort: 4
        })
        .toBuffer();
      await writeIfSmaller(outFile, buf, absPath);
      generated++;
    }
  }

  return { rel, generated };
}

async function computeGzipSize(filePath) {
  // Approximate transfer size (gzip) to help spot regressions.
  // Some formats are already compressed; gzip won't reduce much.
  const gzip = zlib.createGzip({ level: 6 });
  let total = 0;
  const sink = new Writable({
    write(chunk, _enc, cb) {
      total += chunk.length;
      cb();
    }
  });
  await pipeline(createReadStream(filePath), gzip, sink);
  return total;
}

async function main() {
  if (!existsSync(distDir)) {
    console.warn('[generate-images] dist/ not found. Run after vite build.');
    process.exit(0);
  }
  if (!existsSync(publicImagesDir)) {
    console.warn('[generate-images] public/images not found. Skip.');
    process.exit(0);
  }

  await ensureDir(outRoot);
  const files = await listFilesRecursive(publicImagesDir);
  const imageFiles = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  if (imageFiles.length === 0) {
    console.log('[generate-images] No images to process.');
    return;
  }

  console.log(`[generate-images] Found ${imageFiles.length} images in public/images`);

  // Simple concurrency limiter (avoid OOM).
  const concurrency = Math.max(2, Math.min(6, Number(process.env.IMG_CONCURRENCY || 4)));
  let idx = 0;
  let totalGenerated = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    for (;;) {
      const i = idx++;
      if (i >= imageFiles.length) break;
      const abs = imageFiles[i];
      try {
        const res = await generateVariantsForFile(abs);
        totalGenerated += res.generated;
      } catch (e) {
        console.warn('[generate-images] Failed:', abs, e?.message || e);
      }
    }
  });

  await Promise.all(workers);

  // Optional: write a build marker with a content hash of inputs (useful for debugging).
  const hash = crypto.createHash('sha256');
  hash.update(String(imageFiles.length));
  hash.update(String(Date.now()));
  await fs.writeFile(path.join(outRoot, '_build.txt'), `generated=${totalGenerated}\n`);

  console.log(`[generate-images] Generated ${totalGenerated} variants into dist/images-gen/`);
}

main().catch((e) => {
  console.error('[generate-images] Fatal:', e);
  process.exit(1);
});

