# Wovie Prollo Portfolio

Single-page portfolio built with TanStack Start (React 19), Tailwind CSS 4, and Nitro, deployed on Vercel.

## Editing content

All copy, links, and project data live in `src/data/site.ts`:

- `profile.photo`: profile photo (file in `public/`)
- `profile.heroVisual`: set to an image path to replace the built-in hero workflow diagram
- `booking.url`: Calendly link used by the Book a Call embed
- `proofPoints`, `caseStudies`, `tools`: only add claims documented in `public/resume.pdf` or project materials.

## Intro

A voiced intro overlay plays once per browser session before the page
(`src/components/Intro.tsx`), skipped automatically if the visitor already saw it this session
or prefers reduced motion.

- **Config**: `intro` in `src/data/site.ts`: the voice lines and captions, the run-log and
  button copy (including `labels.welcome`, the text of the finish-celebration "Welcome!"),
  the browser voice preference (`voice`, `rate`), the progress-bar length (`seconds`),
  `voiceFile`, and `enabled`.
- **The voice**: the browser's built-in speech voice reads `intro.lines[].say` (male, slightly
  slow and low, like the reference intro), so it sounds a little different on each device.
  To play a recording instead, put the file in `public/` and set `intro.voiceFile` to its path
  (for example `/intro-voice.mp3`), set `intro.seconds` to its length, and time each
  `intro.lines[].at` to when that line starts in the file. If a recording fails to load, the
  intro falls back to the browser voice.
- **Turn it off**: set `intro.enabled` to `false` in `src/data/site.ts`. This also hides the
  "Replay intro" footer button and stops the boot script from ever showing the overlay.
- **Replay it**: click "Replay intro" in the footer at any time (it works even with reduced
  motion, with the motion collapsed).
- **Finish celebration**: a confetti burst (the `canvas-confetti` package, loaded lazily so it
  never ships to visitors who skip the intro) plus a "Welcome!" pop, both in brand colors, no
  sound. Skipped under reduced motion except for a brief, confetti-free "Welcome!".

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Resume

`public/resume.pdf` is generated from `resume/resume.html` (same branding and
facts as the site). To update it, edit the HTML, open it in Chrome, then
Print > Save as PDF with Paper "Letter", Margins "None", and "Background
graphics" ticked, and save over `public/resume.pdf`.
