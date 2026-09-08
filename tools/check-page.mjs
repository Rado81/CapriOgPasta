#!/usr/bin/env node
/**
 * Static checks for the Capri&Pasta landing page.
 * Usage: node tools/check-page.mjs [group ...]
 * Groups: assets font html css js size readme. No arguments runs all groups.
 * Exit code 1 when any check fails.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const knownGroups = ['assets', 'font', 'html', 'css', 'js', 'size', 'readme'];
const only = new Set(process.argv.slice(2));
for (const name of only) {
  if (!knownGroups.includes(name)) {
    console.error(`unknown group: ${name} (valid: ${knownGroups.join(' ')})`);
    process.exit(2);
  }
}
const results = [];

function check(group, name, ok, detail = '') {
  if (only.size && !only.has(group)) return;
  results.push({ group, name, ok: Boolean(ok), detail });
}
function read(rel) {
  const p = join(root, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}
function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

// ---------- assets
// hero.jpg, gallery-1..4.jpg and logo.png are real images; their existence is covered by the "local references exist" check below.
// The two icons must be PNGs of exact size.
const pngSpecs = [
  ['assets/img/favicon-64.png', 64, 64],
  ['assets/img/apple-touch-icon.png', 180, 180],
];
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (const [file, w, h] of pngSpecs) {
  const p = join(root, file);
  check('assets', `${file} exists`, existsSync(p));
  if (existsSync(p)) {
    const b = readFileSync(p);
    const isPng = b.length > 24 && b.subarray(0, 8).equals(PNG_SIG);
    check('assets', `${file} is a ${w}x${h} PNG`, isPng && b.readUInt32BE(16) === w && b.readUInt32BE(20) === h);
  }
}
{
  const p = join(root, 'assets/img/og-image.png');
  check('assets', 'assets/img/og-image.png exists', existsSync(p));
  if (existsSync(p)) {
    const b = readFileSync(p);
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const isPng = b.length > 24 && b.subarray(0, 8).equals(sig);
    const w = isPng ? b.readUInt32BE(16) : 0;
    const h = isPng ? b.readUInt32BE(20) : 0;
    check('assets', 'og-image.png is a 1200x630 PNG', isPng && w === 1200 && h === 630, `${w}x${h}`);
    check('assets', 'og-image.png under 150 KB', b.length < 150 * 1024, `${Math.round(b.length / 1024)} KB`);
  }
}

// ---------- font
{
  const p = join(root, 'assets/fonts/fraunces.woff2');
  check('font', 'assets/fonts/fraunces.woff2 exists', existsSync(p));
  if (existsSync(p)) {
    const b = readFileSync(p);
    check('font', 'fraunces.woff2 starts with the wOF2 signature', b.subarray(0, 4).toString('latin1') === 'wOF2');
    check('font', 'fraunces.woff2 under 150 KB', b.length < 150 * 1024, `${Math.round(b.length / 1024)} KB`);
  }
  const ofl = read('assets/fonts/OFL.txt');
  check('font', 'assets/fonts/OFL.txt exists and mentions the SIL Open Font License', ofl !== null && /SIL Open Font License/i.test(ofl));
}

// ---------- html
const SITE = 'https://rado81.github.io/CapriOgPasta/';
const FB = 'https://www.facebook.com/p/CapriPasta-61577987039291/';
const html = read('index.html');
check('html', 'index.html exists', html !== null);
if (html !== null) {
  const bodyStart = html.indexOf('<body');
  const body = bodyStart >= 0 ? html.slice(bodyStart) : '';
  check('html', 'has <html lang="da">', /<html\s+lang="da">/.test(html));
  check('html', 'has <body', bodyStart >= 0);

  // Translated text pairs are written Danish first, so the body's lang attributes must alternate da, en, da, en ...
  const seq = [...body.matchAll(/\slang="(da|en)"/g)].map((m) => m[1]);
  let breakAt = -1;
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] !== (i % 2 === 0 ? 'da' : 'en')) { breakAt = i; break; }
  }
  const pairsOk = seq.length > 0 && seq.length % 2 === 0 && breakAt === -1;
  check('html', `body lang attributes alternate da/en (${seq.length / 2} pairs)`, pairsOk,
    breakAt >= 0 ? `sequence breaks at lang attribute #${breakAt + 1} (${seq[breakAt]})` : (seq.length % 2 ? 'odd count' : ''));

  // data-da/data-en pairs
  const tags = [...html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/gi)];
  let i18nOk = true;
  const i18nBad = [];
  for (const [, tag, attrs] of tags) {
    const hasDa = /\sdata-da="/.test(attrs);
    const hasEn = /\sdata-en="/.test(attrs);
    const hasAttr = /\sdata-i18n-attr="/.test(attrs);
    if (!hasDa && !hasEn) continue;
    if (!(hasDa && hasEn) || (!hasAttr && tag.toLowerCase() !== 'title')) { i18nOk = false; i18nBad.push(tag); }
  }
  check('html', 'every data-da/data-en element has both values and a target attribute (or is <title>)', i18nOk, i18nBad.join(', '));
  check('html', '<title> carries data-da and data-en', /<title\s[^>]*data-da="[^"]+"[^>]*data-en="[^"]+"/.test(html));
  check('html', 'meta description carries data-i18n-attr="content"', /<meta\s+name="description"[^>]*data-i18n-attr="content"/.test(html));

  // links
  const telCount = count(html, 'href="tel:+4527248565"');
  check('html', 'tel: link appears 3 times (header, hero, contact)', telCount === 3, `${telCount} found`);
  check('html', 'mailto: link appears once', count(html, 'href="mailto:Capripasta2025@gmail.com"') === 1);
  const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
  const fbAnchors = anchors.filter((a) => a.includes(`href="${FB}"`));
  check('html', 'Facebook link appears 3 times (hero, find os, contact)', fbAnchors.length === 3, `${fbAnchors.length} found`);
  check('html', 'every Facebook link has target="_blank" and rel="noopener"',
    fbAnchors.length > 0 && fbAnchors.every((a) => a.includes('target="_blank"') && a.includes('rel="noopener"')));
  check('html', 'first link in body is the skip link to #main', /<body[^>]*>\s*<a\s+class="skip-link"\s+href="#main"/.test(html));

  // absolute site URL: canonical, og:url, og:image, JSON-LD url, JSON-LD image
  check('html', 'site URL appears exactly 5 times', count(html, SITE) === 5, `${count(html, SITE)} found`);
  check('html', 'no root-relative paths (leading slash)', !/\s(?:src|href)="\/(?!\/)/.test(html));

  // referenced local files exist
  const refs = [...html.matchAll(/\s(?:src|href)="((?:assets|styles|script)[^"]*)"/g)].map((m) => m[1]);
  const missing = refs.filter((r) => !existsSync(join(root, r)));
  check('html', `all ${refs.length} local references exist on disk`, refs.length > 0 && missing.length === 0, missing.join(', '));

  // required ids and head tags
  for (const id of ['main', 'menu', 'om-os', 'find-os', 'galleri', 'kontakt', 'lang-toggle', 'year']) {
    check('html', `has id="${id}"`, html.includes(`id="${id}"`));
  }
  check('html', 'body has id="top"', /<body\s+id="top"/.test(html));
  const headNeedles = [
    '<meta charset="utf-8">',
    'name="viewport"',
    'name="theme-color" content="#1e4da1"',
    'rel="canonical"',
    'rel="icon"',
    'property="og:title"',
    'property="og:image:width" content="1200"',
    'property="og:image:height" content="630"',
    'property="og:locale" content="da_DK"',
    'name="twitter:card" content="summary_large_image"',
    'type="application/ld+json"',
    '"@type": "FoodEstablishment"',
  ];
  for (const needle of headNeedles) check('html', `head contains ${needle}`, html.includes(needle));
  check('html', 'inline language script runs before the stylesheet',
    html.indexOf('capripasta-lang') > 0 && html.indexOf('capripasta-lang') < html.indexOf('styles.css'));
  // Run the real inline detection script with stubs: a saved choice wins, otherwise Danish regardless of browser language
  const inline = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
  check('html', 'inline detection script found (first <script> without attributes)', Boolean(inline));
  if (inline) {
    const run = (saved, lang) => {
      const doc = { documentElement: { lang: 'da' } };
      new Function('localStorage', 'navigator', 'document', inline)({ getItem: () => saved }, { language: lang }, doc);
      return doc.documentElement.lang;
    };
    const cases = [[null, 'da-DK', 'da'], [null, 'en-US', 'da'], [null, '', 'da'], ['en', 'da-DK', 'en'], ['da', 'en-US', 'da'], ['xx', 'da-DK', 'da']];
    const bad = cases.filter(([saved, lang, expected]) => run(saved, lang) !== expected);
    check('html', `inline detection script passes ${cases.length} locale/storage cases`, bad.length === 0, bad.length ? JSON.stringify(bad) : '');
  }
  check('html', 'script.js is loaded with defer', /<script\s+src="script.js"\s+defer><\/script>/.test(html));
  check('html', 'CVR placeholder is an HTML comment', /<!--[\s\S]*?CVR[\s\S]*?-->/.test(html));
  check('html', 'events line placeholder is an HTML comment', /<!--[\s\S]*?arrangement[\s\S]*?-->/.test(html));
  check('html', 'no prices in the page (no "kr" amounts)', !/\d+\s?kr\b/i.test(body));
  // Out-of-scope features must stay absent (spec section 10); pizza is unconfirmed (spec section 9)
  check('html', 'no <form> element', !/<form\b/i.test(html));
  check('html', 'no <iframe>, <embed> or <object> element', !/<(?:iframe|embed|object)\b/i.test(html));
  const menuSection = (body.match(/<section id="menu"[\s\S]*?<\/section>/) || [''])[0];
  check('html', 'menu section found for the pizza check', menuSection.length > 0);
  check('html', 'no mention of pizza in the menu (unconfirmed item; photos may show it)', !/pizza/i.test(menuSection));
  check('html', 'no external scripts', !/<script\b[^>]*\bsrc="https?:/i.test(html));
  check('html', 'no external stylesheets', ![...html.matchAll(/<link\b[^>]*>/gi)].some((m) => /rel="stylesheet"/i.test(m[0]) && /href="https?:/i.test(m[0])));
  check('html', 'no cookie access in the page', !/document\.cookie/i.test(html));
}

// ---------- css
const css = read('styles.css');
check('css', 'styles.css exists', css !== null);
if (css !== null) {
  const flat = css.replace(/\s+/g, ' ');
  check('css', 'hides English when Danish is active', /html\[lang="da"\] \[lang="en"\]/.test(flat));
  check('css', 'hides Danish when English is active', /html\[lang="en"\] \[lang="da"\]/.test(flat));
  check('css', 'language rule uses display: none !important', /\[lang="da"\][^{]*\{ ?display: none !important; ?\}/.test(flat));
  check('css', '@font-face loads assets/fonts/fraunces.woff2 with font-display: swap', /@font-face \{[^}]*fraunces\.woff2[^}]*font-display: swap/.test(flat));
  check('css', 'font-weight range 500 700 declared', /font-weight: 500 700/.test(flat));
  check('css', 'respects prefers-reduced-motion', css.includes('prefers-reduced-motion'));
  const tokens = {};
  for (const m of css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})\b/gi)) tokens[m[1]] = m[2].toLowerCase();
  const expected = {
    blue: '#1e4da1', 'blue-dark': '#173d80', lemon: '#f4c542', green: '#009246', red: '#ce2b37',
    bg: '#faf7f0', surface: '#ffffff', line: '#e8e2d6', text: '#1b1f2a', muted: '#5b6170',
  };
  for (const [name, hex] of Object.entries(expected)) check('css', `token --${name} is ${hex}`, tokens[name] === hex, tokens[name] || 'missing');
  const lum = (hex) => {
    const c = hex.slice(1);
    const ch = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const pairs = [['text', 'bg'], ['text', 'surface'], ['blue', 'bg'], ['surface', 'blue'], ['text', 'lemon'], ['muted', 'bg'], ['surface', 'blue-dark']];
  for (const [fg, bg] of pairs) {
    if (tokens[fg] && tokens[bg]) {
      const r = ratio(tokens[fg], tokens[bg]);
      check('css', `contrast --${fg} on --${bg} >= 4.5`, r >= 4.5, r.toFixed(2));
    }
  }
  check('css', 'lemon is never a text colour', !/(?:^|[^\w-])color:\s*var\(--lemon\)/.test(flat));
}

// ---------- js
const js = read('script.js');
check('js', 'script.js exists', js !== null);
if (js !== null) {
  check('js', 'uses the capripasta-lang storage key', js.includes("'capripasta-lang'"));
  check('js', 'wraps localStorage.setItem in try/catch', /try\s*\{[^}]*localStorage\.setItem/.test(js));
  check('js', 'applies data-i18n-attr values', js.includes('data-i18n-attr'));
  check('js', 'binds the #lang-toggle button', js.includes("getElementById('lang-toggle')"));
  check('js', 'sets the footer year', js.includes('getFullYear'));
  check('js', 'does not touch document.cookie', !js.includes('document.cookie'));
}

// ---------- size
{
  const files = ['index.html', 'styles.css', 'script.js'];
  const walk = (dir) => {
    for (const e of readdirSync(join(root, dir))) {
      const rel = `${dir}/${e}`;
      if (statSync(join(root, rel)).isDirectory()) walk(rel); else files.push(rel);
    }
  };
  if (existsSync(join(root, 'assets'))) walk('assets');
  let total = 0;
  const missing = [];
  for (const f of files) {
    const p = join(root, f);
    if (existsSync(p)) total += statSync(p).size; else missing.push(f);
  }
  check('size', `served files total under 2000 KB (${files.length} files)`, missing.length === 0 && total < 2000 * 1024,
    `${Math.round(total / 1024)} KB${missing.length ? ', missing: ' + missing.join(', ') : ''}`);
}

// ---------- readme
const readme = read('README.md');
check('readme', 'README.md exists', readme !== null);
if (readme !== null) {
  const sections = ['Run locally', 'Edit text', 'Change phone, email or Facebook', 'Swap images', 'Replace the logo', 'CVR', 'Deploy', 'Custom domain', 'Confirm with the owner'];
  for (const h of sections) check('readme', `README has a "${h}" section`, new RegExp(`^#+ .*${h}`, 'mi').test(readme));
}

// ---------- report
let fails = 0;
let lastGroup = '';
for (const r of results) {
  if (r.group !== lastGroup) { console.log(`\n[${r.group}]`); lastGroup = r.group; }
  if (!r.ok) fails++;
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
