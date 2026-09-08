# Capri&Pasta Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a bilingual (Danish/English) one-page "digital business card" for the Capri&Pasta food truck on GitHub Pages.

**Architecture:** One static `index.html` with both languages inline as adjacent `lang="da"` / `lang="en"` elements, two CSS rules that hide the inactive language, and a tiny deferred script for the toggle, localStorage and attribute translation. No build step, no framework, no runtime third-party requests. A dependency-free Node script (`tools/check-page.mjs`) is the test harness: every task first runs it to see the relevant group fail, then makes it pass.

**Tech Stack:** HTML5, CSS3, vanilla ES5-compatible JavaScript, Node 22 (only for the check script and asset generator), Python 3 (`http.server` for local serving), Playwright MCP tools (browser checks and the og-image screenshot), GitHub CLI (`gh`) for deployment.

**Spec:** `docs/superpowers/specs/2026-09-08-capri-pasta-landing-page-design.md`

## Global Constraints

- Every visible text exists in Danish and English. Translated text is a pair of adjacent elements, Danish first: `<span lang="da">…</span><span lang="en">…</span>` (or `<p lang="da">…</p><p lang="en">…</p>`). Text identical in both languages (dish names, phone number, brand name "Capri&Pasta") is written once with no `lang` attribute.
- Translated attributes use `data-da="…" data-en="…" data-i18n-attr="<attribute>"`; `<title>` uses `data-da`/`data-en` without `data-i18n-attr`.
- Section ids never change: `#menu`, `#om-os`, `#find-os`, `#galleri`, `#kontakt`, plus `#main` and `#top`.
- Phone link: `tel:+4527248565` (3 places: header, hero, contact). Email: `mailto:Capripasta2025@gmail.com` (1 place). Facebook: `https://www.facebook.com/p/CapriPasta-61577987039291/` (3 places: hero, find os, contact), each `target="_blank" rel="noopener"`.
- The site's absolute URL `https://rado81.github.io/CapriOgPasta/` appears in exactly 5 places, all in `<head>`: canonical, og:url, og:image, JSON-LD `url`, JSON-LD `image`. All other paths are relative (never a leading `/`).
- Colour tokens exactly: `--blue #1e4da1`, `--blue-dark #173d80`, `--lemon #f4c542`, `--green #009246`, `--red #ce2b37`, `--bg #faf7f0`, `--surface #ffffff`, `--line #e8e2d6`, `--text #1b1f2a`, `--muted #5b6170`. Lemon is never a text colour.
- No prices, no pizza, no claims not on the Facebook page. The events line and the CVR line ship as HTML comments.
- Total served size (html + css + js + assets) under 300 KB. Font file under 150 KB.
- No cookies, no analytics, no embeds, no contact form.
- Commands in this plan are for Git Bash on Windows (the Bash tool). Run them from the repo root `C:\Ondrive\OneDrive - crossjoin.dk\Desktop\ClaudeCode Projects\CapriOgPasta`.
- Every commit message ends with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## File Structure

| File | Responsibility |
| --- | --- |
| `tools/check-page.mjs` | Test harness. Static checks grouped as `assets`, `font`, `html`, `css`, `js`, `size`, `readme`. Exit 1 on any failure. |
| `tools/make-placeholders.mjs` | Generates the 9 placeholder SVGs. Re-runnable. |
| `tools/og-template.html` | 1200×630 page that is screenshotted into `assets/img/og-image.png`. |
| `assets/img/*.svg`, `assets/img/og-image.png` | Placeholder images, swapped for real photos later. |
| `assets/fonts/fraunces.woff2`, `assets/fonts/OFL.txt` | Self-hosted display font and its licence. |
| `index.html` | All markup, both languages, head metadata, JSON-LD, inline language-detection script. |
| `styles.css` | Tokens, font-face, language-hiding rules, layout, components. |
| `script.js` | `applyLang`, toggle button, localStorage, footer year. |
| `README.md` | Maintenance guide for Rado. |
| `.nojekyll` | Tells GitHub Pages to serve files as-is. |

Task order: 1 harness → 2 placeholders → 3 font → 4 HTML → 5 CSS → 6 JS → 7 og-image → 8 README → 9 full verification → 10 deploy (gated on Rado's go).

---

### Task 1: Check script (test harness) and `.nojekyll`

**Files:**
- Create: `tools/check-page.mjs`
- Create: `.nojekyll`

**Interfaces:**
- Produces: `node tools/check-page.mjs [group ...]` where groups are `assets font html css js size readme`. Prints `PASS`/`FAIL` per check and exits 1 if any check fails. Later tasks run their group and expect all PASS.

- [ ] **Step 1: Create the check script**

```js
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
const only = new Set(process.argv.slice(2));
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
const svgSpecs = [
  ['assets/img/hero.svg', '0 0 1600 1000'],
  ['assets/img/gallery-1.svg', '0 0 800 600'],
  ['assets/img/gallery-2.svg', '0 0 800 600'],
  ['assets/img/gallery-3.svg', '0 0 800 600'],
  ['assets/img/gallery-4.svg', '0 0 800 600'],
  ['assets/img/gallery-5.svg', '0 0 800 600'],
  ['assets/img/gallery-6.svg', '0 0 800 600'],
  ['assets/img/logo.svg', '0 0 240 64'],
  ['assets/img/favicon.svg', '0 0 64 64'],
];
for (const [file, viewBox] of svgSpecs) {
  const s = read(file);
  check('assets', `${file} exists`, s !== null);
  check('assets', `${file} has viewBox "${viewBox}"`, s !== null && s.includes(`viewBox="${viewBox}"`));
  check('assets', `${file} declares the SVG namespace`, s !== null && s.includes('xmlns="http://www.w3.org/2000/svg"'));
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
  // Run the real inline detection script with stubs: a saved choice wins, else the browser language, Danish only for "da…"
  const inline = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
  check('html', 'inline detection script found (first <script> without attributes)', Boolean(inline));
  if (inline) {
    const run = (saved, lang) => {
      const doc = { documentElement: { lang: 'da' } };
      new Function('localStorage', 'navigator', 'document', inline)({ getItem: () => saved }, { language: lang }, doc);
      return doc.documentElement.lang;
    };
    const cases = [[null, 'da-DK', 'da'], [null, 'en-US', 'en'], [null, '', 'en'], ['en', 'da-DK', 'en'], ['da', 'en-US', 'da'], ['xx', 'da-DK', 'da']];
    const bad = cases.filter(([saved, lang, expected]) => run(saved, lang) !== expected);
    check('html', `inline detection script passes ${cases.length} locale/storage cases`, bad.length === 0, bad.length ? JSON.stringify(bad) : '');
  }
  check('html', 'script.js is loaded with defer', /<script\s+src="script.js"\s+defer><\/script>/.test(html));
  check('html', 'CVR placeholder is an HTML comment', /<!--[\s\S]*?CVR[\s\S]*?-->/.test(html));
  check('html', 'events line placeholder is an HTML comment', /<!--[\s\S]*?arrangement[\s\S]*?-->/.test(html));
  check('html', 'no prices in the page (no "kr" amounts)', !/\d+\s?kr\b/i.test(body));
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
  check('css', 'lemon is never a text colour', !/color: var\(--lemon\)/.test(flat));
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
  check('size', `served files total under 300 KB (${files.length} files)`, missing.length === 0 && total < 300 * 1024,
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
```

Save it as `tools/check-page.mjs` (create the `tools` folder).

- [ ] **Step 2: Create `.nojekyll`**

Run: `touch .nojekyll` (an empty file in the repo root).

- [ ] **Step 3: Run the harness and confirm it fails everywhere**

Run: `node tools/check-page.mjs`
Expected: only `FAIL` lines, e.g. `FAIL  assets/img/hero.svg exists`, `FAIL  index.html exists`, `FAIL  styles.css exists`, and the last line `0 passed, 35 failed`, exit code 1. If Node reports a syntax error instead, fix the script before continuing.

- [ ] **Step 4: Confirm group filtering works**

Run: `node tools/check-page.mjs font`
Expected: only the `[font]` group prints, with `FAIL  assets/fonts/fraunces.woff2 exists` and `FAIL  assets/fonts/OFL.txt exists and mentions the SIL Open Font License`.

- [ ] **Step 5: Commit**

```bash
git add tools/check-page.mjs .nojekyll
git commit -m "test: add static check harness for the landing page" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 2: Placeholder images

**Files:**
- Create: `tools/make-placeholders.mjs`
- Create (generated): `assets/img/hero.svg`, `assets/img/gallery-1.svg` … `assets/img/gallery-6.svg`, `assets/img/logo.svg`, `assets/img/favicon.svg`

**Interfaces:**
- Consumes: `node tools/check-page.mjs assets` from Task 1.
- Produces: the nine SVG files above at the exact paths `index.html` (Task 4) references. `og-image.png` is produced later in Task 7, so one `assets` check stays FAIL until then.

- [ ] **Step 1: Run the assets group to see it fail**

Run: `node tools/check-page.mjs assets`
Expected: `FAIL  assets/img/hero.svg exists` and the other eight `exists` checks FAIL, exit code 1.

- [ ] **Step 2: Create the generator**

```js
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Placeholder: ${esc(label)}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE_DARK}"/><stop offset="1" stop-color="${BLUE}"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="${fill}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${LEMON}"/>
  <text x="${width / 2}" y="${Math.round(height * 0.52)}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(height * 0.072)}" fill="${fg}">Foto kommer</text>
  <text x="${width / 2}" y="${Math.round(height * 0.62)}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(height * 0.045)}" fill="${fg}" opacity="0.8">${esc(label)}</text>
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
```

Save it as `tools/make-placeholders.mjs`.

- [ ] **Step 3: Generate the files**

Run: `node tools/make-placeholders.mjs`
Expected: nine lines `wrote assets/img/…`, and `ls assets/img` lists `favicon.svg gallery-1.svg gallery-2.svg gallery-3.svg gallery-4.svg gallery-5.svg gallery-6.svg hero.svg logo.svg`.

- [ ] **Step 4: Run the assets group**

Run: `node tools/check-page.mjs assets`
Expected: all SVG checks PASS (27 lines). Exactly one FAIL remains: `FAIL  assets/img/og-image.png exists` (produced in Task 7). Exit code 1 is expected at this point.

- [ ] **Step 5: Eyeball one placeholder**

Open `assets/img/hero.svg` and `assets/img/logo.svg` with the Read tool (they render as images) or in a browser. Expected: hero is a blue gradient with a lemon circle and the text "Foto kommer / food trucken"; the logo is a lemon circle with a blue ring and blue "Capri&Pasta" text that fits inside the 240 px width.

- [ ] **Step 6: Commit**

```bash
git add tools/make-placeholders.mjs assets/img
git commit -m "feat: add placeholder image generator and SVG placeholders" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Self-hosted Fraunces font

**Files:**
- Create: `assets/fonts/fraunces.woff2`
- Create: `assets/fonts/OFL.txt`

**Interfaces:**
- Consumes: `node tools/check-page.mjs font`.
- Produces: `assets/fonts/fraunces.woff2`, a variable woff2 (weight axis, latin subset) that `styles.css` (Task 5) loads via `@font-face` with `font-weight: 500 700`.

- [ ] **Step 1: Run the font group to see it fail**

Run: `node tools/check-page.mjs font`
Expected: `FAIL  assets/fonts/fraunces.woff2 exists`, `FAIL  assets/fonts/OFL.txt exists …`, exit code 1.

- [ ] **Step 2: Download the font and licence from the Fontsource package on jsDelivr**

```bash
mkdir -p assets/fonts
curl -fsSL -o assets/fonts/fraunces.woff2 "https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/files/fraunces-latin-wght-normal.woff2"
curl -fsSL -o assets/fonts/OFL.txt "https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/LICENSE"
ls -la assets/fonts
head -c 4 assets/fonts/fraunces.woff2; echo
```

Expected: the last line prints `wOF2`, the woff2 is well under 150 KB, and `OFL.txt` contains "SIL Open Font License".

If the first `curl` fails (HTTP 404 or network error), use the Google Fonts CSS API instead. It serves a woff2 only to browser-like user agents, so the header matters:

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
curl -fsSL -A "$UA" "https://fonts.googleapis.com/css2?family=Fraunces:wght@500..700&display=swap" -o /tmp/fraunces.css
URL=$(awk '/\/\* latin \*\//{f=1} f && /src:/ {print; exit}' /tmp/fraunces.css | grep -o 'https://[^)]*')
echo "$URL"
curl -fsSL -o assets/fonts/fraunces.woff2 "$URL"
curl -fsSL -o assets/fonts/OFL.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/OFL.txt"
```

If both routes fail, stop and report to Rado. Do not commit a fake or empty font file, and do not change the check threshold.

- [ ] **Step 3: Run the font group**

Run: `node tools/check-page.mjs font`
Expected: all four checks PASS, including `fraunces.woff2 under 150 KB`, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add assets/fonts
git commit -m "feat: self-host Fraunces variable font with OFL licence" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: `index.html` (all markup, both languages)

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `node tools/check-page.mjs html`; the placeholder paths from Task 2.
- Produces: the DOM contract used by Task 5 (class names below) and Task 6: `<html lang>`, `#lang-toggle` button, elements with `data-da`/`data-en`/`data-i18n-attr`, `#year` span. Class names: `skip-link tricolore site-header header-inner brand site-nav header-actions phone-link phone-text lang-toggle icon hero hero-img hero-overlay hero-content eyebrow hero-sub hero-actions btn btn-primary btn-secondary section section-menu section-about section-find section-gallery section-contact container narrow center section-intro menu-grid card card-subtitle dish-list footnote small gallery-grid contact-list contact-label site-footer`.

- [ ] **Step 1: Run the html group to see it fail**

Run: `node tools/check-page.mjs html`
Expected: `FAIL  index.html exists`, exit code 1.

- [ ] **Step 2: Write `index.html`**

Copy this file exactly. Attribute order matters for three checks: `<a class="skip-link" href="#main">`, `<body id="top">`, `<script src="script.js" defer></script>`.

```html
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    (function () {
      var l = null;
      try { l = localStorage.getItem('capripasta-lang'); } catch (e) {}
      if (l !== 'da' && l !== 'en') {
        l = (navigator.language || '').toLowerCase().indexOf('da') === 0 ? 'da' : 'en';
      }
      document.documentElement.lang = l;
    })();
  </script>
  <title data-da="Capri&amp;Pasta · Italiensk food truck i Greve og omegn" data-en="Capri&amp;Pasta · Italian food truck in and around Greve">Capri&amp;Pasta · Italiensk food truck i Greve og omegn</title>
  <meta name="description" content="Autentisk italiensk mad og desserter fra vores food truck. Frisk pasta, focaccia, tiramisù og kaffe to-go. Find dagens placering på Facebook." data-da="Autentisk italiensk mad og desserter fra vores food truck. Frisk pasta, focaccia, tiramisù og kaffe to-go. Find dagens placering på Facebook." data-en="Authentic Italian food and desserts from our food truck. Fresh pasta, focaccia, tiramisù and coffee to go. Find today's location on Facebook." data-i18n-attr="content">
  <meta name="theme-color" content="#1e4da1">
  <link rel="canonical" href="https://rado81.github.io/CapriOgPasta/">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Capri&amp;Pasta · Italiensk food truck i Greve og omegn">
  <meta property="og:description" content="Autentisk italiensk mad og desserter fra vores food truck. Frisk pasta, focaccia, tiramisù og kaffe to-go. Find dagens placering på Facebook.">
  <meta property="og:url" content="https://rado81.github.io/CapriOgPasta/">
  <meta property="og:image" content="https://rado81.github.io/CapriOgPasta/assets/img/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="da_DK">
  <meta property="og:locale:alternate" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="styles.css">
  <script src="script.js" defer></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": "Capri&Pasta",
    "servesCuisine": "Italian",
    "telephone": "+4527248565",
    "email": "Capripasta2025@gmail.com",
    "url": "https://rado81.github.io/CapriOgPasta/",
    "image": "https://rado81.github.io/CapriOgPasta/assets/img/og-image.png",
    "areaServed": "Greve, Denmark",
    "sameAs": ["https://www.facebook.com/p/CapriPasta-61577987039291/"]
  }
  </script>
</head>
<body id="top">
  <a class="skip-link" href="#main"><span lang="da">Spring til indhold</span><span lang="en">Skip to content</span></a>
  <div class="tricolore" aria-hidden="true"></div>

  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="#top"><img src="assets/img/logo.svg" alt="Capri&amp;Pasta" width="240" height="64"></a>
      <nav class="site-nav" aria-label="Menu">
        <a href="#menu">Menu</a>
        <a href="#om-os"><span lang="da">Om os</span><span lang="en">About</span></a>
        <a href="#find-os"><span lang="da">Find os</span><span lang="en">Find us</span></a>
        <a href="#kontakt"><span lang="da">Kontakt</span><span lang="en">Contact</span></a>
      </nav>
      <div class="header-actions">
        <a class="phone-link" href="tel:+4527248565">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/></svg>
          <span class="phone-text">27 24 85 65</span>
        </a>
        <button id="lang-toggle" class="lang-toggle" type="button" aria-label="Switch to English" data-da="Switch to English" data-en="Skift til dansk" data-i18n-attr="aria-label"><span lang="da">EN</span><span lang="en">DA</span></button>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <img class="hero-img" src="assets/img/hero.svg" alt="Capri&amp;Pasta food trucken" data-da="Capri&amp;Pasta food trucken" data-en="The Capri&amp;Pasta food truck" data-i18n-attr="alt" width="1600" height="1000">
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="container hero-content">
        <p class="eyebrow"><span lang="da">Italiensk food truck</span><span lang="en">Italian food truck</span></p>
        <h1 id="hero-title"><span lang="da">Autentisk italiensk mad, lige fra vores food truck</span><span lang="en">Authentic Italian food, straight from our food truck</span></h1>
        <p class="hero-sub"><span lang="da">Frisk pasta, focaccia og italienske desserter. Find os i Greve og omegn.</span><span lang="en">Fresh pasta, focaccia and Italian desserts. Find us in and around Greve.</span></p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+4527248565"><span lang="da">Ring til os</span><span lang="en">Call us</span></a>
          <a class="btn btn-secondary" href="https://www.facebook.com/p/CapriPasta-61577987039291/" target="_blank" rel="noopener"><span lang="da">Find os på Facebook</span><span lang="en">Find us on Facebook</span></a>
        </div>
      </div>
    </section>

    <section id="menu" class="section section-menu" aria-labelledby="menu-title">
      <div class="container">
        <h2 id="menu-title"><span lang="da">Menuen</span><span lang="en">The menu</span></h2>
        <p class="section-intro"><span lang="da">Et udpluk af det, du finder i vognen.</span><span lang="en">A taste of what you'll find at the truck.</span></p>
        <div class="menu-grid">
          <article class="card">
            <h3><span lang="da">Pasta &amp; varme retter</span><span lang="en">Pasta &amp; hot dishes</span></h3>
            <ul class="dish-list">
              <li>Pasta fresca</li>
              <li>Cannelloni</li>
              <li>Arancini</li>
            </ul>
          </article>
          <article class="card">
            <h3>Focaccia</h3>
            <ul class="dish-list">
              <li>Parma</li>
              <li>Mortadella</li>
              <li>Porchetta</li>
              <li>Vegetariano</li>
            </ul>
          </article>
          <article class="card">
            <h3>Dolci</h3>
            <p class="card-subtitle"><span lang="da">Desserter</span><span lang="en">Desserts</span></p>
            <ul class="dish-list">
              <li>Tiramisù</li>
              <li>Panna cotta</li>
              <li>Cannoli</li>
              <li>Pistacchio</li>
            </ul>
          </article>
          <article class="card">
            <h3><span lang="da">Kaffe to-go</span><span lang="en">Coffee to go</span></h3>
            <p><span lang="da">Italiensk kaffe, klar til at tage med.</span><span lang="en">Italian coffee, ready to take away.</span></p>
          </article>
        </div>
        <p class="footnote"><span lang="da">Udvalget kan variere fra dag til dag.</span><span lang="en">The selection varies from day to day.</span></p>
      </div>
    </section>

    <section id="om-os" class="section section-about" aria-labelledby="about-title">
      <div class="container narrow">
        <h2 id="about-title"><span lang="da">Om Capri&amp;Pasta</span><span lang="en">About Capri&amp;Pasta</span></h2>
        <p lang="da">Capri&amp;Pasta er en italiensk food truck med autentisk italiensk mad og desserter.</p>
        <p lang="en">Capri&amp;Pasta is an Italian food truck serving authentic Italian food and desserts.</p>
        <p lang="da">Vi laver frisk pasta, fyldt focaccia og klassiske italienske desserter som tiramisù og cannoli.</p>
        <p lang="en">We make fresh pasta, filled focaccia and classic Italian desserts like tiramisù and cannoli.</p>
        <p lang="da">Du finder os i Greve og omegn. Kig forbi vognen, eller følg os på Facebook for at se, hvor vi holder i dag.</p>
        <p lang="en">You'll find us in and around Greve. Stop by the truck, or follow us on Facebook to see where we are today.</p>
        <!-- Confirm with the owner before enabling these two lines (private events / arrangement):
        <p lang="da">Vi kommer også gerne ud til dit arrangement. Ring eller skriv til os.</p>
        <p lang="en">We also come out to private events. Call or write to us.</p>
        -->
      </div>
    </section>

    <section id="find-os" class="section section-find" aria-labelledby="find-title">
      <div class="container narrow center">
        <h2 id="find-title"><span lang="da">Find os</span><span lang="en">Find us</span></h2>
        <p lang="da">Vores food truck skifter plads. Dagens placering og åbningstid lægger vi op på Facebook.</p>
        <p lang="en">Our food truck moves around. We post today's location and opening hours on Facebook.</p>
        <a class="btn btn-primary" href="https://www.facebook.com/p/CapriPasta-61577987039291/" target="_blank" rel="noopener"><span lang="da">Se dagens placering</span><span lang="en">See today's location</span></a>
        <p class="small"><span lang="da">Følg os, og se hvor vi holder næste gang.</span><span lang="en">Follow us to see where we'll be next.</span></p>
      </div>
    </section>

    <section id="galleri" class="section section-gallery" aria-labelledby="gallery-title">
      <div class="container">
        <h2 id="gallery-title"><span lang="da">Galleri</span><span lang="en">Gallery</span></h2>
        <div class="gallery-grid">
          <figure><img src="assets/img/gallery-1.svg" alt="Capri&amp;Pasta food trucken" data-da="Capri&amp;Pasta food trucken" data-en="The Capri&amp;Pasta food truck" data-i18n-attr="alt" width="800" height="600" loading="lazy"></figure>
          <figure><img src="assets/img/gallery-2.svg" alt="Frisk pasta" data-da="Frisk pasta" data-en="Fresh pasta" data-i18n-attr="alt" width="800" height="600" loading="lazy"></figure>
          <figure><img src="assets/img/gallery-3.svg" alt="Focaccia" width="800" height="600" loading="lazy"></figure>
          <figure><img src="assets/img/gallery-4.svg" alt="Arancini" width="800" height="600" loading="lazy"></figure>
          <figure><img src="assets/img/gallery-5.svg" alt="Tiramisù" width="800" height="600" loading="lazy"></figure>
          <figure><img src="assets/img/gallery-6.svg" alt="Cannoli" width="800" height="600" loading="lazy"></figure>
        </div>
      </div>
    </section>

    <section id="kontakt" class="section section-contact" aria-labelledby="contact-title">
      <div class="container narrow">
        <h2 id="contact-title"><span lang="da">Kontakt</span><span lang="en">Contact</span></h2>
        <ul class="contact-list">
          <li>
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/></svg>
            <span class="contact-label"><span lang="da">Telefon</span><span lang="en">Phone</span></span>
            <a href="tel:+4527248565">+45 27 24 85 65</a>
          </li>
          <li>
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2 .4V18h16V6.4l-8 5.3-8-5.3zM4.6 6l7.4 4.9L19.4 6H4.6z"/></svg>
            <span class="contact-label"><span lang="da">E-mail</span><span lang="en">Email</span></span>
            <a href="mailto:Capripasta2025@gmail.com">Capripasta2025@gmail.com</a>
          </li>
          <li>
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7h2.9z"/></svg>
            <span class="contact-label">Facebook</span>
            <a href="https://www.facebook.com/p/CapriPasta-61577987039291/" target="_blank" rel="noopener"><span lang="da">Capri&amp;Pasta på Facebook</span><span lang="en">Capri&amp;Pasta on Facebook</span></a>
          </li>
        </ul>
        <!-- CVR: uncomment and fill in when the owner supplies the number
        <p class="cvr">CVR: 00000000</p>
        -->
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© <span id="year">2026</span> Capri&amp;Pasta</p>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 3: Run the html group**

Run: `node tools/check-page.mjs html`
Expected: every check PASS except one: `FAIL  all 11 local references exist on disk  (styles.css, script.js)`. Those two files arrive in Tasks 5 and 6. The pairs line must read `body lang attributes alternate da/en (31 pairs)`. If any other check fails, fix the HTML until only that one remains.

- [ ] **Step 4: Validate with the W3C Nu checker**

```bash
V=$(mktemp)
curl -s -H "Content-Type: text/html; charset=utf-8" --data-binary @index.html "https://validator.w3.org/nu/?out=json" > "$V"
node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const e=r.messages.filter(m=>m.type==='error');console.log(e.length+' errors');e.forEach(m=>console.log('line '+m.lastLine+': '+m.message));process.exit(e.length?1:0)" "$V"
```

Expected: `0 errors`. Warnings (type `info`) are acceptable. If an error names an attribute on `<meta property>`, that is a validator quirk about RDFa and can be ignored only if it is the sole error; anything else gets fixed.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add bilingual landing page markup" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: `styles.css`

**Files:**
- Create: `styles.css`

**Interfaces:**
- Consumes: the class names and `lang` attributes from Task 4; `assets/fonts/fraunces.woff2` from Task 3; `node tools/check-page.mjs css`.
- Produces: the two language-hiding rules that Task 6's script relies on (it only flips `document.documentElement.lang`; CSS does the showing and hiding).

- [ ] **Step 1: Run the css group to see it fail**

Run: `node tools/check-page.mjs css`
Expected: `FAIL  styles.css exists`, exit code 1.

- [ ] **Step 2: Write `styles.css`**

```css
/* Capri&Pasta landing page. Order: tokens, font, language rules, base, header, hero, buttons, sections, cards, gallery, contact, footer, breakpoints. */

:root {
  --blue: #1e4da1;
  --blue-dark: #173d80;
  --lemon: #f4c542;
  --green: #009246;
  --red: #ce2b37;
  --bg: #faf7f0;
  --surface: #ffffff;
  --line: #e8e2d6;
  --text: #1b1f2a;
  --muted: #5b6170;
  --radius: 16px;
  --container: 1100px;
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

@font-face {
  font-family: "Fraunces";
  src: url("assets/fonts/fraunces.woff2") format("woff2");
  font-weight: 500 700;
  font-style: normal;
  font-display: swap;
}

/* Language switching: the inactive language is hidden. Both languages stay in the DOM. */
html[lang="da"] [lang="en"],
html[lang="en"] [lang="da"] { display: none !important; }

/* Base */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-padding-top: 5rem; }
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}
img { max-width: 100%; height: auto; display: block; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.15; margin: 0 0 0.5em; }
h1 { font-size: clamp(2.2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); color: var(--blue); }
h3 { font-size: 1.25rem; }
p { margin: 0 0 1rem; }
a { color: var(--blue); }
:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
.hero :focus-visible,
.section-find :focus-visible { outline-color: #fff; }

.container { width: 100%; max-width: var(--container); margin: 0 auto; padding: 0 1.25rem; }
.container.narrow { max-width: 720px; }
.center { text-align: center; }

/* Skip link: visible only when focused */
.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 100;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: var(--lemon);
  color: var(--text);
  font-weight: 700;
  text-decoration: none;
}
.skip-link:focus { top: 1rem; }

/* Tricolore line + sticky header */
.tricolore {
  height: 4px;
  background: linear-gradient(90deg, var(--green) 0 33.33%, #fff 33.33% 66.66%, var(--red) 66.66% 100%);
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(250, 247, 240, 0.94);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.header-inner { display: flex; align-items: center; gap: 1rem; min-height: 64px; }
.brand { display: inline-flex; }
.brand img { width: 150px; height: 40px; }
.site-nav { display: none; gap: 1.5rem; margin-left: auto; }
.site-nav a { color: var(--text); font-weight: 600; text-decoration: none; }
.site-nav a:hover { color: var(--blue); }
.header-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.phone-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 44px;
  min-height: 44px;
  color: var(--blue);
  font-weight: 700;
  text-decoration: none;
}
.icon { width: 24px; height: 24px; fill: currentColor; flex-shrink: 0; }
.phone-link .icon { width: 22px; height: 22px; }
.lang-toggle {
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 2px solid var(--blue);
  border-radius: 999px;
  background: transparent;
  color: var(--blue);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.lang-toggle:hover { background: var(--blue); color: #fff; }

/* Under 768 px the phone number text is hidden visually but stays readable for screen readers */
@media (max-width: 767.98px) {
  .phone-text {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* Hero */
.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 60vh;
  overflow: hidden;
  color: #fff;
}
.hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(23, 61, 128, 0.15) 0%, rgba(20, 24, 40, 0.78) 100%);
}
.hero-content { position: relative; padding-top: 4rem; padding-bottom: 3rem; }
.eyebrow {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.eyebrow::before {
  content: "";
  display: inline-block;
  width: 2rem;
  height: 3px;
  margin-right: 0.75rem;
  vertical-align: middle;
  background: var(--lemon);
}
.hero h1 { max-width: 16ch; color: #fff; }
.hero-sub { max-width: 42ch; font-size: 1.15rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease;
}
.btn-primary { background: var(--lemon); color: var(--text); }
.btn-primary:hover { background: #e6b83c; }
.btn-secondary { border: 2px solid #fff; background: transparent; color: #fff; }
.btn-secondary:hover { background: #fff; color: var(--text); }

/* Sections */
.section { padding: 4rem 0; }
.section-menu { background: var(--bg); }
.section-about { background: var(--surface); }
.section-find { background: var(--blue); color: #fff; }
.section-find h2 { color: #fff; }
.section-gallery { background: var(--surface); }
.section-contact { background: var(--bg); }
.section-intro { max-width: 50ch; margin-bottom: 2rem; color: var(--muted); font-size: 1.1rem; }
.footnote, .small { margin-top: 1.5rem; margin-bottom: 0; color: var(--muted); font-size: 0.9rem; }
.section-find .small { color: rgba(255, 255, 255, 0.85); }

/* Menu cards */
.menu-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
.card {
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-top: 4px solid var(--lemon);
  border-radius: var(--radius);
  background: var(--surface);
  transition: transform 150ms ease;
}
.card h3 { margin-bottom: 0.25rem; color: var(--blue); }
.card p { margin-bottom: 0; }
.card-subtitle { margin-bottom: 0.75rem; color: var(--muted); font-size: 0.9rem; }
.dish-list { margin: 0; padding: 0; list-style: none; }
.dish-list li { padding: 0.35rem 0; border-bottom: 1px dashed var(--line); }
.dish-list li:last-child { border-bottom: 0; }
@media (prefers-reduced-motion: no-preference) {
  .card:hover { transform: translateY(-2px); }
}

/* Gallery */
.gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.gallery-grid figure { margin: 0; }
.gallery-grid img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px; }

/* Contact */
.contact-list { display: grid; gap: 1rem; margin: 0; padding: 0; list-style: none; }
.contact-list li {
  display: grid;
  grid-template-columns: 28px 1fr;
  column-gap: 0.75rem;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}
.contact-list .icon { grid-row: span 2; color: var(--blue); }
.contact-label { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.contact-list a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 1.1rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

/* Footer */
.site-footer { padding: 1.5rem 0; background: var(--blue-dark); color: #fff; font-size: 0.9rem; text-align: center; }
.site-footer p { margin: 0; }

/* Breakpoints */
@media (min-width: 640px) {
  .menu-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .container { padding: 0 2rem; }
  .site-nav { display: flex; }
  .header-actions { margin-left: 0; }
  .hero { min-height: 70vh; }
  .hero-content { padding-bottom: 4rem; }
  .section { padding: 6rem 0; }
  .gallery-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .menu-grid { grid-template-columns: repeat(4, 1fr); }
}
```

- [ ] **Step 3: Run the css and html groups**

Run: `node tools/check-page.mjs css html`
Expected: every `[css]` check PASS, including the seven contrast checks (ratios roughly: text/bg 15.4, text/surface 16.5, blue/bg 7.5, surface/blue 8.0, text/lemon 10.1, muted/bg 5.8, surface/blue-dark 10.4). In `[html]` the only FAIL is `all 11 local references exist on disk  (script.js)`.

- [ ] **Step 4: Visual check at two widths**

Start a local server in the background (Bash tool with `run_in_background: true`):

```bash
python -m http.server 8000
```

Load the Playwright tools once with ToolSearch: `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_resize,mcp__plugin_playwright_playwright__browser_take_screenshot,mcp__plugin_playwright_playwright__browser_evaluate,mcp__plugin_playwright_playwright__browser_console_messages,mcp__plugin_playwright_playwright__browser_click,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_network_requests,mcp__plugin_playwright_playwright__browser_close`.

Then:

1. `browser_resize` to width 1280, height 800. `browser_navigate` to `http://localhost:8000/`. Playwright's browser reports an English locale, so the inline script opens the page in English. Force Danish for the screenshots with `browser_evaluate`: `() => { localStorage.setItem('capripasta-lang', 'da'); location.reload(); }`. Then `browser_take_screenshot` (png, `fullPage: true`, filename `.playwright-mcp/desktop-da.png`) and view it with the Read tool. A console 404 for `script.js` is expected until Task 6.
   Expected: tricolore line, sticky header with logo, four nav links, phone number and an "EN" pill; hero with the blue placeholder, white headline and two buttons; four menu cards in one row; about text; blue "Find os" band with a lemon button; six gallery tiles in two rows of three; three contact rows; dark blue footer.
2. `browser_resize` to width 375, height 812. Screenshot again (`.playwright-mcp/mobile-da.png`).
   Expected: nav links hidden, phone icon only, toggle visible; menu cards stacked in one column; gallery two columns; no element cut off at the right edge.
3. `browser_evaluate` with `() => document.documentElement.scrollWidth === window.innerWidth`.
   Expected: `true` (no horizontal scroll at 375 px). If false, find the overflowing element with `() => [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > window.innerWidth).map(e => e.tagName + '.' + e.className).slice(0, 10)` and fix the CSS.

Leave the server running for Task 6, or stop it with:

```bash
netstat -ano | grep ':8000 ' | awk '{print $5}' | head -1 | xargs -I{} taskkill //PID {} //F
```

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "feat: add landing page styles with language-hiding rules" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 6: `script.js` (toggle, attribute translation, year)

**Files:**
- Create: `script.js`

**Interfaces:**
- Consumes: `#lang-toggle`, `[data-da][data-en]` elements with optional `data-i18n-attr`, `#year` from Task 4; the language-hiding CSS from Task 5; `node tools/check-page.mjs js`.
- Produces: `applyLang(lang)` (module-private) that sets `document.documentElement.lang` and copies `data-da`/`data-en` into the target attribute or `textContent`; the storage key `capripasta-lang` shared with the inline head script.

- [ ] **Step 1: Run the js group to see it fail**

Run: `node tools/check-page.mjs js`
Expected: `FAIL  script.js exists`, exit code 1.

- [ ] **Step 2: Write `script.js`**

```js
/* Capri&Pasta: language toggle, attribute translation, footer year. Loaded with defer. */
(function () {
  'use strict';

  var KEY = 'capripasta-lang';
  var root = document.documentElement;

  // Sets <html lang> and copies the matching data-da / data-en value into each translated attribute.
  function applyLang(lang) {
    root.lang = lang;
    var nodes = document.querySelectorAll('[data-da][data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = el.getAttribute('data-' + lang);
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    }
  }

  function save(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      // Storage blocked (private mode or strict settings): the choice lasts for this page load only.
    }
  }

  // The inline script in <head> already chose the language; sync the translated attributes to it.
  var current = root.lang === 'en' ? 'en' : 'da';
  applyLang(current);

  var toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      current = current === 'da' ? 'en' : 'da';
      applyLang(current);
      save(current);
    });
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
```

- [ ] **Step 3: Run the js and html groups**

Run: `node tools/check-page.mjs js html`
Expected: every check PASS in both groups, including `all 11 local references exist on disk`, exit code 0.

- [ ] **Step 4: Behaviour check in the browser**

The local server from Task 5 must be running (`python -m http.server 8000` in the background). Use the Playwright tools loaded in Task 5. Run these in order and compare each result:

1. `browser_navigate` to `http://localhost:8000/`, then `browser_evaluate` `() => { localStorage.clear(); location.reload(); }`.
2. `browser_evaluate` `() => document.documentElement.lang` → expected `"en"` (first visit in an English-locale browser).
3. `browser_evaluate` `() => document.title` → expected `"Capri&Pasta · Italian food truck in and around Greve"`.
4. `browser_evaluate` `() => document.getElementById('lang-toggle').getAttribute('aria-label')` → expected `"Skift til dansk"`.
5. `browser_click` on the language toggle button (in the snapshot it is the button named "Skift til dansk").
6. `browser_evaluate` `() => [document.documentElement.lang, document.title, localStorage.getItem('capripasta-lang'), document.querySelector('.hero-img').alt, document.getElementById('lang-toggle').getAttribute('aria-label'), getComputedStyle(document.querySelector('h1 [lang="en"]')).display, getComputedStyle(document.querySelector('h1 [lang="da"]')).display]`
   → expected `["da", "Capri&Pasta · Italiensk food truck i Greve og omegn", "da", "Capri&Pasta food trucken", "Switch to English", "none", "inline"]`.
7. `browser_navigate` to `http://localhost:8000/` again (reload). `browser_evaluate` `() => document.documentElement.lang` → expected `"da"` (saved choice beats the browser locale).
8. `browser_click` the toggle (now named "Switch to English"). `browser_evaluate` `() => [document.documentElement.lang, localStorage.getItem('capripasta-lang')]` → expected `["en", "en"]`.
9. `browser_snapshot` → the visible headline is "Authentic Italian food, straight from our food truck" and no Danish sentence appears in the snapshot.
10. `browser_evaluate` `() => document.getElementById('year').textContent` → expected the current year as a string.
11. `browser_console_messages` → expected no entries of type error.

If any expectation fails, fix `script.js` (or the markup it depends on), reload and repeat from step 1.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat: add language toggle script with localStorage and attribute translation" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Social sharing image (`og-image.png`)

**Files:**
- Create: `tools/og-template.html`
- Create (generated): `assets/img/og-image.png`

**Interfaces:**
- Consumes: `node tools/check-page.mjs assets`; Playwright tools from Task 5.
- Produces: `assets/img/og-image.png`, a 1200×630 PNG referenced by `og:image` and the JSON-LD `image` in `index.html`.

- [ ] **Step 1: Run the assets group to see the one remaining failure**

Run: `node tools/check-page.mjs assets`
Expected: exactly one FAIL, `assets/img/og-image.png exists`.

- [ ] **Step 2: Write the template**

Flat colours only (no gradients) so the PNG stays small.

```html
<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<title>og-image template (screenshot the viewport at 1200x630)</title>
<style>
  html, body { margin: 0; }
  body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #1e4da1; color: #faf7f0; font-family: Georgia, "Times New Roman", serif; }
  .bar { position: absolute; top: 0; left: 0; right: 0; height: 14px; background: linear-gradient(90deg, #009246 0 33.33%, #fff 33.33% 66.66%, #ce2b37 66.66% 100%); }
  .lemon { position: absolute; right: 120px; top: 120px; width: 260px; height: 260px; border-radius: 50%; background: #f4c542; }
  .wrap { position: absolute; left: 90px; bottom: 90px; max-width: 700px; }
  .name { margin: 0 0 24px; font-size: 96px; font-weight: 700; line-height: 1; }
  .tag { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 34px; line-height: 1.3; opacity: 0.92; }
</style>
</head>
<body>
  <div class="bar"></div>
  <div class="lemon"></div>
  <div class="wrap">
    <p class="name">Capri&amp;Pasta</p>
    <p class="tag">Autentisk italiensk mad, lige fra vores food truck</p>
  </div>
</body>
</html>
```

Save it as `tools/og-template.html`.

- [ ] **Step 3: Screenshot it with Playwright**

1. `browser_resize` to width 1200, height 630.
2. `browser_navigate` to `file:///C:/Ondrive/OneDrive%20-%20crossjoin.dk/Desktop/ClaudeCode%20Projects/CapriOgPasta/tools/og-template.html`.
3. `browser_take_screenshot` with `type: "png"`, `scale: "css"`, `fullPage: false`, `filename: "assets/img/og-image.png"`.
4. Run `ls -la assets/img/og-image.png`. If the file is not there, the MCP server wrote it relative to its own output folder: find it with `find . -name og-image.png -newer tools/og-template.html` and move it to `assets/img/og-image.png`.
5. View `assets/img/og-image.png` with the Read tool. Expected: blue background, tricolore bar at the top, lemon circle top-right, white "Capri&Pasta" and the Danish tagline bottom-left, nothing clipped.

Fallback if the Playwright tools are unavailable:

```bash
npx --yes playwright@1.47.2 install chromium
npx --yes playwright@1.47.2 screenshot --viewport-size=1200,630 "file:///C:/Ondrive/OneDrive%20-%20crossjoin.dk/Desktop/ClaudeCode%20Projects/CapriOgPasta/tools/og-template.html" assets/img/og-image.png
```

- [ ] **Step 4: Run the assets and size groups**

Run: `node tools/check-page.mjs assets size`
Expected: all PASS, including `og-image.png is a 1200x630 PNG`, `og-image.png under 150 KB`, and `served files total under 300 KB`. If the PNG is over 150 KB, remove the `.bar` gradient from the template (make it three solid `div`s) and re-shoot.

- [ ] **Step 5: Commit**

```bash
git add tools/og-template.html assets/img/og-image.png
git commit -m "feat: add Open Graph sharing image and its template" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: `README.md` (maintenance guide)

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: `node tools/check-page.mjs readme`; the file names and edit rules from Tasks 2 to 7.
- Produces: the guide Rado follows for every later change. Section headings are checked by name, so keep them as written.

- [ ] **Step 1: Run the readme group to see it fail**

Run: `node tools/check-page.mjs readme`
Expected: `FAIL  README.md exists`, exit code 1.

- [ ] **Step 2: Write `README.md`**

````markdown
# Capri&Pasta landing page

One-page bilingual (Danish/English) website for the Capri&Pasta food truck. Static HTML, CSS and a small script. No build step.

- Live site: <https://rado81.github.io/CapriOgPasta/>
- Hosting: GitHub Pages, from the `main` branch, root folder.
- Spec: `docs/superpowers/specs/2026-09-08-capri-pasta-landing-page-design.md`

## Run locally

1. Open a terminal in this folder.
2. Run `python -m http.server 8000`.
3. Open <http://localhost:8000/> in a browser. Stop the server with Ctrl+C.

## Check the page

Run `node tools/check-page.mjs` after any change. It checks the language pairs, links, metadata, colour contrast and total size, and exits with an error if something is off. Run one group with, for example, `node tools/check-page.mjs html`.

## Edit text

Every translated text is written twice, Danish first, English second:

```html
<h2><span lang="da">Menuen</span><span lang="en">The menu</span></h2>
```

Paragraphs use the same idea with `<p lang="da">…</p><p lang="en">…</p>`. Keep the pairs together and in that order; the check script fails if a pair is broken.

Text that is the same in both languages (dish names, the phone number, "Capri&Pasta") is written once without `lang`.

Image alt texts and the page title carry both languages as `data-da="…" data-en="…"`. Edit those two values; the visible attribute is overwritten by the script.

Write `&amp;` for `&` in HTML text and attributes.

## Change phone, email or Facebook URL

Search `index.html` for the current value and replace every occurrence:

| What | Search for | Occurrences |
| --- | --- | --- |
| Phone link | `tel:+4527248565` | 3 (header, hero button, contact) |
| Phone text | `27 24 85 65` | 2 (header, contact) |
| Email | `Capripasta2025@gmail.com` | 3 (mailto link, link text, JSON-LD) |
| Facebook | `https://www.facebook.com/p/CapriPasta-61577987039291/` | 4 (hero, find os, contact, JSON-LD) |

The JSON-LD block at the end of `<head>` feeds Google. Keep it in sync.

## Swap images

Replace the placeholder file, then change the file extension in `index.html` if the new file is not an SVG.

| File in `assets/img/` | Used for | Size |
| --- | --- | --- |
| `hero.svg` | Hero background | 1600×1000 |
| `gallery-1.svg` … `gallery-6.svg` | Gallery tiles | 800×600 |
| `og-image.png` | Preview when the link is shared on Facebook | 1200×630, PNG or JPEG |

Export photos as JPEG, quality about 80, under 200 KB each. Example: save the truck photo as `assets/img/hero.jpg`, then in `index.html` change `src="assets/img/hero.svg"` to `src="assets/img/hero.jpg"`. Update the alt text pair (`data-da` / `data-en`) if the subject changes. Delete the unused SVG afterwards.

To regenerate the placeholders: `node tools/make-placeholders.mjs`. To regenerate the sharing image, screenshot `tools/og-template.html` at 1200×630.

## Replace the logo and favicon

- `assets/img/logo.svg`: the header logo, shown at 150×40 px. Any SVG or PNG with a similar 15:4 ratio works. If the ratio differs, update `width` and `height` on the logo `<img>` inside `<a class="brand">`.
- `assets/img/favicon.svg`: the browser tab icon, square.
- If the real logo's blue differs from `#1e4da1`, change `--blue` (and `--blue-dark`) at the top of `styles.css`, then run `node tools/check-page.mjs css` to confirm the contrast checks still pass.

## Add the CVR number and the events line

Both are HTML comments in `index.html`:

- CVR: at the end of the contact section, remove the comment markers around `<p class="cvr">CVR: 00000000</p>` and fill in the number.
- Events line: in the about section, remove the comment markers around the two `<p>` lines about "arrangement" / "private events". Only do this after the owner confirms they take bookings.

## Deploy to GitHub Pages

Every push to `main` publishes the site within a few minutes. There is no build step.

```bash
git add -A
git commit -m "Update menu"
git push
```

First-time setup (already done): repository `Rado81/CapriOgPasta`, Settings → Pages → Source "Deploy from a branch", branch `main`, folder `/ (root)`. The empty `.nojekyll` file must stay in the root.

## Add a custom domain

1. Create a file named `CNAME` in the repo root containing only the domain, for example `capripasta.dk`.
2. At the DNS provider: for the apex domain add four A records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`; for `www` add a CNAME record pointing to `rado81.github.io`.
3. In GitHub Settings → Pages, enter the domain and tick "Enforce HTTPS" once the certificate is issued.
4. In `index.html`, replace `https://rado81.github.io/CapriOgPasta/` with the new base URL in all five places: `rel="canonical"`, `og:url`, `og:image`, and the JSON-LD `url` and `image`.
5. Update the live-site link at the top of this README.

## Confirm with the owner before launch

- [ ] Service area wording ("Greve og omegn" is inferred from one Facebook post).
- [ ] Pizza on the menu? Add a card item if confirmed.
- [ ] Do they take private bookings? If yes, enable the events line.
- [ ] CVR number for the footer.
- [ ] Original logo file and photos, with permission to use them.
- [ ] Domain name, if they want one.
- [ ] Instagram or other channels (add to the contact section and to `sameAs` in the JSON-LD).
- [ ] Email address as they prefer it displayed.
````

- [ ] **Step 3: Run the readme group**

Run: `node tools/check-page.mjs readme`
Expected: all ten checks PASS, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add maintenance README" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Full verification pass

**Files:**
- Modify (only if a check fails): `index.html`, `styles.css`, `script.js`

**Interfaces:**
- Consumes: everything from Tasks 1 to 8; the local server; Playwright tools (add `mcp__plugin_playwright_playwright__browser_press_key` via ToolSearch).
- Produces: a clean working tree where `node tools/check-page.mjs` exits 0, the W3C validator reports 0 errors, and the browser checks below hold. This is the state Task 10 publishes.

- [ ] **Step 1: Run the whole harness**

Run: `node tools/check-page.mjs`
Expected: every group PASS, last line `N passed, 0 failed`, exit code 0.

- [ ] **Step 2: Validate the final HTML**

```bash
V=$(mktemp)
curl -s -H "Content-Type: text/html; charset=utf-8" --data-binary @index.html "https://validator.w3.org/nu/?out=json" > "$V"
node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const e=r.messages.filter(m=>m.type==='error');console.log(e.length+' errors');e.forEach(m=>console.log('line '+m.lastLine+': '+m.message));process.exit(e.length?1:0)" "$V"
```

Expected: `0 errors`.

- [ ] **Step 3: Browser pass in both languages and both widths**

Server running (`python -m http.server 8000`, background). For each combination below, set the language with `browser_evaluate` `() => { localStorage.setItem('capripasta-lang', 'LANG'); location.reload(); }` where LANG is `da` or `en`, then take a full-page PNG screenshot and view it with the Read tool:

| Viewport (`browser_resize`) | Language | Screenshot file |
| --- | --- | --- |
| 1280 × 800 | da | `.playwright-mcp/final-desktop-da.png` |
| 1280 × 800 | en | `.playwright-mcp/final-desktop-en.png` |
| 375 × 812 | da | `.playwright-mcp/final-mobile-da.png` |
| 375 × 812 | en | `.playwright-mcp/final-mobile-en.png` |

Expected in every screenshot: no text overlaps, no clipped buttons, Fraunces (a serif) renders in headings, every section present in the order header, hero, menu, about, find os, gallery, contact, footer. In the English screenshots no Danish sentence is visible, and in the Danish ones no English sentence is visible.

At 375 × 812 also run `browser_evaluate` `() => document.documentElement.scrollWidth === window.innerWidth` → expected `true`.

- [ ] **Step 4: Network, console, keyboard**

1. `browser_network_requests` → expected: every request goes to `localhost:8000`, all statuses 200 or 304, and the list includes `styles.css`, `script.js`, `fraunces.woff2`, `logo.svg`, `hero.svg`, `favicon.svg` and the six gallery SVGs. No request to any other host.
2. `browser_console_messages` → expected: no entries of type error.
3. `browser_navigate` to `http://localhost:8000/`, then `browser_press_key` with `Tab`, then `browser_take_screenshot` of the viewport → expected: the lemon "Spring til indhold" (or "Skip to content") pill is visible at the top left. `browser_press_key` `Enter` → `browser_evaluate` `() => location.hash` → expected `"#main"`.

- [ ] **Step 5: Stop the server and fix anything that failed**

```bash
netstat -ano | grep ':8000 ' | awk '{print $5}' | head -1 | xargs -I{} taskkill //PID {} //F
git status --short
```

If a step above failed, fix it, re-run `node tools/check-page.mjs`, and repeat the failed step. Commit fixes with a message that names the problem:

```bash
git add -A
git commit -m "fix: <what was wrong>" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

If nothing failed, `git status --short` prints nothing and there is nothing to commit.

### Task 10: Publish to GitHub Pages (gated)

**Gate:** Publishing makes the content public. Do not start this task until Rado has said "go" for publishing in the conversation. A subagent that reaches this task stops and reports "Task 10 gate reached" instead of running any command below.

**Files:**
- None in the repo. The README already describes the deployed state.

**Interfaces:**
- Consumes: the clean tree from Task 9; `gh` logged in as `Rado81`; Playwright tools from Task 5.
- Produces: public repository `Rado81/CapriOgPasta` with an `origin` remote, GitHub Pages enabled from `main` root, live site at `https://rado81.github.io/CapriOgPasta/`.

- [ ] **Step 1: Preconditions**

```bash
gh auth status
git status --short
git log --oneline | wc -l
```

Expected: "Logged in to github.com account Rado81"; `git status --short` prints nothing; the commit count is at least 10.

- [ ] **Step 2: Create the public repo and push**

```bash
gh repo create Rado81/CapriOgPasta --public --source=. --remote=origin --push --description "Landing page for the Capri&Pasta food truck, Greve, Denmark"
git remote -v
gh repo view Rado81/CapriOgPasta --json url,visibility
```

Expected: `✓ Created repository Rado81/CapriOgPasta on GitHub` and `✓ Pushed commits to https://github.com/Rado81/CapriOgPasta.git`; `origin` listed for fetch and push; JSON with `"visibility":"PUBLIC"`.

If the repo already exists (error "Name already exists on this account"), run `git remote add origin https://github.com/Rado81/CapriOgPasta.git && git push -u origin main` instead.

- [ ] **Step 3: Enable GitHub Pages from `main` root**

```bash
gh api -X POST repos/Rado81/CapriOgPasta/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
```

Expected: JSON containing `"html_url":"https://rado81.github.io/CapriOgPasta/"`. An HTTP 409 means Pages is already enabled; continue.

- [ ] **Step 4: Wait for the first build**

```bash
gh api repos/Rado81/CapriOgPasta/pages --jq '.status'
curl -sI https://rado81.github.io/CapriOgPasta/ | head -1
curl -sI https://rado81.github.io/CapriOgPasta/assets/img/og-image.png | head -1
```

Expected: status `built` (re-run the command until it changes from `building`; usually under two minutes), then `HTTP/2 200` for both URLs.

- [ ] **Step 5: Check the live site in the browser**

1. `browser_resize` to 1280 × 800, `browser_navigate` to `https://rado81.github.io/CapriOgPasta/`, `browser_take_screenshot` (`.playwright-mcp/live-desktop.png`) and view it. Expected: identical to the Task 9 desktop screenshot.
2. `browser_click` the language toggle, `browser_evaluate` `() => [document.documentElement.lang, localStorage.getItem('capripasta-lang')]` → expected both values equal and different from the value before the click.
3. `browser_network_requests` → expected: every request to `rado81.github.io`, all 200 or 304, including `fraunces.woff2`; no other host.
4. `browser_console_messages` → expected no entries of type error.

- [ ] **Step 6: Hand-off to Rado**

Report the live URL and these two manual items:

- Open the Facebook Sharing Debugger at `https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Frado81.github.io%2FCapriOgPasta%2F` (needs a Facebook login) and press "Scrape again"; the preview must show the blue og-image and the Danish title.
- Work through the "Confirm with the owner before launch" checklist in `README.md`.

No commit: nothing in the repo changed in this task.

---

## Spec coverage map

| Spec section | Implemented in |
| --- | --- |
| 1 Purpose and success criteria | Tasks 4 and 6 (bilingual, links), 7 and 10 (share preview), 1 and 9 (size, no third-party requests) |
| 2 Facts about the business | Task 4 copy and JSON-LD |
| 3 Decisions | All tasks; Task 10 for hosting |
| 4.1 Header, skip link, tricolore | Tasks 4, 5 |
| 4.2 Hero | Tasks 2, 4, 5 |
| 4.3 Menu, no prices, no pizza | Task 4 (harness check in Task 1) |
| 4.4 About, events line as comment | Task 4 |
| 4.5 Find us | Tasks 4, 5 |
| 4.6 Gallery | Tasks 2, 4, 5 |
| 4.7 Contact, CVR comment, footer year | Tasks 4, 5, 6 |
| 4.8 Head metadata, Open Graph, JSON-LD | Task 4 |
| 5 Language mechanism (markup, CSS, inline script, script.js, behaviour table) | Tasks 4, 5, 6; behaviour verified in Task 6 Step 4 and the harness locale cases |
| 6 Visual design (tokens, typography, layout, components, motion, accessibility) | Tasks 3, 5; contrast checked by the harness; keyboard checked in Task 9 |
| 7 Files, URL rules, deployment | Tasks 1 (.nojekyll), 4 (relative paths, 5 absolute URLs), 10 |
| 8 Placeholder assets | Tasks 2, 7 |
| 9 Facts to confirm with the owner | Task 8 README checklist, Task 10 hand-off |
| 10 Out of scope | Nothing built for it; Task 9 confirms no third-party requests |
| 11 Verification | Task 1 harness, Tasks 4 to 7 checks, Task 9 full pass, Task 10 live check |
| 12 README contents | Task 8 |

