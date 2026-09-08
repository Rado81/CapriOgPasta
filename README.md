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

## Keeping the check script in sync

`tools/check-page.mjs` hard-codes some values that only match the placeholder version of the site. When you make one of the changes below, edit the matching line or constant in the script too, or the check will start failing even though the page is correct.

| When you… | Edit in `tools/check-page.mjs` | What to change |
| --- | --- | --- |
| Swap the SVG placeholders for JPEG photos | the `svgSpecs` array, and the size limits (`// ---------- assets` and `// ---------- size` sections) | Remove the entries for the files you replaced from `svgSpecs` so the script stops expecting an SVG with a `viewBox` there. Real photos are much heavier than the placeholder SVGs and will push the page past the 300 KB total that was sized for placeholders, so raise the limit in the `served files total under 300 KB` check to what the real files need. If you also replace `og-image.png` with a heavier file, raise the `og-image.png under 150 KB` limit the same way. |
| Change the phone number or email | the `tel:` and `mailto:` strings (`// ---------- html` section) | Replace `tel:+4527248565` and `mailto:Capripasta2025@gmail.com` with the new values in the `telCount` and `mailto:` checks. |
| Change the Facebook URL | the `FB` constant (top of the `// ---------- html` section) | Set `FB` to the new URL. |
| Add a custom domain | the `SITE` constant (top of the `// ---------- html` section) | Set `SITE` to the new base URL, for example `https://capripasta.dk/`. |
| Add pizza to the menu | the `no mention of pizza` check (`// ---------- html` section) | Remove or narrow that check, now that pizza is meant to appear on the page. |

After editing, run `node tools/check-page.mjs` again and expect `0 failed`.

## Edit text

Every translated text is written twice, Danish first, English second:

```html
<h2><span lang="da">Menuen</span><span lang="en">The menu</span></h2>
```

Paragraphs use the same idea with `<p lang="da">…</p><p lang="en">…</p>`. Keep the pairs together and in that order; the check script fails if a pair is broken.

Text that is the same in both languages (dish names, the phone number, "Capri&Pasta") is written once without `lang`.

Image alt texts and the page title carry both languages as `data-da="…" data-en="…"`. Edit those two values; the visible attribute is overwritten by the script. Keep the plain `alt`, `content` and `<title>` text equal to the Danish value, though: visitors without JavaScript and crawlers that do not run it read those directly, before the script has a chance to overwrite them.

Write `&amp;` for `&` in HTML text and attributes.

## Change phone, email or Facebook URL

Search `index.html` for the current value and replace every occurrence:

| What | Search for | Occurrences |
| --- | --- | --- |
| Phone link | `tel:+4527248565` | 3 (header, hero button, contact) |
| Phone text | `27 24 85 65` | 2 (header, contact) |
| Phone in JSON-LD | `"+4527248565"` | 1 (JSON-LD telephone) |
| Email | `Capripasta2025@gmail.com` | 3 (mailto link, link text, JSON-LD) |
| Facebook | `https://www.facebook.com/p/CapriPasta-61577987039291/` | 4 (hero, find os, contact, JSON-LD) |

The JSON-LD block at the end of `<head>` feeds Google. Keep it in sync.

## Swap images

Replace the placeholder file, then change the file extension in `index.html` if the new file is not an SVG.

| File in `assets/img/` | Used for | Size |
| --- | --- | --- |
| `hero.svg` | Hero background | 1600×1000 |
| `gallery-1.svg` … `gallery-6.svg` | Gallery tiles | 800×600 |
| `og-image.png` | Preview when the link is shared on Facebook | 1200×630, must stay this exact file name and PNG format — otherwise `og:image` and the JSON-LD `image` in `index.html`, and the og-image checks in the harness, must all be updated too |

Export photos as JPEG, quality about 80, under 200 KB each. Example: save the truck photo as `assets/img/hero.jpg`, then in `index.html` change `src="assets/img/hero.svg"` to `src="assets/img/hero.jpg"`. Update the alt text pair (`data-da` / `data-en`) if the subject changes. Delete the unused SVG afterwards.

To regenerate the placeholders: `node tools/make-placeholders.mjs`. To regenerate the sharing image, screenshot `tools/og-template.html` at 1200×630; the commands that work here are `npx --yes playwright@1.47.2 install chromium` (once) and then `npx --yes playwright@1.47.2 screenshot --viewport-size=1200,630 "file:///C:/Ondrive/OneDrive%20-%20crossjoin.dk/Desktop/ClaudeCode%20Projects/CapriOgPasta/tools/og-template.html" assets/img/og-image.png`.

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

GitHub Pages serves the site with a ten-minute cache, so a change can take up to ten minutes plus a hard refresh in the browser to show. Facebook also caches its own scrape of the page, so after changing `og-image.png` or the title, open the Sharing Debugger (`https://developers.facebook.com/tools/debug/`) and press "Scrape again" to refresh the shared preview.

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
