# SEO and link previews

Single-page portfolio. One page, one intent: people looking to hire a GoHighLevel and AI
automation specialist, usually after seeing Wovie's name on Upwork, LinkedIn, or a shared link.

| Page | Primary intent | Terms | Where they appear |
| --- | --- | --- | --- |
| `/` | Hire / vet Wovie Prollo | Wovie Prollo, GoHighLevel expert, workflow automation, AI automation specialist, AI voice and chat agents | `<title>`, meta description, `h1`, hero copy, services, JSON-LD `jobTitle` and `knowsAbout` |

## What was added

- **Share tags** (`src/routes/__root.tsx`): canonical link, `og:url`, `og:site_name`, absolute
  `og:image` (1200x630 with width, height, type, alt), `twitter:card` = `summary_large_image`,
  `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`. Title and description
  are unchanged.
- **Theme color** for both schemes: light `#f7f5f0`, dark `#0e121a` with
  `media="(prefers-color-scheme: dark)"`. These two tags are written in the `<head>` markup of
  `RootDocument`, not in `head().meta`, because TanStack's `HeadContent` keeps only one meta tag per
  `name`, so the second one would be dropped.
- **Structured data**: one JSON-LD `@graph` in the `<head>` with a `Person` (name, job title,
  description, url, image, email, Manila / PH address, LinkedIn `sameAs`, `knowsAbout` from the
  tools and services lists) and a `WebSite` that points to that person. Every value comes from
  `src/data/site.ts`.
- **Share image**: `public/og.png`, 1200x630, about 165 KB. Navy card with the name in Instrument
  Serif, the hero role line, the portrait, the line-and-node motif, and one orange accent.
- **Crawling**: `public/robots.txt` (allow all, sitemap line) and `public/sitemap.xml` (one URL).

## The one constant to change

The site address lives in `src/data/site.ts`:

```ts
export const site = { url: 'https://wovie-prollo.vercel.app' }
```

Canonical, `og:url`, `og:image`, `twitter:image`, and the JSON-LD URLs are all built from it. If
the deploy lands on the fallback `https://wovie-prollo.vercel.app` (or a custom domain), change
this value and **also edit these static files by hand**, since they cannot read the constant:

1. `public/robots.txt`: the `Sitemap:` line.
2. `public/sitemap.xml`: the `<loc>` value (keep the trailing slash).
3. Optional: the small URL label printed on `public/og.png` (regenerate it, see below).

Quick check: `grep -n "vercel.app" public/robots.txt public/sitemap.xml src/data/site.ts` should
show the same address in the `Sitemap:` line, the `<loc>`, and the `site` value.

## Regenerate the share image

Do this when the name, the hero role line, the photo, or the site address changes. The image is
static, so it does not follow `site.ts` on its own. The `og:image:alt` text in `__root.tsx`
describes the image, so update it if the role line on the card changes.

1. Make a scratch folder outside the repo. Save the HTML at the end of this file there as
   `og.html` and copy `public/profile.jpg` next to it.
2. Edit the text in `og.html` if needed.
3. Render it with Chrome (no npm packages needed; the fonts load from Google Fonts):

   ```sh
   "C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars \
     --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=8000 \
     --screenshot=og.png "file:///C:/path/to/scratch/og.html"
   ```

4. Look at `og.png`, then copy it to `public/og.png`. Keep it under 400 KB.
5. Social sites cache previews. After deploying, refresh them with the LinkedIn Post Inspector
   and the Facebook Sharing Debugger (Facebook's cache also covers WhatsApp and Messenger). If a
   stale image persists, rename the file (for example `og-2.png`) and update `OG_IMAGE` in
   `__root.tsx`.

## Check after deploy

- Rich Results Test on the live URL: one `Person`, no errors.
- Open Graph preview (LinkedIn Post Inspector or opengraph.xyz): large card, correct URL.
- `https://<site>/robots.txt` and `https://<site>/sitemap.xml` return 200.
- Submit the sitemap in Google Search Console once the final address is settled.

## Left out on purpose (add later if wanted)

- `sameAs` has only LinkedIn, as briefed. The Upwork profile in `links.upwork` is also a valid
  `sameAs` entry if Wovie wants it linked.
- No `twitter:site` / `twitter:creator`: there is no X handle in `site.ts`.
- No `public/llms.txt` yet. A short one (who Wovie is, services, tools, how to book) would help
  AI assistants describe him accurately.

<details>
<summary>Share card source (<code>og.html</code>)</summary>

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>og card</title>
<!--
  Share card for the portfolio (public/og.png), 1200x630.
  Brand: "Calm Systems" (src/styles.css). Text comes from src/data/site.ts:
  profile.name, profile.titleLines (hero wording), profile.heroEyebrow, site.url host.
  Needs profile.jpg (copy of public/profile.jpg) in the same folder.
  Render steps: docs/seo.md, "Regenerate the share image".
-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=block">
<style>
  :root {
    --navy: #141a26;
    --navy-2: #1c2433;
    --paper: #f7f5f0;
    --mist: #c9cfda;
    --mist-dim: #8f98a8;
    --signal: #ff5a1f;
  }
  * { box-sizing: border-box; }
  html, body, p, h1 { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: var(--navy); color: var(--paper);
    font-family: 'Geist', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .card { position: relative; width: 1200px; height: 630px; }
  svg.net { position: absolute; inset: 0; }

  .eyebrow {
    position: absolute; left: 88px; top: 88px;
    display: flex; align-items: center; gap: 14px;
    font-family: 'Geist Mono', monospace; font-weight: 500;
    font-size: 15px; line-height: 1; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--mist-dim);
  }
  .dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 0 5px rgba(255, 90, 31, 0.18);
  }

  h1 {
    position: absolute; left: 82px; top: 150px;
    font-family: 'Instrument Serif', serif; font-weight: 400;
    font-size: 144px; line-height: 0.95; letter-spacing: -0.012em;
    color: var(--paper);
    white-space: nowrap;
  }
  .role {
    position: absolute; left: 88px; top: 322px;
    font-size: 31px; line-height: 1.34; font-weight: 400;
    color: var(--mist);
  }
  .role span { display: block; }

  .photo {
    position: absolute; left: 812px; top: 80px;
    width: 300px; height: 380px;
    padding: 10px; border-radius: 26px;
    background: var(--navy-2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .photo img {
    display: block; width: 100%; height: 100%;
    object-fit: cover; object-position: 50% 30%;
    border-radius: 17px;
  }

  .url {
    position: absolute; left: 88px; top: 527px;
    font-family: 'Geist Mono', monospace; font-weight: 400;
    font-size: 18px; line-height: 22px; letter-spacing: 0.04em;
    color: var(--mist);
  }
</style>
</head>
<body>
<div class="card">
  <!-- One connected, faint workflow: left edge to the photo, photo down to the footer line. -->
  <svg class="net" width="1200" height="630" viewBox="0 0 1200 630" aria-hidden="true">
    <g fill="none" stroke="#ffffff" stroke-opacity="0.075" stroke-width="1">
      <path d="M0 50 C 240 50, 300 38, 560 38" />
      <path d="M560 38 C 700 38, 700 160, 812 160" />
      <path d="M700 300 C 760 300, 760 250, 812 250" />
      <path d="M620 538 C 620 420, 700 400, 700 300" />
      <path d="M1112 180 C 1160 180, 1160 110, 1200 110" />
    </g>
    <g fill="#141a26" stroke="#ffffff" stroke-opacity="0.24" stroke-width="1">
      <circle cx="560" cy="38" r="3" />
      <circle cx="700" cy="300" r="3" />
    </g>

    <!-- Footer flow line: url label, nodes, accent node wired to the photo. -->
    <g fill="none" stroke-width="1">
      <line x1="376" y1="538" x2="946" y2="538" stroke="#ffffff" stroke-opacity="0.16" />
      <line x1="962" y1="461" x2="962" y2="530" stroke="#ff5a1f" stroke-opacity="0.9" />
      <line x1="978" y1="538" x2="1112" y2="538" stroke="#ffffff" stroke-opacity="0.16" />
    </g>
    <circle cx="376" cy="538" r="4" fill="#141a26" stroke="#ffffff" stroke-opacity="0.4" />
    <circle cx="620" cy="538" r="4" fill="#141a26" stroke="#ffffff" stroke-opacity="0.4" />
    <circle cx="962" cy="538" r="11" fill="#ff5a1f" fill-opacity="0.18" />
    <circle cx="962" cy="538" r="5" fill="#ff5a1f" />
    <circle cx="1112" cy="538" r="4" fill="#141a26" stroke="#ffffff" stroke-opacity="0.4" />
  </svg>

  <p class="eyebrow"><span class="dot"></span>GoHighLevel &amp; AI automation</p>

  <h1>Wovie Prollo</h1>
  <p class="role">
    <span>Certified GoHighLevel Expert</span>
    <span>&amp; AI Automation Builder</span>
  </p>

  <div class="photo"><img src="profile.jpg" alt=""></div>

  <p class="url">wovie-prollo.vercel.app</p>
</div>
</body>
</html>
```

</details>
