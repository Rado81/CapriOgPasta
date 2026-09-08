# Capri&Pasta landing page: design spec

- Date: 2026-09-08
- Status: design approved in brainstorming; written spec awaiting review
- Builder and maintainer: Rado
- Client: Capri&Pasta, Italian food truck operating in Greve and the Køge Bugt area, Denmark

## 1. Purpose

A one-page "digital business card" for the food truck Capri&Pasta. A visitor should understand within seconds what the truck sells, that it moves around, and how to reach it by phone, email or Facebook. Nothing is sold, ordered or booked on the site.

Success criteria:

1. Every visible text exists in Danish and English, and the toggle switches all of it, including the page title, meta description and image alt texts.
2. Phone, email and Facebook links work on mobile and desktop.
3. Total transfer size under 300 KB with placeholder images. No build step, no framework, no third-party requests at runtime.
4. The page looks intentional and on-brand with placeholders, and becomes launch-ready by swapping image files and confirming the facts in section 9.
5. The link renders with a proper title, description and image when shared on Facebook.

## 2. Facts about the business

Source: the public Facebook page, read on 2026-09-08.

- Name: Capri&Pasta. Posts sometimes write "Capri Pasta". The site uses Capri&Pasta everywhere.
- Facebook category: Italian Restaurant · Food Truck.
- Intro text: "Kom og smag autentisk Italiensk mad og desserter".
- Phone: +45 27 24 85 65. Email: Capripasta2025@gmail.com.
- Facebook URL: <https://www.facebook.com/p/CapriPasta-61577987039291/> (956 followers, 100% recommend from 9 reviews).
- Menu printed on the truck's side panel: Pasta fresca, Cannelloni, Arancini; Focaccia with Parma, Mortadella, Porchetta or Vegetariano; Tiramisù, Panna cotta, Cannoli, Pistacchio; Kaffe to-go. Photos also show pizza, which is not on the panel.
- Operating model: roaming truck. The day's location is posted on Facebook. Example post: "Godmorgen! I dag finder du Capri Pasta ved Mosede Fort" on 7 June 2026. Mosede Fort is in Greve.
- Brand look: blue rounded wordmark, a yellow lemon, a small Italian tricolore, white truck.

## 3. Decisions made in brainstorming

| Question | Decision |
| --- | --- |
| Primary goal | Digital business card. No bookings, no ordering, no schedule maintained on the site. |
| Languages | Danish and English with a client-side toggle. Danish is the markup default and what a visitor without JavaScript sees. With JavaScript, the browser language decides the first visit (Danish for `da`, otherwise English) and the saved choice wins after that. |
| Hosting | GitHub Pages from the public repo `Rado81/CapriOgPasta`, `main` branch, root folder. Initial URL `https://rado81.github.io/CapriOgPasta/`. Custom domain later. |
| Assets | Only what is public on Facebook. Placeholder logo and photos, swapped by Rado when the owner supplies originals. |
| Maintainer | Rado edits the HTML directly and pushes. |
| Build approach | One static page: `index.html`, `styles.css`, `script.js`. Both languages inline in the markup. Vanilla everything. |

## 4. Page structure and copy

Section ids are Danish and never change with language: `#menu`, `#om-os`, `#find-os`, `#galleri`, `#kontakt`.

Copy rules:

- Text that is identical in both languages, such as dish names, the phone number and the brand name, is written once without a span pair.
- All other text uses the span-pair pattern from section 5.1.
- No claims that are not on the Facebook page. Unverified lines are shipped as HTML comments and listed in section 9.

### 4.1 Header

Sticky at the top on all screen sizes. A 4 px tricolore line (green, white, red in thirds) sits above it.

| Element | Dansk | English | Behaviour |
| --- | --- | --- | --- |
| Logo | `assets/img/logo.svg`, alt "Capri&Pasta" | same | Links to `#top` |
| Nav link 1 | Menu | Menu | `#menu` |
| Nav link 2 | Om os | About | `#om-os` |
| Nav link 3 | Find os | Find us | `#find-os` |
| Nav link 4 | Kontakt | Contact | `#kontakt` |
| Phone | icon + "27 24 85 65" | same | `tel:+4527248565`; on screens under 768 px only the icon shows |
| Language toggle | button text "EN", aria-label "Switch to English" | button text "DA", aria-label "Skift til dansk" | Section 5.3 |

Nav links are hidden under 768 px. The page is short enough to scroll, so there is no hamburger menu.

A skip link ("Spring til indhold" / "Skip to content") is the first focusable element and targets `#main`.

### 4.2 Hero

Full-width placeholder photo (`assets/img/hero.svg`) as an `<img>` with `object-fit: cover`, a dark gradient overlay, and white text aligned bottom-left. Min height 60 vh on mobile, 70 vh from 768 px.

| Element | Dansk | English |
| --- | --- | --- |
| Eyebrow | Italiensk food truck | Italian food truck |
| H1 | Autentisk italiensk mad, lige fra vores food truck | Authentic Italian food, straight from our food truck |
| Subline | Frisk pasta, focaccia og italienske desserter. Find os i Greve og omegn. | Fresh pasta, focaccia and Italian desserts. Find us in and around Greve. |
| Primary button | Ring til os | Call us |
| Secondary button | Find os på Facebook | Find us on Facebook |
| Hero image alt | Capri&Pasta food trucken | The Capri&Pasta food truck |

Primary button links to `tel:+4527248565`. Secondary button opens the Facebook URL in a new tab with `rel="noopener"`.

### 4.3 Menu (`#menu`)

| Element | Dansk | English |
| --- | --- | --- |
| H2 | Menuen | The menu |
| Intro | Et udpluk af det, du finder i vognen. | A taste of what you'll find at the truck. |
| Card 1 title | Pasta & varme retter | Pasta & hot dishes |
| Card 1 items | Pasta fresca · Cannelloni · Arancini | same |
| Card 2 title | Focaccia | Focaccia |
| Card 2 items | Parma · Mortadella · Porchetta · Vegetariano | same |
| Card 3 title | Dolci | Dolci |
| Card 3 subtitle | Desserter | Desserts |
| Card 3 items | Tiramisù · Panna cotta · Cannoli · Pistacchio | same |
| Card 4 title | Kaffe to-go | Coffee to go |
| Card 4 text | Italiensk kaffe, klar til at tage med. | Italian coffee, ready to take away. |
| Footnote | Udvalget kan variere fra dag til dag. | The selection varies from day to day. |

Card items are rendered as a `<ul>` with one `<li>` per dish. The middle dots in the table above are separators in this document only.

No prices. Pizza is not listed until confirmed (section 9).

### 4.4 About (`#om-os`)

| Element | Dansk | English |
| --- | --- | --- |
| H2 | Om Capri&Pasta | About Capri&Pasta |
| Paragraph 1 | Capri&Pasta er en italiensk food truck med autentisk italiensk mad og desserter. | Capri&Pasta is an Italian food truck serving authentic Italian food and desserts. |
| Paragraph 2 | Vi laver frisk pasta, fyldt focaccia og klassiske italienske desserter som tiramisù og cannoli. | We make fresh pasta, filled focaccia and classic Italian desserts like tiramisù and cannoli. |
| Paragraph 3 | Du finder os i Greve og omegn. Kig forbi vognen, eller følg os på Facebook for at se, hvor vi holder i dag. | You'll find us in and around Greve. Stop by the truck, or follow us on Facebook to see where we are today. |
| Optional line, shipped as an HTML comment | Vi kommer også gerne ud til dit arrangement. Ring eller skriv til os. | We also come out to private events. Call or write to us. |

### 4.5 Find us (`#find-os`)

A short section on a blue background with white text and a lemon button.

| Element | Dansk | English |
| --- | --- | --- |
| H2 | Find os | Find us |
| Paragraph | Vores food truck skifter plads. Dagens placering og åbningstid lægger vi op på Facebook. | Our food truck moves around. We post today's location and opening hours on Facebook. |
| Button | Se dagens placering | See today's location |
| Small line | Følg os, og se hvor vi holder næste gang. | Follow us to see where we'll be next. |

The button opens the Facebook URL in a new tab. No map, because there is no fixed address.

### 4.6 Gallery (`#galleri`)

| Element | Dansk | English |
| --- | --- | --- |
| H2 | Galleri | Gallery |

Six `<figure>` images in a grid: 2 columns under 768 px, 3 columns from 768 px. Aspect ratio 4:3, `object-fit: cover`, 12 px radius.

| File | Alt, Dansk | Alt, English |
| --- | --- | --- |
| `assets/img/gallery-1.svg` | Capri&Pasta food trucken | The Capri&Pasta food truck |
| `assets/img/gallery-2.svg` | Frisk pasta | Fresh pasta |
| `assets/img/gallery-3.svg` | Focaccia | Focaccia |
| `assets/img/gallery-4.svg` | Arancini | Arancini |
| `assets/img/gallery-5.svg` | Tiramisù | Tiramisù |
| `assets/img/gallery-6.svg` | Cannoli | Cannoli |

### 4.7 Contact (`#kontakt`) and footer

| Element | Dansk | English | Link |
| --- | --- | --- | --- |
| H2 | Kontakt | Contact | |
| Row 1 label | Telefon | Phone | `tel:+4527248565`, text "+45 27 24 85 65" |
| Row 2 label | E-mail | Email | `mailto:Capripasta2025@gmail.com`, text "Capripasta2025@gmail.com" |
| Row 3 label | Facebook | Facebook | Facebook URL, text "Capri&Pasta på Facebook" / "Capri&Pasta on Facebook", new tab |
| CVR | CVR: | CVR: | Shipped as an HTML comment until the number is known |
| Footer line | © 2026 Capri&Pasta | same | The year is updated by `script.js`; the static text is the fallback |

Each contact row has an inline SVG icon (phone, envelope, Facebook "f") and a tap target of at least 44 px.

### 4.8 Head metadata

| Item | Dansk | English |
| --- | --- | --- |
| `<title>` | Capri&Pasta · Italiensk food truck i Greve og omegn | Capri&Pasta · Italian food truck in and around Greve |
| meta description | Autentisk italiensk mad og desserter fra vores food truck. Frisk pasta, focaccia, tiramisù og kaffe to-go. Find dagens placering på Facebook. | Authentic Italian food and desserts from our food truck. Fresh pasta, focaccia, tiramisù and coffee to go. Find today's location on Facebook. |

Fixed tags:

- `<meta charset="utf-8">`, viewport, `<meta name="theme-color" content="#1e4da1">`.
- `<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">`.
- Open Graph: `og:type` website, `og:title` and `og:description` in Danish, `og:locale` da_DK, `og:locale:alternate` en_GB, `og:url` and `og:image` absolute (section 7.2), `og:image:width` 1200, `og:image:height` 630. Twitter card `summary_large_image`.
- `<link rel="canonical">` absolute (section 7.2).
- JSON-LD `FoodEstablishment` with `name`, `servesCuisine` "Italian", `telephone` "+4527248565", `email`, `url`, `image`, `areaServed` "Greve, Denmark" and `sameAs` pointing at the Facebook URL.

## 5. Language mechanism

### 5.1 Markup

`<html lang="da">` is the default written in the file. Every translated text is a pair of adjacent spans:

```html
<h1>
  <span lang="da">Autentisk italiensk mad, lige fra vores food truck</span>
  <span lang="en">Authentic Italian food, straight from our food truck</span>
</h1>
```

Block-level content, such as paragraphs, uses the same pattern on `<p>` elements directly: `<p lang="da">…</p><p lang="en">…</p>`.

Attributes that need translating carry both values and name the target attribute:

```html
<img src="assets/img/hero.svg" alt="Capri&amp;Pasta food trucken"
     data-da="Capri&amp;Pasta food trucken" data-en="The Capri&amp;Pasta food truck" data-i18n-attr="alt">
<title data-da="…" data-en="…">Capri&amp;Pasta · Italiensk food truck i Greve og omegn</title>
<meta name="description" content="…" data-da="…" data-en="…" data-i18n-attr="content">
```

When `data-i18n-attr` is absent, the script sets `textContent`. This is used for `<title>` only.

### 5.2 CSS

Two rules do all the hiding:

```css
html[lang="da"] [lang="en"],
html[lang="en"] [lang="da"] { display: none !important; }
```

Only `da` and `en` are targeted, so an Italian dish name marked `lang="it"` is unaffected.

### 5.3 Script

Inline in `<head>`, before the stylesheet, so the language is set before first paint:

```js
(function () {
  var l = null;
  try { l = localStorage.getItem('capripasta-lang'); } catch (e) {}
  if (l !== 'da' && l !== 'en') {
    l = (navigator.language || '').toLowerCase().indexOf('da') === 0 ? 'da' : 'en';
  }
  document.documentElement.lang = l;
})();
```

`script.js`, loaded with `defer`, does the rest:

1. `applyLang(lang)`: sets `document.documentElement.lang`, then for every element with `data-da` and `data-en` copies the active value into the attribute named by `data-i18n-attr`, or into `textContent` when it is absent.
2. The toggle button flips between `da` and `en`, calls `applyLang`, and saves the choice with `localStorage.setItem('capripasta-lang', lang)` inside a try/catch.
3. On load it calls `applyLang` once with the current `document.documentElement.lang`, so attributes match the language chosen by the inline script.
4. Sets the footer year from `new Date().getFullYear()`.

The toggle button itself uses the span pattern: `<span lang="da">EN</span><span lang="en">DA</span>`, and its `aria-label` uses `data-da="Switch to English" data-en="Skift til dansk" data-i18n-attr="aria-label"`, so the label always names the language you would switch to.

### 5.4 Behaviour

| Situation | Result |
| --- | --- |
| First visit, browser language starts with `da` | Danish |
| First visit, any other browser language | English |
| Saved choice exists | Saved choice wins over browser language |
| JavaScript disabled | Danish, toggle does nothing, attributes stay Danish |
| localStorage blocked (private mode, strict settings) | Toggle works for the current page load, choice is not remembered |
| Font file missing | Fallback to `Georgia, "Times New Roman", serif` |
| Image missing | Alt text shows |

## 6. Visual design

### 6.1 Tokens

```css
:root {
  --blue: #1e4da1;        /* wordmark blue; tune to the real logo file when it arrives */
  --blue-dark: #173d80;   /* hover, footer */
  --lemon: #f4c542;       /* primary buttons, accents; dark text only on top of it */
  --green: #009246;       /* tricolore line only */
  --red: #ce2b37;         /* tricolore line only */
  --bg: #faf7f0;          /* page background, warm off-white */
  --surface: #ffffff;     /* cards */
  --line: #e8e2d6;        /* card borders, dividers */
  --text: #1b1f2a;
  --muted: #5b6170;
  --radius: 16px;
  --container: 1100px;
}
```

Contrast checks required: `--text` on `--bg` and on `--surface`, `--blue` on `--bg`, white on `--blue`, `--text` on `--lemon`. All must pass WCAG AA for normal text. Lemon is never used as a text colour.

### 6.2 Typography

- Headings: Fraunces, self-hosted at `assets/fonts/fraunces.woff2`. The file is the variable woff2, latin subset, downloaded once from Google's font server during implementation and committed to the repo. `@font-face` declares `font-weight: 500 700` and `font-display: swap`. Licence file `assets/fonts/OFL.txt` ships with it. Fallback `Georgia, "Times New Roman", serif`.
- Body: system stack `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Scale: body 1rem/1.6, H1 clamp(2.2rem, 5vw, 3.5rem), H2 clamp(1.7rem, 3.5vw, 2.4rem), card titles 1.25rem, small text 0.9rem.
- No requests to Google Fonts or any other third party at runtime.

### 6.3 Layout

- Mobile-first. Container `max-width: var(--container)`, padding 1.25rem on mobile, 2rem from 768 px.
- Section vertical padding 4rem on mobile, 6rem from 768 px. Sections alternate `--bg` and `--surface`; "Find os" is `--blue` with white text.
- Menu cards: 1 column, 2 columns from 640 px, 4 columns from 1024 px. White surface, 1 px `--line` border, `--radius`, a 4 px lemon top border, title in Fraunces, items as a vertical unstyled list with 0.35rem between rows.
- Gallery: 2 columns, 3 columns from 768 px, 1rem gap.
- Contact: rows stacked, each with icon, label and link.
- Footer: `--blue-dark` background, white text, centred, small.

### 6.4 Components

- Primary button: `--lemon` background, `--text` text, 999 px radius, 0.85rem × 1.5rem padding, hover darkens 6 percent, focus-visible ring 3 px `--blue` on light backgrounds and 3 px white on blue backgrounds.
- Secondary button on the hero: transparent with a 2 px white border and white text; hover fills white with `--text` text.
- Language toggle: pill outline in `--blue`, 44 px minimum height and width.

### 6.5 Motion and accessibility

- `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`. Card hover lifts 2 px over 150 ms; disabled under reduced motion.
- Landmarks: `header`, `main#main`, `section` with `aria-labelledby` pointing at its H2, `footer`.
- All images have alt text; decorative SVG icons have `aria-hidden="true"`.
- Keyboard: skip link, visible focus on every interactive element, toggle is a real `<button type="button">`.
- Touch targets at least 44 px.

## 7. Files and deployment

### 7.1 Repository layout

```
CapriOgPasta/
  index.html
  styles.css
  script.js
  README.md
  .nojekyll
  .gitignore
  assets/
    img/
      logo.svg           placeholder wordmark, replaced by the real logo
      favicon.svg        lemon circle with a blue "C&P"
      hero.svg           1600×1000 placeholder
      gallery-1.svg … gallery-6.svg   800×600 placeholders
      og-image.png       1200×630 raster placeholder for social sharing
    fonts/
      fraunces.woff2
      OFL.txt
  docs/superpowers/specs/   this spec and later plans
```

`.gitignore` excludes `.playwright-mcp/`, `*.log`, `.DS_Store` and `Thumbs.db`.

### 7.2 URL rules

- Every internal link and asset path is relative (`assets/img/hero.svg`, never `/assets/...`), so the page works under the `/CapriOgPasta/` sub-path today and at a domain root later.
- The site's own absolute URL appears in exactly five places, all in `<head>`: `canonical`, `og:url`, `og:image`, and the `url` and `image` fields of the JSON-LD. The page URL is `https://rado81.github.io/CapriOgPasta/` and the image URL is `https://rado81.github.io/CapriOgPasta/assets/img/og-image.png`. The README lists these five lines as the only ones to change when a custom domain is added. Links to Facebook, `tel:` and `mailto:` are external and unaffected.

### 7.3 Deployment

1. Create the public GitHub repo `Rado81/CapriOgPasta` and push `main`. Creating and pushing is done only after Rado says go, since it publishes the content.
2. In the repo, Settings → Pages → Source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. `.nojekyll` in the root stops GitHub from running Jekyll.
4. The site is live within a few minutes at `https://rado81.github.io/CapriOgPasta/`.

Custom domain later: add a `CNAME` file with the domain, set DNS (four A records for the apex, or a CNAME for `www`, per GitHub's documentation), enable "Enforce HTTPS", and update the three absolute URLs.

## 8. Placeholder assets

All placeholders are hand-written SVGs in the brand palette with a large centred label so nobody mistakes them for final art.

| File | Size | Label |
| --- | --- | --- |
| `hero.svg` | 1600×1000 | "Foto kommer · food trucken" |
| `gallery-1.svg` | 800×600 | "Foto kommer · food trucken" |
| `gallery-2.svg` | 800×600 | "Foto kommer · pasta" |
| `gallery-3.svg` | 800×600 | "Foto kommer · focaccia" |
| `gallery-4.svg` | 800×600 | "Foto kommer · arancini" |
| `gallery-5.svg` | 800×600 | "Foto kommer · tiramisù" |
| `gallery-6.svg` | 800×600 | "Foto kommer · cannoli" |
| `logo.svg` | 240×64 viewBox | Wordmark "Capri&Pasta" in `--blue` with a small lemon circle; not a copy of the real logo |
| `favicon.svg` | 64×64 | Lemon circle, blue "C&P" |
| `og-image.png` | 1200×630 | Rendered from a small HTML template by a Playwright screenshot, showing wordmark, tagline and tricolore line |

Swapping a placeholder for a real photo means replacing the file and updating the `src` extension in `index.html`. Real photos are exported as JPEG at the sizes above, quality about 80, under 200 KB each.

## 9. Facts to confirm with the owner before launch

1. Service area wording: "Greve og omegn" is inferred from one post. Adjust if they cover more of Køge Bugt or Copenhagen.
2. Pizza: shown in photos, not on the panel. Add a card item if confirmed.
3. The optional events line in section 4.4. Uncomment only if they take private bookings.
4. CVR number for the footer.
5. Original logo file and photos, with the owner's permission to use them.
6. Domain name, if they want one.
7. Instagram or other channels to add to the contact section and `sameAs`.
8. The email address as they prefer it displayed.

## 10. Out of scope

Contact form, cookie banner, analytics, Facebook feed embed, embedded map, online ordering, event booking, CMS, a schedule maintained on the site, per-language URLs, and a build pipeline. The language preference in localStorage is a functional setting chosen by the visitor and needs no consent banner. A Facebook embed or analytics would change that, which is one reason they are excluded.

## 11. Verification

Run before declaring the page done, and again after any content change:

1. Serve the folder locally: `python -m http.server 8000` in the repo root, open `http://localhost:8000/`.
2. With Playwright: the page loads with Danish text; clicking the toggle shows English text in every section, the page title and the hero alt; reloading keeps English; clearing localStorage and reloading with a Danish browser locale shows Danish.
3. Every `lang="da"` element has an adjacent `lang="en"` sibling and vice versa. A small script counts them and lists any singles.
4. Hrefs: `tel:+4527248565` appears in the header, hero and contact; `mailto:Capripasta2025@gmail.com` in contact; the Facebook URL in hero, Find os and contact, each with `target="_blank"` and `rel="noopener"`.
5. No console errors or failed network requests.
6. Screenshots at 375×812 and 1280×800 in both languages. `document.documentElement.scrollWidth` equals `innerWidth` at 375 px, so there is no horizontal scroll.
7. HTML validation: post `index.html` to `https://validator.w3.org/nu/?out=json` and expect zero errors.
8. Sum of all served files under 300 KB.
9. After deployment: open the live URL, and check the shared preview with Facebook's Sharing Debugger (needs a Facebook login, so Rado does this step).

## 12. README contents

English, step by step:

1. What this is and where it is hosted.
2. Run locally with `python -m http.server 8000`.
3. Edit text: the span-pair rule, and that identical text is written once.
4. Change phone, email or Facebook URL: the exact places to edit, including the JSON-LD.
5. Swap images: the file table from section 8 with sizes and formats.
6. Replace the logo and favicon.
7. Add the CVR number and the optional events line.
8. Deploy: the GitHub Pages steps from section 7.3.
9. Add a custom domain: `CNAME`, DNS, HTTPS, and the three absolute URLs.
10. The confirm-with-owner checklist from section 9.
