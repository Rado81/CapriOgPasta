#!/usr/bin/env node
/**
 * Writes the placeholder SVGs described in the spec (section 8).
 * Re-run any time: node tools/make-placeholders.mjs
 * Real photos replace these files later; see README "Swap images".
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img');
mkdirSync(out, { recursive: true });

const BLUE = '#1e4da1';
const BLUE_DARK = '#173d80';
const LEMON = '#f4c542';
const BG = '#faf7f0';
const esc = (s) => s.replace(/&/g, '&amp;');

function photo(width, height, label, dark) {
  const fill = dark ? 'url(#g)' : BG;
  const fg = dark ? BG : BLUE;
  const cx = Math.round(width * 0.78);
  const cy = Math.round(height * 0.3);
  const r = Math.round(height * 0.14);
  // The hero (dark) caption sits bottom-right, clear of the headline block and of object-fit crops; gallery captions stay centred.
  const tx = dark ? Math.round(width * 0.94) : width / 2;
  const anchor = dark ? 'end' : 'middle';
  const y1 = Math.round(height * (dark ? 0.7 : 0.52));
  const y2 = Math.round(height * (dark ? 0.76 : 0.62));
  const fs1 = Math.round(height * (dark ? 0.045 : 0.072));
  const fs2 = Math.round(height * (dark ? 0.03 : 0.045));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Placeholder: ${esc(label)}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE_DARK}"/><stop offset="1" stop-color="${BLUE}"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="${fill}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${LEMON}"/>
  <text x="${tx}" y="${y1}" text-anchor="${anchor}" font-family="Georgia, serif" font-size="${fs1}" fill="${fg}">Foto kommer</text>
  <text x="${tx}" y="${y2}" text-anchor="${anchor}" font-family="system-ui, sans-serif" font-size="${fs2}" fill="${fg}" opacity="0.8">${esc(label)}</text>
</svg>
`;
}

const files = {
  'hero.svg': photo(1600, 1000, 'food trucken', true),
  'gallery-1.svg': photo(800, 600, 'food trucken', false),
  'gallery-2.svg': photo(800, 600, 'pasta', false),
  'gallery-3.svg': photo(800, 600, 'focaccia', false),
  'gallery-4.svg': photo(800, 600, 'arancini', false),
  'gallery-5.svg': photo(800, 600, 'tiramisù', false),
  'gallery-6.svg': photo(800, 600, 'cannoli', false),
  'logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" role="img" aria-label="Capri&amp;Pasta">
  <circle cx="32" cy="32" r="22" fill="${LEMON}" stroke="${BLUE}" stroke-width="3"/>
  <text x="64" y="41" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="26" fill="${BLUE}">Capri&amp;Pasta</text>
</svg>
`,
  'favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="${LEMON}"/>
  <text x="32" y="41" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="24" fill="${BLUE}">C&amp;P</text>
</svg>
`,
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(out, name), svg);
  console.log(`wrote assets/img/${name}`);
}
