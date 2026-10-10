import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Android adaptive icons (Pixel) crop to circle/squircle.
 * - any: full-bleed mark (launcher may still mask)
 * - maskable: mark scaled to ~66% safe zone so nothing is clipped
 */
function markSvg(scale = 1) {
  const g =
    scale === 1
      ? ''
      : ` transform="translate(256 256) scale(${scale}) translate(-256 -256)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#09090b"/>
  <g${g}>
    <path d="M368 148A160 160 0 1 0 368 364" stroke="#34d399" stroke-width="48" stroke-linecap="round"/>
    <path d="M160 256h192" stroke="#6ee7b7" stroke-width="40" stroke-linecap="round"/>
  </g>
</svg>`;
}

const anySvg = markSvg(1);
const maskableSvg = markSvg(0.66);

function render(svgSource, size) {
  const resvg = new Resvg(svgSource, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

mkdirSync(join(root, 'public', 'icons'), { recursive: true });

const jobs = [
  [join(root, 'public', 'favicon.svg'), null, null],
  [join(root, 'public', 'icons', 'icon-192.png'), anySvg, 192],
  [join(root, 'public', 'icons', 'icon-512.png'), anySvg, 512],
  [join(root, 'public', 'icons', 'icon-192-maskable.png'), maskableSvg, 192],
  [join(root, 'public', 'icons', 'icon-512-maskable.png'), maskableSvg, 512],
  [join(root, 'public', 'apple-touch-icon.png'), anySvg, 180],
];

writeFileSync(join(root, 'public', 'favicon.svg'), anySvg);

for (const [path, source, size] of jobs) {
  if (source == null || size == null) continue;
  writeFileSync(path, render(source, size));
  console.log(`wrote ${path} (${size}x${size})`);
}
