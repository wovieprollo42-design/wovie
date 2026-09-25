# Brief: voiced intro + site improvements

Project: `C:\Users\User\Downloads\wovie-portfolio` (copy of the live site
wovie-prollo-portfolio.vercel.app, owned by the user, Wovie Prollo). Own git repo, no remote.
Stack: TanStack Start (React 19, SSR) + Vite + Tailwind CSS 4 + Nitro. Build: `npm run build`.
Local run after build: `PORT=<port> node .output/server/index.mjs` (port 4317 is taken; use another).

All site copy and facts live in `src/data/site.ts`. Rule already in that file: never add numbers,
clients, or claims that are not already documented there.

## What the user asked for

1. Improve the portfolio.
2. Add an intro like https://israelgonzaga.vercel.app/ : **only the intro concept and a voice that
   speaks the user's name and expertise.** **No background music** (and no generated sound effects).
3. Deploy to a new Vercel project at `wovie.vercel.app` (note: that subdomain currently answers
   `451 DEPLOYMENT_DISABLED`, so another account probably holds it; fallback `wovie-prollo.vercel.app`
   is free). Keep the site URL in one constant so it can change.

## How the reference intro works (saved at docs/reference-israelgonzaga.html, search "mg-intro")

A full-screen overlay shown before the page, once per browser session (sessionStorage), skipped when
the visitor prefers reduced motion. Sequence:

- Gate state: photo/logo in a ring that draws itself, a terminal line typing (`$ npm run israel`,
  then `> press enter to start`), the name animating in letter by letter (rise + un-blur, staggered),
  a role line fading in, then two choices: a pill button "Enter with sound" (with small animated
  equalizer bars, pulsing ring) and a small underlined "enter without sound".
- Play state: the voice speaks 3 short lines (browser Web Speech API `speechSynthesis`, preferred
  natural voices by name, with an optional recorded file `VOICE_FILE` that replaces it). Each line
  appears as a caption (with an emphasized part) when its utterance starts; timers are the fallback.
  A thin progress bar and a % counter run for ~10 s. The terminal types progress lines, ending
  with "✓ systems ready". A mute button (bottom-left) and "skip intro →" (bottom-right).
- Finish: when the bar is full and the voice is done (or a few seconds past), content fades up,
  then two half-screen panels slide apart (top up, bottom down) to reveal the page.
  Escape skips; Enter starts with sound.
- Parts we DROP: the Web Audio soundtrack (pad, kick, hats, arpeggio, riser, impact) and the music
  player.
- Parts we KEEP (user asked explicitly, 2026-09-25): the finish celebration, a confetti burst plus a
  big "Welcome!" that pops in over the revealed page, like the reference. In brand colors, no sound.

## Brand to adapt it to ("Calm Systems", see src/styles.css)

Warm paper `#f7f5f0`, ink/navy `#141a26` (dark theme bg `#0e121a`, navy `#080b11`), one signal
accent orange `#ff5a1f` (lighter `#ff6a33` / `#ff8a5c` on dark), mist text `#c9cfda`,
`#8f98a8`. Fonts: Geist (sans), Instrument Serif (headings, italic accent in orange),
monospace for labels. Motif: thin connecting lines with small nodes (workflow diagrams).
The intro stays dark in both themes (like the "Selected systems" card).
The user is a GoHighLevel + AI automation specialist, so terminal lines should read like a
workflow run (trigger, actions, complete), not like npm.

## Technical decisions (already made)

- The overlay is server-rendered but hidden by default (`display:none`). A tiny inline script in
  `<head>` adds `intro-on` to `<html>` before first paint unless sessionStorage `wp-intro` is `1` or
  reduced motion is on. So: no flash for returning visitors, and no overlay at all if JS is off.
- `html.intro-on` locks scrolling. The page wrapper gets `inert` while the intro is up.
- Speech must start synchronously inside the button's click handler (mobile Safari/Chrome require
  a user gesture).
- Voice: prefer a male English voice (the user's client testimonials refer to him as "he"),
  natural/online voices first (Edge "Andrew/Guy/Brian/Christopher Online (Natural)",
  Chrome "Google UK English Male", Apple "Daniel/Alex/Aaron/Oliver", Windows "David/Mark").
  One config switch for voice gender, rate, and an optional `voiceFile` (e.g. `/intro-voice.mp3`)
  so the user can later drop in a recording of their own voice.
- All intro text and settings live in `src/data/site.ts` under `intro`.
- A "Replay intro" button in the footer re-opens it.

## File ownership (so agents do not collide)

- site-copywriter: `docs/intro-copy.md` only.
- site-ui-designer: `docs/intro-design.md` only.
- site-seo: `src/routes/__root.tsx` head meta, `public/og.png` (share image), `public/robots.txt`,
  `public/sitemap.xml`, `site` constant in `src/data/site.ts`, `docs/seo.md`.
- frontend-engineer (after the three above): `src/components/Intro.tsx`, intro CSS in
  `src/styles.css`, `intro` config in `src/data/site.ts`, boot script in `src/routes/__root.tsx`,
  `src/routes/index.tsx`, `src/components/Footer.tsx`, README.
- site-qa / site-reviewer: report only.
- devops-engineer: deploy.

Never commit or push unless told. Never add the git remote of the old GitHub repo
(ellizaprollo-eng/wovie-prollo-portfolio belongs to another account).
