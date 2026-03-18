type ImageFormat = 'avif' | 'webp';

export type ResponsiveImageOptions = {
  src: string; // original public path, e.g. "/images/foo.png"
  alt?: string;
  className?: string;
  sizes?: string;
  widths?: number[];
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  // If your CSS already enforces width/height, leave undefined.
  width?: number;
  height?: number;
};

const DEFAULT_WIDTHS = [160, 240, 320, 640, 960, 1280, 1600];

function getBaseUrl(): string {
  /**
   * IMPORTANT (GitHub Pages / subpath deployments)
   * - Vite's `import.meta.env.BASE_URL` is the only reliable way to generate runtime URLs
   *   that work for both local dev (`/`) and GitHub Pages (often `/<repo>/`).
   * - We only use it for generated variants under `dist/images-gen/`.
   * - The original fallback `<img src="/images/...">` remains root-relative and must
   *   continue to work with your hosting setup (public/ copied to dist/).
   */
  // Use `import.meta.env` directly so Vite can inject values in dev.
  const base = (import.meta as any).env?.BASE_URL ?? '/';
  return typeof base === 'string' && base.endsWith('/') ? base : `${base}/`;
}

function isDevEnv(): boolean {
  // In dev/test servers, `images-gen/` variants may not exist.
  // Returning plain <img> avoids broken images due to 404 on <source srcset>.
  return Boolean((import.meta as any).env?.DEV);
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizePublicSrc(src: string): string {
  /**
   * Normalize local public assets to root-relative paths.
   * - For this project, the responsive pipeline is designed around `/images/...`.
   * - Remote URLs are returned as-is (no responsive variants generated).
   */
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

function parsePathParts(src: string): { dir: string; name: string } | null {
  const s = normalizePublicSrc(src);
  const m = s.match(/^(.*)\/([^\/]+?)(\.[a-zA-Z0-9]+)?$/);
  if (!m) return null;
  const dir = m[1] || '';
  const file = m[2] || '';
  // m[3] is extension (optional)
  return { dir, name: file };
}

function buildVariantUrl(src: string, width: number, format: ImageFormat): string | null {
  const parts = parsePathParts(src);
  if (!parts) return null;
  /**
   * Variant path convention (NO manifest needed):
   * - build step generates variants under `dist/images-gen/**`
   * - runtime uses this deterministic mapping
   *
   * Example:
   *   original: /images/a/b/foo.png
   *   avif:     <BASE_URL>images-gen/a/b/foo-w640.avif
   *   webp:     <BASE_URL>images-gen/a/b/foo-w640.webp
   *
   * If you ever change the generator output layout, update this mapping and
   * the build-time helper in `scripts/generate-index.js` together.
   */
  const base = getBaseUrl();
  const withoutImagesPrefix = parts.dir.replace(/^\/images\/?/, ''); // "" or "a/b"
  const dirPart = withoutImagesPrefix ? `${withoutImagesPrefix.replace(/\/+$/g, '')}/` : '';
  return `${base}images-gen/${dirPart}${parts.name}-w${width}.${format}`.replace(/\/{2,}/g, '/');
}

function buildSrcset(src: string, widths: number[], format: ImageFormat): string | null {
  const entries: string[] = [];
  for (const w of widths) {
    const url = buildVariantUrl(src, w, format);
    if (!url) return null;
    entries.push(`${url} ${w}w`);
  }
  return entries.join(', ');
}

/**
 * Return HTML string for a responsive <picture> block.
 * Safe to use in template-string rendering.
 */
export function responsivePictureHTML(opts: ResponsiveImageOptions): string {
  const src = normalizePublicSrc(opts.src);
  const alt = opts.alt ?? '';
  const className = opts.className ?? '';
  const widths = (opts.widths?.length ? opts.widths : DEFAULT_WIDTHS).slice().sort((a, b) => a - b);
  const sizes = opts.sizes ?? '100vw';
  const loading = opts.loading ?? 'lazy';
  const decoding = opts.decoding ?? 'async';
  const fetchpriority = opts.fetchPriority ?? (loading === 'eager' ? 'high' : 'low');
  const wh =
    opts.width && opts.height
      ? ` width="${opts.width}" height="${opts.height}"`
      : '';

  /**
   * Progressive enhancement rules:
   * - Only `/images/**` participates in this repo's build-time responsive pipeline.
   * - Anything else (remote URL / data URL / other folders) falls back to `<img>`.
   * - Even for `/images/**`, if variants are missing at runtime, `<picture>` will
   *   naturally fall back to its `<img src="...">`.
   */
  const isLocal = src.startsWith('/images/');
  if (!isLocal) {
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" class="${escapeAttr(className)}" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchpriority}"${wh} />`;
  }

  // In dev, the variant folder is typically not present; use original directly.
  if (isDevEnv()) {
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" class="${escapeAttr(className)}" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchpriority}"${wh} />`;
  }

  const avifSrcset = buildSrcset(src, widths, 'avif');
  const webpSrcset = buildSrcset(src, widths, 'webp');

  // If variant URLs can't be built, fall back.
  if (!avifSrcset || !webpSrcset) {
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" class="${escapeAttr(className)}" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchpriority}"${wh} />`;
  }

  return [
    `<picture>`,
    /**
     * Source 顺序很关键：
     * - 在部分地区/网络环境下，AVIF 资源可能出现缓存命中率偏低或解码不稳定的情况
     *   （你描述的“内地慢、VPN快”属于常见表现）。
     * - 优先声明 WebP，让浏览器优先选 WebP（两者都存在且都由构建期生成），
     *   在兼容性与体验上更稳。
     */
    `  <source type="image/webp" srcset="${escapeAttr(webpSrcset)}" sizes="${escapeAttr(sizes)}" />`,
    `  <source type="image/avif" srcset="${escapeAttr(avifSrcset)}" sizes="${escapeAttr(sizes)}" />`,
    `  <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" class="${escapeAttr(className)}" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchpriority}"${wh} />`,
    `</picture>`
  ].join('\n');
}

/**
 * Create DOM <picture> element (for imperative rendering, e.g. Carousel).
 */
export function createResponsivePictureElement(opts: ResponsiveImageOptions): HTMLElement {
  // In dev/test, avoid <source> variants that may 404.
  if (isDevEnv()) {
    const img = document.createElement('img');
    img.src = normalizePublicSrc(opts.src);
    img.alt = opts.alt ?? '';
    if (opts.className) img.className = opts.className;
    img.loading = opts.loading ?? 'lazy';
    img.decoding = opts.decoding ?? 'async';
    const fp = opts.fetchPriority ?? (img.loading === 'eager' ? 'high' : 'low');
    // Prefer attribute (broad compatibility); set property only if present.
    img.setAttribute('fetchpriority', fp);
    if ('fetchPriority' in img) (img as any).fetchPriority = fp;
    if (opts.width && opts.height) {
      img.width = opts.width;
      img.height = opts.height;
    }
    return img;
  }

  const wrapper = document.createElement('picture');
  const src = normalizePublicSrc(opts.src);
  const widths = (opts.widths?.length ? opts.widths : DEFAULT_WIDTHS).slice().sort((a, b) => a - b);
  const sizes = opts.sizes ?? '100vw';

  const img = document.createElement('img');
  img.src = src;
  img.alt = opts.alt ?? '';
  if (opts.className) img.className = opts.className;
  img.loading = opts.loading ?? 'lazy';
  img.decoding = opts.decoding ?? 'async';
  const fp = opts.fetchPriority ?? (img.loading === 'eager' ? 'high' : 'low');
  img.setAttribute('fetchpriority', fp);
  if ('fetchPriority' in img) (img as any).fetchPriority = fp;
  if (opts.width && opts.height) {
    img.width = opts.width;
    img.height = opts.height;
  }

  const isLocal = src.startsWith('/images/');
  if (isLocal) {
    const webp = document.createElement('source');
    webp.type = 'image/webp';
    const webpSrcset = buildSrcset(src, widths, 'webp');
    if (webpSrcset) {
      webp.srcset = webpSrcset;
      webp.sizes = sizes;
      wrapper.appendChild(webp);
    }

    const avif = document.createElement('source');
    avif.type = 'image/avif';
    const avifSrcset = buildSrcset(src, widths, 'avif');
    if (avifSrcset) {
      avif.srcset = avifSrcset;
      avif.sizes = sizes;
      wrapper.appendChild(avif);
    }
  }

  wrapper.appendChild(img);
  return wrapper;
}

