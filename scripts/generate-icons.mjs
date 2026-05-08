/*
 * Render the packetThrower icon pack from public/icon.svg.
 *
 * Outputs (all into public/):
 *   - favicon.ico      multi-size 16/32/48 ICO for legacy fallback
 *   - favicon-16.png   small browser tab favicon
 *   - favicon-32.png   retina browser tab favicon
 *   - apple-touch-icon.png    180×180 for iOS home screen
 *   - icon-192.png     PWA / Android home screen
 *   - icon-512.png     PWA / Android home screen
 *   - og-image.png     1200×630 social-share card (icon + wordmark on navy)
 *
 * Run with `pnpm run icons`. Idempotent — safe to re-run after editing icon.svg.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const publicDir = resolve(root, 'public');
const sourceSvgPath = resolve(publicDir, 'icon.svg');
const sourceSvg = readFileSync(sourceSvgPath);

mkdirSync(publicDir, { recursive: true });

const renderPng = (size) =>
	sharp(sourceSvg, { density: 384 })
		.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toBuffer();

const writePng = async (size, name) => {
	const buf = await renderPng(size);
	const out = resolve(publicDir, name);
	writeFileSync(out, buf);
	console.log(`  ${name.padEnd(24)} ${size}×${size}`);
};

const writeIco = async () => {
	const sizes = [16, 32, 48];
	const buffers = await Promise.all(sizes.map(renderPng));
	const ico = await toIco(buffers);
	const out = resolve(publicDir, 'favicon.ico');
	writeFileSync(out, ico);
	console.log(`  ${'favicon.ico'.padEnd(24)} ${sizes.map((s) => `${s}×${s}`).join(', ')}`);
};

/*
 * OG image: 1200×630 navy gradient, icon on the left, wordmark + tagline on the right.
 * Composed as an SVG so the gradient + text + icon stay vector until the final raster.
 * Uses Georgia / system serif as a fallback; on the live page the hero uses Fraunces
 * Variable, but social previews are rendered without web fonts so this is fine.
 */
const ogSvg = (iconSvg) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="og-bg" cx="35%" cy="35%" r="90%">
      <stop offset="0%" stop-color="#2e4368"/>
      <stop offset="55%" stop-color="#162237"/>
      <stop offset="100%" stop-color="#0a1426"/>
    </radialGradient>
    <radialGradient id="og-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f0c060" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#f0c060" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="1200" height="630" fill="url(#og-bg)"/>
  <ellipse cx="280" cy="315" rx="320" ry="320" fill="url(#og-glow)"/>

  <!-- The icon, embedded as SVG inside an SVG, scaled to 320×320 and placed at left. -->
  <g transform="translate(70, 155)">
    <svg width="320" height="320" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
      ${iconSvg.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '').match(/<svg[^>]*>([\s\S]*?)<\/svg>/)[1]}
    </svg>
  </g>

  <!-- Wordmark + tagline -->
  <g transform="translate(440, 0)">
    <text x="0" y="305"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="88"
          font-weight="600"
          fill="#fafbfd"
          letter-spacing="-2">packetThrower</text>
    <text x="0" y="360"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
          font-size="28"
          fill="#d3d8e1"
          letter-spacing="0.2">Tools for the people running the network.</text>
    <line x1="0" y1="400" x2="160" y2="400"
          stroke="#f0c060" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
`;

const writeOgImage = async () => {
	const composed = ogSvg(sourceSvg.toString('utf8'));
	const buf = await sharp(Buffer.from(composed)).png().toBuffer();
	const out = resolve(publicDir, 'og-image.png');
	writeFileSync(out, buf);
	console.log(`  ${'og-image.png'.padEnd(24)} 1200×630`);
};

console.log('Generating packetThrower icon pack…');
await writePng(16, 'favicon-16.png');
await writePng(32, 'favicon-32.png');
await writePng(180, 'apple-touch-icon.png');
await writePng(192, 'icon-192.png');
await writePng(512, 'icon-512.png');
await writeIco();
await writeOgImage();
console.log('Done.');
