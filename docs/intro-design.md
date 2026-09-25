# Intro overlay: design spec

Owner: site-ui-designer. Implemented by frontend-engineer in `src/components/Intro.tsx` and the intro
block of `src/styles.css`. All class names start with `intro-`. Plain CSS, no Tailwind utilities
inside the overlay (the footer button in section 11 is the one Tailwind exception, to match the footer).

Read with `docs/intro-brief.md` (behavior) and `docs/intro-copy.md` (words). This file decides how
it looks and moves. Where a table and the CSS in section 12 disagree, section 12 wins.

---

## 0. Decisions at a glance

- **Concept:** the intro is a workflow run on a workflow canvas. The background is the dot grid
  of a workflow editor (n8n and GoHighLevel's builder both use one). The photo is the trigger node:
  an orange node travels the ring as it draws itself. The terminal is a run log with a node per
  step. The progress bar is an edge with three nodes that light up as the run passes them. The page
  opens when the last node lights.
- **Surface:** fixed `#0e121a` in both themes. One static warm glow at 10% alpha. No gradients
  besides that glow and the canvas mask.
- **Name:** Instrument Serif, upright, warm white `#f7f5f0`. **"Prollo" does not take the italic
  orange accent.** In the play state the caption's emphasized phrase is already Instrument Serif
  italic orange. It is the part that changes as the voice speaks, so it should be the only accent
  on screen. Two orange italics at once split the eye, and the design-gate lists serif italic
  accents as a tell, so the intro uses it once per screen.
- **Fonts:** Geist, Instrument Serif, and the system monospace stack the site already uses. No
  Poppins, no JetBrains Mono.
- **Motion:** the reference's timings are kept. Its playful parts are dropped: no letter rotation,
  no overshoot pop, no pulsing glow, no confetti. Every looping motion means something: equalizer
  = sound, button pulse = "start here", ring-node pulse = voice is speaking, caret = typing.

---

## 1. Layout and element order

### 1.1 DOM order (markup skeleton)

The overlay is a sibling of the page, outside the wrapper that gets `inert`. Wrap `<Navbar />` and
the page `div` in `src/routes/index.tsx` in one element, and make that element `inert`.

```html
<div class="intro is-gate" role="dialog" aria-modal="true"
     aria-labelledby="intro-name" aria-describedby="intro-role">
  <div class="intro-panel intro-panel--top" aria-hidden="true"></div>
  <div class="intro-panel intro-panel--bottom" aria-hidden="true"></div>
  <div class="intro-canvas" aria-hidden="true"></div>
  <div class="intro-glow" aria-hidden="true"></div>

  <div class="intro-stage">
    <div class="intro-c">
      <div class="intro-head">
        <div class="intro-mark">
          <svg class="intro-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle class="intro-ring-track" cx="60" cy="60" r="58" />
            <circle class="intro-ring-draw" cx="60" cy="60" r="58" pathLength="100" />
          </svg>
          <span class="intro-photo">
            <img src="{profile.photo}" alt="" width="400" height="400" decoding="async" />
          </span>
          <span class="intro-ring-tip" aria-hidden="true"></span>
        </div>
        <div class="intro-term" aria-hidden="true">
          <!-- JS renders at most the last 3 lines -->
          <div class="intro-term-line"><span class="intro-term-text">...</span></div>
          <div class="intro-term-line is-current">
            <span class="intro-term-text">...<span class="intro-caret"></span></span>
          </div>
        </div>
      </div>

      <div class="intro-body">
        <h2 class="intro-name" id="intro-name">
          <span class="intro-sr">Wovie Prollo</span>
          <span aria-hidden="true">
            <span class="intro-word"><span class="intro-glyph" style="--i:0">W</span>...</span>
            <span class="intro-word">...<span class="intro-glyph" style="--i:11">o</span></span>
          </span>
        </h2>
        <p class="intro-role" id="intro-role">{role}</p>

        <div class="intro-swap">
          <div class="intro-gate">
            <button type="button" class="intro-enter">
              <span class="intro-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              {enter with sound label}
            </button>
            <button type="button" class="intro-quiet">{enter without sound label}</button>
          </div>
          <div class="intro-play">
            <p class="intro-cap" aria-live="off"></p>
            <div class="intro-progress">
              <div class="intro-bar" role="progressbar" aria-label="Intro progress"
                   aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="--p:0%">
                <div class="intro-bar-layer intro-bar-base"><i></i><i></i><i></i></div>
                <div class="intro-bar-layer intro-bar-fill"><i></i><i></i><i></i></div>
              </div>
              <span class="intro-pct" aria-hidden="true">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <button type="button" class="intro-snd" aria-pressed="false" aria-label="{mute label}">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path class="intro-snd-on" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      <path class="intro-snd-off" d="M16 9l6 6M22 9l-6 6" />
    </svg>
  </button>
  <button type="button" class="intro-skip">{skip label}</button>
</div>
```

Notes for the build:
- Name letters are rendered in SSR, not generated by JS. `--i` is the character index **counting
  the space** (W=0 ... e=4, space=5, P=6 ... o=11), so the stagger matches the reference. Each word
  is an `intro-word` so a word never breaks mid-letter. Put a normal space text node between the
  two words. In TSX, pass `style={{ '--i': i } as React.CSSProperties}`.
- `intro-sr` is visually hidden (Tailwind's `sr-only` is equivalent). Screen readers read the
  name once, not letter by letter.
- The photo uses `profile.photo` from `src/data/site.ts`.

### 1.2 Stacking inside the overlay

| Layer | z-index | Element |
|---|---|---|
| Background | 0 | `.intro-panel--top`, `.intro-panel--bottom` (the dark surface) |
| Canvas | 1 | `.intro-canvas` (dot grid), `.intro-glow` |
| Content | 2 | `.intro-stage` (scroll container, centered column) |
| Controls | 3 | `.intro-snd` (bottom-left), `.intro-skip` (bottom-right) |

The overlay itself is `z-index: 100`. The mobile navbar is `z-40`.

### 1.3 Wireframes

Portrait phone, 390 x 844, gate state:

```
+----------------------------------+
|                                  |
|               o                  |  <- orange tip node at 12 o'clock
|          .--------.              |
|         (  photo   )             |  ring 104px, photo 84px
|          '--------'              |
|                                  |
|     o  trigger . intro opened    |  run log, 3 lines, fixed height
|     |                            |
|     *  > press enter to start_   |  current line, caret
|                                  |
|          Wovie Prollo            |  name, Instrument Serif
|   Certified GoHighLevel Expert   |  role, Geist, mist, 1-2 lines
|     . AI Automation Builder      |
|                                  |
|    [ |||| Enter with sound ]     |  swap block (gate), 52px pill
|        enter without sound       |  44px text button
|                                  |
|                                  |
|                  [ skip intro -> ]  <- bottom-right, 44px
+----------------------------------+
```

Portrait phone, play state (same cell, gate swapped for play, nothing above moves):

```
|          Wovie Prollo            |
|   Certified GoHighLevel Expert   |
|                                  |
|   Your leads get an answer in    |  caption, Geist 500,
|        *minutes, not days.*      |  emphasis Instrument Serif italic orange
|                                  |
|      *=======o--------o   42%    |  edge with 3 nodes, % to the right
|                                  |
| (spk)             [ skip intro -> ]
```

Landscape phone, 844 x 390: two columns.

```
+------------------------------------------------------------+
|        .------.                                            |
|       ( photo  )       Wovie Prollo                        |
|        '------'        Certified GoHighLevel Expert . AI.. |
|     o trigger ...                                          |
|     | action ...       [ |||| Enter with sound ]  enter .. |
|     * > press enter_                                       |
|                                                            |
| (spk)                                    [ skip intro -> ] |
+------------------------------------------------------------+
```

Desktop, 1440 x 900: same as portrait, larger (ring 128px, name 88px), centered, with 92px of
padding above and below the content.

---

## 2. Color

The intro stays dark in both themes, so it must **not** read the theme-switching `--color-*`
variables. It declares fixed aliases on `.intro`. Every value is an existing brand token or an
alpha of one. No new hues.

| Alias | Value | Token it comes from | Used for |
|---|---|---|---|
| `--intro-bg` | `#0e121a` | dark-theme `--color-paper` | panels, hollow node fill, `html` background during intro |
| `--intro-bg-2` | `#1c2433` | `--color-navy-2` | photo placeholder surface |
| `--intro-text` | `#f7f5f0` | `--color-paper` | name, caption, "complete" log line, hover text |
| `--intro-mist` | `#c9cfda` | `--color-mist` | role, ring stroke, current log line, quiet link, skip/mute |
| `--intro-dim` | `#8f98a8` | `--color-mist-dim` | finished log lines, % counter |
| `--intro-signal` | `#ff6a33` | dark-theme `--color-signal` | primary button, nodes, progress fill, caret |
| `--intro-signal-soft` | `#ff8a5c` | dark-theme `--color-signal-deep` | caption emphasis, primary hover, focus ring |
| `--intro-signal-hot` | `#ff5a1f` | `--color-signal` | primary active (pressed) |
| `--intro-ink` | `#141a26` | `--color-ink` | primary button label and equalizer bars |
| `--intro-line` | `rgb(255 255 255 / 0.14)` | white alpha, as on the site's dark cards | progress track, log connector |
| `--intro-line-strong` | `rgb(255 255 255 / 0.28)` | white alpha | skip/mute border on hover |
| `--intro-node-ring` | `rgb(255 255 255 / 0.35)` | as `FlowDivider` dark nodes | hollow node border |

Other fixed values:
- Ring track: `rgb(255 255 255 / 0.12)`. Skip/mute resting border: `rgb(255 255 255 / 0.16)`.
- Skip/mute hover fill: `rgb(255 255 255 / 0.06)`, pressed `rgb(255 255 255 / 0.10)`.
- Node halo: `0 0 0 3px rgb(255 106 51 / 0.22)` (same idea as the hero eyebrow dot).
- Canvas dots: `rgb(201 207 218 / 0.16)` (mist at 16%).
- Glow: `rgb(255 90 31 / 0.10)` at the center, fading to 0. This is the only glow.
- Button pulse ring: `rgb(255 106 51 / 0.45)` fading to `rgb(255 106 51 / 0)`.

Contrast (WCAG 2.x, computed). "Glow" means over the glow's brightest point, `#26191b`.

| Foreground | Background | Ratio | Needs | Result |
|---|---|---|---|---|
| `#f7f5f0` name, caption | `#0e121a` / glow | 17.21 / 15.58 | 4.5 | pass (AAA) |
| `#c9cfda` role, quiet link, skip | `#0e121a` / glow | 11.98 / 10.85 | 4.5 | pass (AAA) |
| `#8f98a8` finished log lines, % | `#0e121a` / glow | 6.45 / 5.84 | 4.5 | pass (AA) |
| `#ff8a5c` caption emphasis | `#0e121a` / glow | 8.07 / 7.31 | 4.5 | pass (AAA) |
| `#141a26` button label | `#ff6a33` default | 6.11 | 4.5 | pass (AA) |
| `#141a26` button label | `#ff8a5c` hover | 7.50 | 4.5 | pass (AAA) |
| `#141a26` button label | `#ff5a1f` active | 5.59 | 4.5 | pass (AA) |
| `#c9cfda` / `#f7f5f0` skip hover | `#1c2028` (6% white) | 10.43 / 14.98 | 4.5 | pass |
| `#ff8a5c` focus ring | `#0e121a` | 8.07 | 3.0 | pass |
| `#ff6a33` nodes, fill, caret | `#0e121a` | 6.57 | 3.0 | pass |
| `#c9cfda` ring stroke, mute icon | `#0e121a` | 11.98 | 3.0 | pass |
| hollow node border (35% white) | `#0e121a` | 3.20 | 3.0 | pass |
| quiet link underline (mist 45%) | `#0e121a` | 3.30 | n/a | decorative |
| track, ring track, dots, control border | `#0e121a` | 1.3 to 1.5 | n/a | decorative, or the control is identified by its label or icon |

The focus ring on the primary button sits 3px outside it, so it is measured against the navy
(8.07), not against the orange.

---

## 3. Type

| Element | Font | Size | Weight | Line-height | Tracking | Other |
|---|---|---|---|---|---|---|
| Name `.intro-name` | Instrument Serif (`--font-heading`) | `clamp(2.5rem, min(13vw, 12svh), 5.5rem)` with a `12vh` fallback line | 400 | 1 | -0.02em | `#f7f5f0`, upright, `white-space: nowrap` |
| Role `.intro-role` | Geist (`--font-sans`) | `clamp(0.9375rem, 0.875rem + 0.25vw, 1.125rem)` (15 to 18px) | 400 | 1.5 | 0 | `#c9cfda`, sentence or title case as written, `max-width: 34ch`, `text-wrap: balance` |
| Caption `.intro-cap` | Geist | `clamp(1.0625rem, 0.95rem + 0.9vw, 1.625rem)` (17 to 26px); 1.125rem in landscape phones | 500 | 1.35 | -0.01em | `#f7f5f0`, `max-width: 34ch`, `text-wrap: balance` |
| Caption emphasis `.intro-cap em` | Instrument Serif italic | 1.12em (the serif has a smaller x-height) | 400 | 1 | 0 | `#ff8a5c` |
| Run log `.intro-term` | system mono (`--font-mono`) | 0.75rem phones, 0.8125rem at 768px+ | 400 | 18px phones, 20px at 768px+ | 0 | fixed 3-line height |
| Primary button `.intro-enter` | Geist | 1rem, 1.0625rem at 768px+ | 500 | 1 | 0 | `#141a26` |
| Quiet link `.intro-quiet` | Geist | 0.875rem | 400 | 1.2 | 0 | underline 1px, offset 5px |
| Skip `.intro-skip` | system mono | 0.8125rem | 400 | 1 | 0.02em | text as written in the copy, no text-transform |
| % counter `.intro-pct` | system mono | 0.75rem | 400 | 1 | 0 | `tabular-nums`, `min-width: 4ch` |

Resolved name sizes: 390x844 = 50.7px, 360x640 = 46.8px, 844x390 = 40.8 to 46.8px (limited by
height), 1440x900 = 88px. "Wovie Prollo" is about 4.8em wide, so it takes 170 to 425px and fits on
one line at every size down to 320px.

Instrument Serif ships one weight. Never set it above 400 (the site already guards `.font-heading`).

---

## 4. Background: the workflow canvas

The reference's square grid becomes a **dot grid**, the canvas of a workflow editor.

- `.intro-canvas`: `background-image: radial-gradient(circle, rgb(201 207 218 / 0.16) 1px, transparent 1.5px)`,
  `background-size: 24px 24px`, `background-position: center` (a dot sits exactly on the center line).
- Masked so it fades out toward the edges:
  `mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 100%)` (include the
  `-webkit-` prefix).
- It is static. It fades out with the content on exit.
- `.intro-glow`, the one warm glow:
  `radial-gradient(circle closest-side at 50% 45%, rgb(255 90 31 / 0.10), rgb(255 90 31 / 0.05) 40%, rgb(255 90 31 / 0.015) 70%, rgb(255 90 31 / 0))`.
  The two middle stops ease the falloff so it does not band on 8-bit screens. It is static. The
  reference's pulsing glow is dropped.
- No network SVG. The nodes and lines live in the ring, the log, and the progress edge, where they
  carry meaning.

---

## 5. The signature: nodes on a run

Three node-and-line pieces, all drawn the same way: 7px circles, 1px lines.

**Ring and tip node (trigger).**
- SVG `viewBox="0 0 120 120"`, two circles at `r="58"`, stroke-width 1.5 (1.3 to 1.6px on screen).
  The SVG is rotated -90deg so the stroke starts at 12 o'clock and runs clockwise.
- `.intro-ring-track` stays visible from the first frame at `rgb(255 255 255 / 0.12)`.
- `.intro-ring-draw` uses `pathLength="100"`, `stroke-dasharray: 100`, round caps, `#c9cfda`. It
  animates `stroke-dashoffset` from 100 to 0. Do not add `vector-effect: non-scaling-stroke`: it
  breaks dash math together with `pathLength` in some browsers.
- `.intro-ring-tip` is an absolutely positioned box over the ring (`inset: 0`). Its `::before` is
  the node: 7px, `#ff6a33`, 3px halo, horizontally centered, `top: calc(var(--ring) / 60)`, which
  puts it on the stroke's centerline. The box rotates 0 to 360deg with the **same duration, delay
  and easing** as the dash, so the node rides the tip of the line. At the end it rests at
  12 o'clock as the trigger node.
- In play with the voice on, `::after` (same node) pulses behind it: scale 1 to 3, opacity 0.35 to
  0, 2.4s ease-out, infinite. This is the site's `.flow-pulse`, and here it means "the voice is
  speaking". It stops when muted.

**Run log.** Each line has a 7px node at the left (`left: 2px`, vertically centered on the line)
and a 1px connector to the line above (`left: 5px`, `--intro-line`). Node states:
- finished line: hollow (fill `#0e121a`, 1px border at 35% white), text `#8f98a8`
- current line: solid `#c9cfda`, text `#c9cfda`
- complete line (`is-ok`): solid `#ff6a33` with a 3px halo, text `#f7f5f0`

**Progress edge.** A 1px line with nodes at 0%, 50%, 100% (the `FlowDivider` pattern). There are
two identical layers: the base (track at 14% white, hollow nodes) and the fill (line and nodes in
`#ff6a33`). The fill layer is clipped by `clip-path: inset(-4px calc(100% - var(--p)) -4px -4px)`,
so the orange flows along the line and fills each node as it passes. JS sets `--p` on `.intro-bar`
every frame. At 100%, add `.is-done` to show the whole end node. Where the nodes land matches the
log: start node = trigger line, middle node = action line (the log types it at 50%), end node =
complete.

---

## 6. Motion

Everything in the gate uses `calc(var(--intro-t0) + <delay>)`. `--intro-t0` is `0ms` on first load
and `600ms` on replay (while the panels close, see 6.4). JS timers add the same offset.

All "enter" animations use **`backwards` fill** with the visible state as the base style. If
animations never run, everything is visible, and the exit transitions are not blocked by a
filled animation.

### 6.1 Gate (times from overlay first paint, plus t0)

| Time | What | Duration | Easing | Keyframes | Why |
|---|---|---|---|---|---|
| 0 | Panels, canvas, glow, ring track, tip node, skip are present | none | none | none | Nothing fades in on first paint; the dark screen is the first frame |
| 0 | Photo pops `.intro-photo` | 0.9s | `cubic-bezier(.2,.8,.2,1)` | from `opacity:0; scale(.86)` | Reference's pop without the overshoot and at a smaller scale change (calm brand). Applied to the photo only; the ring is a drawn line and does not scale |
| 0.20s | Ring draws `.intro-ring-draw` | 1.6s | `cubic-bezier(.65,0,.35,1)` | `stroke-dashoffset` 100 to 0 | Kept from the reference |
| 0.20s | Tip node rides the stroke `.intro-ring-tip` | 1.6s | same as the ring | `rotate(0)` to `rotate(360deg)` | The node shows the line being traced |
| 0.35s | Log line 1 types (JS) | 22ms per character | linear | none | Kept |
| +0.20s after line 1 ends | Prompt line types (JS) | 22ms per character | linear | none | Kept |
| 0.75s + i x 35ms | Name letters `.intro-glyph` (last one starts at 1.135s, done by 1.835s) | 0.7s | `cubic-bezier(.2,.8,.2,1)` | from `opacity:0; translateY(.3em); blur(6px)` | Kept, minus the 6deg rotation. `.3em` scales with the type instead of a fixed 24px |
| 1.50s | Role fades `.intro-role` | 0.8s | `ease` | from `opacity:0` | Kept |
| 1.70s | Gate fades in `.intro-gate` | 0.8s | `ease` | from `opacity:0; visibility:hidden` to `opacity:1; visibility:visible` | Kept. `visibility` keeps the buttons out of the tab order until they can be seen |
| 1.80s | JS focuses `.intro-enter` (`preventScroll`) | none | none | none | The reference focused at 0.9s, while the button was still invisible |
| 2.50s, every 2s | Pulse ring on `.intro-enter` | 2s, infinite | `ease-out` | `box-shadow: 0 0 0 0 rgb(255 106 51/.45)` to `0 0 0 16px rgb(255 106 51/0)` | Starts once the button is fully in. Stops on `:hover` and `:focus-visible` |
| always | Equalizer bars `.intro-eq i` | 1s, infinite | `ease-in-out` | `scaleY(.3)` to `1` to `.3`, origin bottom. Delays 0, -0.3s, -0.6s, -0.15s | Kept. Says "this has sound" |
| always | Caret `.intro-caret` | 0.8s, infinite | `steps(1)` | 50%: `opacity:0` | Kept |

### 6.2 Play (times from the click that starts it)

| Time | What | Duration | Easing | Notes |
|---|---|---|---|---|
| 0 | Gate out `.intro-gate` | 0.2s | `ease` | opacity to 0, then `visibility:hidden`. Its entry animation is removed first (`animation:none`) so it cannot fade back in |
| 0.10s | Play block in `.intro-play` | 0.3s | `ease` | opacity 0 to 1. **Gate and play share one grid cell**, so the ring, log, name and role do not move |
| 0.10s | Mute button in `.intro-snd` | 0.4s | `ease` | opacity 0 to 1 |
| 0 to 10s | Progress `--p` 0% to 100%, and the % text | 10s (`INTRO_SECONDS`) | linear, rAF | The start node lights at once (the run is triggered) |
| 0 | Ring node pulse | 2.4s, infinite | `ease-out` | Only while the voice is on (`.is-play:not(.is-muted)`) |
| 0.5s | Log: first run line | typing | 22ms/char | the previous current line turns "finished" |
| 5.0s | Log: action line | typing | 22ms/char | if the copy has more run lines, space them evenly between 0.5s and 5.0s |
| `INTRO_SECONDS - 1.6s` (8.4s) | Log: complete line, `is-ok` | typing | 22ms/char | Kept |
| 0.2s / 3.4s / 7.0s, or +1.6s each when the voice is on | Caption fallback timers | see below | | Kept. The utterance's `onstart` shows a caption earlier if it fires first |
| caption swap | out: remove `is-on` | 0.18s | `cubic-bezier(.4,0,1,1)` | to `opacity:0; translateY(10px); blur(4px)` |
| +0.18s | in: set text, add `is-on` | 0.45s | `cubic-bezier(.2,.8,.2,1)` | to `opacity:1; transform:none; filter:none` |
| 10s | `.intro-bar.is-done` | none | none | shows the whole end node. Finish when the voice is done, or at 14s at the latest (kept) |

### 6.3 Exit (times from `finish()`)

| Time | What | Duration | Easing |
|---|---|---|---|
| 0 | `.is-out`: voice stops; `.intro-c` to `opacity:0; translateY(-20px) scale(.96)` | 0.45s | `cubic-bezier(.4,0,.2,1)` |
| 0 | Canvas, glow, skip and mute fade to 0 (controls become `visibility:hidden`) | 0.4s | `ease` |
| 0.38s | `.is-open`: top panel `translateY(-101%)`, bottom `translateY(101%)`. Remove `html.intro-on`; remove `inert` from the page | 0.9s | `cubic-bezier(.77,0,.18,1)` |
| 1.40s | Unmount the overlay. On replay, return focus to the "Replay intro" button | none | none |

Panels are `height: 50.5%` each (1% overlap hides the seam), so -101% of that clears the screen.

### 6.4 Replay entry (new)

On replay the page is visible, so a hard cut to navy would be jarring. The overlay mounts with
`.is-replay`:
- Panels close over the page: animation `from { translateY(-101%) }` (top) and
  `from { translateY(101%) }` (bottom), 0.6s, `cubic-bezier(.77,0,.18,1)`, `backwards`. This is the
  exit reversed.
- Canvas, glow and skip fade in: 0.4s `ease`, delay 0.4s.
- `--intro-t0: 600ms`, so the gate sequence starts as the panels meet.
- `finish()` removes `.is-replay` first, so a skip during the close hands off to the open transition.

### 6.5 What does not move

The canvas, the glow, the role after it appears, the name after it lands, and the skip button.
Hover changes are color and border only, 0.15s `ease`. The primary button also moves 1px when
pressed. Nothing uses scroll-triggered motion.

---

## 7. States

Classes on `.intro`. `is-gate` and `is-play` are mutually exclusive; `is-muted`, `no-voice` and
`is-replay` combine with them; `is-out` then `is-open` are added in order.

| State | Visible | Hidden | Notes |
|---|---|---|---|
| `is-gate` | panels, canvas, glow, ring, photo, log (trigger + prompt), name, role, gate (primary + quiet), skip | play block (`visibility:hidden`, keeps its space), mute | Enter = start with sound, Escape = skip |
| `is-play` | everything above except the gate; plus caption, progress edge, %, mute | gate | Focus moves to the mute button when play starts (the clicked button just disappeared). Caption `aria-live="off"` while the voice is on |
| `is-play.is-muted` | same as play; mute icon shows the crossed speaker; `aria-pressed="true"`; label "Unmute" | ring-node pulse | Caption `aria-live="polite"` so screen reader users get the lines without two voices at once. "Enter without sound" starts in this state |
| `no-voice` | same as play | mute button (`display:none`) | When there is no `speechSynthesis` and no `voiceFile`. Captions run on timers |
| `is-out` | panels | content, canvas, glow, skip, mute (all fading) | `pointer-events:none` on the overlay |
| `is-open` | panels sliding apart, the page between them | everything else | `display:block` is kept by `.intro.is-open` even though `html.intro-on` is gone |
| `is-replay` | as gate, entered by closing panels | none | Removed at `finish()` |
| No JS, or intro already seen, or reduced motion on first load | the page | the whole overlay (`display:none`) | The boot script never adds `intro-on` |

---

## 8. Responsive rules

Sizes are custom properties on `.intro`, changed per tier. Tiers are applied in this order (the
landscape tier is last and wins).

| Property | Base (portrait phones, short laptops) | Short portrait `(orientation: portrait) and (max-height: 700px)` | 768px+ | 768px+ and 701px+ tall | Landscape short `(orientation: landscape) and (max-height: 520px)` |
|---|---|---|---|---|---|
| `--ring` / photo inset | 104px / 10px (photo 84px) | 88px / 9px (photo 70px) | n/a | 128px / 12px (photo 104px) | 88px / 9px |
| ring to log gap | 20px | 16px | n/a | 28px | 14px |
| log line / size | 18px / 12px | same | 20px / 13px | same | 18px / 12px |
| log to name gap | 14px | 12px | n/a | 20px | 0 (other column) |
| name to role gap | 10px | 8px | n/a | 14px | 8px |
| role to swap gap | 24px | 20px | n/a | 32px | 16px |
| `--edge` (control inset) | 16px | 16px | 24px | 24px | 12px |
| stage padding | top 24px; bottom `edge + 60px` | same | same | 92px top and bottom | top 16px; bottom `edge + 60px` |
| primary button height | 52px | 52px | 56px | 56px | 48px |
| caption reserve | 3 lines | 3 lines | 2 lines | 2 lines | 2 lines, 1.125rem |

The bottom padding is `max(edge, safe-area-inset-bottom) + 44px + 16px`: the controls' inset, their
height, and a 16px gap. **The content column can never reach the skip or mute buttons**, at any
width. Side padding is `max(16px, safe-area-inset-left/right)`, so the phone side gutter is 16px.

**Scroll safety.** `.intro-stage` is a flex column with `overflow-y: auto`, and `.intro-c` is
centered with `margin-block: auto`. When the content fits, it is centered. If a very small or
zoomed screen cannot fit it, it starts at the top and scrolls instead of being clipped. The overlay
is `overflow: hidden` and `.intro-stage` is `overflow-x: hidden`, so nothing can scroll sideways.

**Landscape tier layout.** `.intro-c` becomes a row: `.intro-head` (ring + log, `flex: 0 1 15rem`,
left-aligned) and `.intro-body` (name, role, swap, `flex: 0 1 26rem`, left-aligned), gap 40px,
`max-width: 46rem`, vertically centered. The gate buttons sit side by side (`flex-wrap: wrap`,
gap 8px 12px). The play block is left-aligned, with the % to the right of the bar.

Checked heights (content height vs space between the stage paddings):

| Viewport | Content (gate / play) | Available | Controls clear? |
|---|---|---|---|
| 390 x 844 (Safari with toolbars, about 390 x 664) | about 420 / 431 | 744 (564) | yes |
| 360 x 640 (about 360 x 560 in Safari) | about 390 / 391 | 540 (460) | yes |
| 844 x 390 (about 844 x 340 in Safari) | head 156, body about 167 to 195 | 302 (252) | yes. The controls sit in the bottom 68px, and the content ends above that |
| 667 x 375 (smaller landscape) | same, columns shrink to 218 + 394px | 287 | yes. Log lines truncate with an ellipsis |
| 1440 x 900 | about 506 | 716 | yes |
| 1366 x 650 (short laptop, base tier) | about 490 | 542 | yes |

Widths at 360px: log `min(22rem, 100%)` = 328px, progress bar `min(16rem, 58vw)` = 209px, with the %
positioned 12px to its right (ends at 325px, inside the 344px limit).

Touch targets: primary 52/56/48px tall; quiet link 44px; mute 44 x 44px; skip 44px tall. On touch,
buttons get `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent`. The
`:active` states give the press feedback.

---

## 9. Accessibility

- **Dialog.** `role="dialog"`, `aria-modal="true"`, labelled by the name (`#intro-name`),
  described by the role (`#intro-role`). The page wrapper is `inert` while the intro is up. DOM
  order = tab order: primary, quiet (gate) → mute (play) → skip.
- **Focus.** The primary button gets focus at t0 + 1.8s, after the gate is visible. When play
  starts, focus moves to the mute button. When the overlay unmounts after a replay, focus returns
  to the "Replay intro" button.
- **Focus-visible style.** `outline: 2px solid #ff8a5c; outline-offset: 3px` on every intro button
  (`.intro button:focus-visible`). **The site's global `:focus-visible` also sets
  `border-radius: 4px`, which would square off the pills.** So each control re-declares its own
  radius in `:focus-visible`: primary and skip `9999px`, mute `50%`, quiet `6px`. The primary's
  pulse stops while it has focus, so the ring and the pulse never overlap.
- **Contrast.** See section 2. Every text pair passes AA. Role and caption pass AAA (11.98 and
  17.21). The dimmest text, finished log lines and the %, is 6.45 (5.84 over the glow).
- **Screen readers.** The name is read once (`intro-sr`); the letters are `aria-hidden`. The log
  and the % are `aria-hidden` (decorative, duplicated by the progressbar). The progress bar is a
  `progressbar` with `aria-valuenow` updated **only when the whole percent changes**, not every
  frame. Caption `aria-live` is `off` while the voice speaks and `polite` when muted or silent.
  Mute is a toggle: `aria-pressed` plus a label that changes between mute and unmute.
- **Keyboard.** Enter (not on a button) starts with sound; Escape skips (brief).
- **Forced colors.** The primary button has a `1px solid transparent` border so it keeps an outline
  in Windows high contrast. The % text carries progress if the bar's colors are overridden.
- **Reduced motion.** The intro is skipped on load for reduced motion, but "Replay intro" can open
  it. Under `prefers-reduced-motion: reduce`:

| Effect | Fallback |
|---|---|
| Panel close on replay | none; the overlay fades in over 0.2s linear |
| Ring draw, tip node travel, photo pop, letters, role, gate | all appear at once (1ms, no delay, `--intro-t0: 0`) |
| Letter blur, caption blur and slide | removed (`filter:none`, `transform:none`) |
| Log typing | JS prints each line whole, no per-character typing |
| Caret blink, equalizer, button pulse, ring-node pulse | `animation:none`. Bars rest at `scaleY(.55)`, the caret stays solid |
| Gate/play swap, caption swap, control fades | 1ms |
| Progress edge | still fills linearly. It is a status indicator tied to time, slow and small, not decoration |
| Exit | content hides at once; **panels do not move**; the overlay fades out over 0.2s linear |
| JS focus timer | focus the primary button right after mount |

---

## 10. Placeholders and fallbacks

- **Photo fails to load** (`onError`): hide the `img`, render
  `<span class="intro-photo-fallback">W</span>` (the first letter of `profile.name`, the same "W"
  as the navbar mark). Instrument Serif, `font-size: calc(var(--ring) * .42)`, `#f7f5f0`, on the
  photo circle's `#1c2433`. The ring and node still draw, so the frame looks finished.
- **Photo loading:** the circle shows `#1c2433` until the image paints (no white flash).
- **Role missing** (empty string in config): do not render the `p`; the swap gap applies after
  the name. Remove `aria-describedby`.
- **No voice available:** `no-voice` state; the primary still starts the intro. Captions and the
  progress edge carry it.
- **Fonts late:** letters can start in Georgia and swap to Instrument Serif. See concerns.
- **Very long copy:** log lines truncate with an ellipsis. Captions longer than the reserve grow
  the block (the content shifts once); keep to the limits in section 14.

---

## 11. "Replay intro" footer control

In `src/components/Footer.tsx`, add a last `<li>` after LinkedIn. It is a `button`, because it
does something rather than going somewhere. It matches the footer links exactly: it inherits
`text-sm text-muted` from the row, `hover:text-ink`, no underline, no transition (the other links
have none). The global orange `:focus-visible` outline applies.

```tsx
<li>
  <button
    type="button"
    onClick={replayIntro}
    className="relative cursor-pointer hover:text-ink before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
  >
    Replay intro
  </button>
</li>
```

- `cursor-pointer` is needed because Tailwind 4 gives buttons the default cursor.
- The `before:` pseudo-element enlarges the hit area to about 44px tall (20px line + 12px + 12px)
  without changing the row's height or alignment.
- Render it only after hydration (for example, a `mounted` state set in `useEffect`), so a no-JS
  visitor never sees a button that does nothing.
- The label comes from `docs/intro-copy.md` if the copywriter sets one; "Replay intro" is the
  brief's wording.

---

## 12. CSS (reference implementation)

Add this to `src/styles.css`, after the existing rules. It is plain CSS and does not depend on any
Tailwind utility.

```css
/* ================= Intro overlay (docs/intro-design.md) ================= */
/* Fixed values: the intro is dark in both themes, so it does not read the
   theme-switching --color-* variables. Every value is an existing brand token. */
.intro {
  --intro-bg: #0e121a;
  --intro-bg-2: #1c2433;
  --intro-text: #f7f5f0;
  --intro-mist: #c9cfda;
  --intro-dim: #8f98a8;
  --intro-signal: #ff6a33;
  --intro-signal-soft: #ff8a5c;
  --intro-signal-hot: #ff5a1f;
  --intro-ink: #141a26;
  --intro-line: rgb(255 255 255 / 0.14);
  --intro-line-strong: rgb(255 255 255 / 0.28);
  --intro-node-ring: rgb(255 255 255 / 0.35);
  --intro-mono: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace);

  --intro-t0: 0ms;
  --ring: 104px;
  --photo-inset: 10px;
  --term-lh: 18px;
  --term-size: 0.75rem;
  --gap-ring: 20px;
  --gap-term: 14px;
  --gap-role: 10px;
  --gap-swap: 24px;
  --edge: 16px;

  position: fixed;
  inset: 0;
  z-index: 100;
  display: none;
  overflow: hidden;
  overscroll-behavior: contain;
  color: var(--intro-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
html.intro-on .intro,
.intro.is-open {
  display: block;
}
/* Scroll lock. The stable gutter stops the page from shifting sideways when the
   scrollbar comes back; the html background paints that gutter navy. */
html.intro-on {
  overflow: hidden;
  scrollbar-gutter: stable;
  background-color: #0e121a;
}
html.intro-on body {
  overflow: hidden;
}
.intro.is-replay {
  --intro-t0: 600ms;
}
.intro button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* ---- Surface ---- */
.intro-panel {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  height: 50.5%;
  background: var(--intro-bg);
  transition: transform 0.9s cubic-bezier(0.77, 0, 0.18, 1);
}
.intro-panel--top { top: 0; }
.intro-panel--bottom { bottom: 0; }
.intro.is-open .intro-panel--top { transform: translateY(-101%); }
.intro.is-open .intro-panel--bottom { transform: translateY(101%); }
.intro.is-replay .intro-panel--top {
  animation: intro-close-top 0.6s cubic-bezier(0.77, 0, 0.18, 1) backwards;
}
.intro.is-replay .intro-panel--bottom {
  animation: intro-close-bottom 0.6s cubic-bezier(0.77, 0, 0.18, 1) backwards;
}

.intro-canvas,
.intro-glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.intro-canvas {
  background-image: radial-gradient(circle, rgb(201 207 218 / 0.16) 1px, transparent 1.5px);
  background-size: 24px 24px;
  background-position: center;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 100%);
}
.intro-glow {
  background: radial-gradient(
    circle closest-side at 50% 45%,
    rgb(255 90 31 / 0.1),
    rgb(255 90 31 / 0.05) 40%,
    rgb(255 90 31 / 0.015) 70%,
    rgb(255 90 31 / 0)
  );
}
.intro.is-replay .intro-canvas,
.intro.is-replay .intro-glow,
.intro.is-replay .intro-skip {
  animation: intro-fade-in 0.4s ease 0.4s backwards;
}

/* ---- Stage and column ---- */
.intro-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-top: max(24px, env(safe-area-inset-top));
  padding-bottom: calc(max(var(--edge), env(safe-area-inset-bottom)) + 60px);
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
.intro-c {
  width: 100%;
  max-width: 40rem;
  margin-block: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.intro-head,
.intro-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
}

/* ---- Ring, photo, tip node ---- */
.intro-mark {
  position: relative;
  flex: none;
  width: var(--ring);
  height: var(--ring);
  margin-bottom: var(--gap-ring);
}
.intro-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);
}
.intro-ring circle {
  fill: none;
  stroke-width: 1.5;
}
.intro-ring-track {
  stroke: rgb(255 255 255 / 0.12);
}
.intro-ring-draw {
  stroke: var(--intro-mist);
  stroke-linecap: round;
  stroke-dasharray: 100;
  animation: intro-ring 1.6s cubic-bezier(0.65, 0, 0.35, 1) calc(var(--intro-t0) + 0.2s) backwards;
}
.intro-photo {
  position: absolute;
  inset: var(--photo-inset);
  border-radius: 50%;
  clip-path: circle(50%);
  background: var(--intro-bg-2);
  animation: intro-pop 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) var(--intro-t0) backwards;
}
.intro-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.15);
  transform-origin: 50% 20%;
}
.intro-photo-fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-heading);
  font-size: calc(var(--ring) * 0.42);
  line-height: 1;
  color: var(--intro-text);
}
.intro-ring-tip {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: intro-tip 1.6s cubic-bezier(0.65, 0, 0.35, 1) calc(var(--intro-t0) + 0.2s) backwards;
}
.intro-ring-tip::before,
.intro-ring-tip::after {
  content: '';
  position: absolute;
  left: 50%;
  top: calc(var(--ring) / 60);
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: var(--intro-signal);
}
.intro-ring-tip::before {
  z-index: 1;
  box-shadow: 0 0 0 3px rgb(255 106 51 / 0.22);
}
.intro-ring-tip::after {
  opacity: 0;
}
.intro.is-play:not(.is-muted) .intro-ring-tip::after {
  animation: intro-node-pulse 2.4s ease-out infinite;
}

/* ---- Run log ---- */
.intro-term {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: min(22rem, 100%);
  height: calc(var(--term-lh) * 3);
  margin-bottom: var(--gap-term);
  font-family: var(--intro-mono);
  font-size: var(--term-size);
  line-height: var(--term-lh);
  color: var(--intro-dim);
  text-align: left;
}
.intro-term-line {
  position: relative;
  flex: none;
  padding-left: 20px;
}
.intro-term-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.intro-term-line::before {
  content: '';
  position: absolute;
  z-index: 1;
  left: 2px;
  top: calc(var(--term-lh) / 2 - 3.5px);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid var(--intro-node-ring);
  background: var(--intro-bg);
}
.intro-term-line + .intro-term-line::after {
  content: '';
  position: absolute;
  left: 5px;
  top: calc(var(--term-lh) / -2);
  width: 1px;
  height: var(--term-lh);
  background: var(--intro-line);
}
.intro-term-line.is-current { color: var(--intro-mist); }
.intro-term-line.is-current::before {
  border-color: var(--intro-mist);
  background: var(--intro-mist);
}
.intro-term-line.is-ok { color: var(--intro-text); }
.intro-term-line.is-ok::before {
  border-color: var(--intro-signal);
  background: var(--intro-signal);
  box-shadow: 0 0 0 3px rgb(255 106 51 / 0.22);
}
.intro-caret {
  display: inline-block;
  width: 0.6em;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.2em;
  background: var(--intro-signal);
  animation: intro-blink 0.8s steps(1) infinite;
}

/* ---- Name and role ---- */
.intro-name {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 400;
  font-size: clamp(2.5rem, min(13vw, 12vh), 5.5rem);
  font-size: clamp(2.5rem, min(13vw, 12svh), 5.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--intro-text);
  white-space: nowrap;
}
.intro-word {
  display: inline-block;
}
.intro-glyph {
  display: inline-block;
  animation: intro-letter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) calc(var(--intro-t0) + 0.75s + var(--i) * 35ms) backwards;
}
.intro-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.intro-role {
  margin: var(--gap-role) 0 0;
  max-width: 34ch;
  font-size: clamp(0.9375rem, 0.875rem + 0.25vw, 1.125rem);
  font-weight: 400;
  line-height: 1.5;
  color: var(--intro-mist);
  text-wrap: balance;
  animation: intro-fade-in 0.8s ease calc(var(--intro-t0) + 1.5s) backwards;
}

/* ---- Gate and play share one grid cell, so nothing above them moves ---- */
.intro-swap {
  display: grid;
  width: 100%;
  margin-top: var(--gap-swap);
  justify-items: center;
}
.intro-gate,
.intro-play {
  grid-area: 1 / 1;
}
.intro-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: intro-gate-in 0.8s ease calc(var(--intro-t0) + 1.7s) backwards;
}
.intro-play {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  opacity: 0;
  visibility: hidden;
}
.intro.is-play .intro-gate {
  animation: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0s linear 0.2s;
}
.intro.is-play .intro-play {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease 0.1s;
}

/* ---- Buttons ---- */
.intro-enter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 24px 0 20px;
  border: 1px solid transparent;
  border-radius: 9999px;
  background: var(--intro-signal);
  color: var(--intro-ink);
  font: 500 1rem/1 var(--font-sans);
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
  animation: intro-call 2s ease-out calc(var(--intro-t0) + 2.5s) infinite;
}
.intro-enter:hover {
  background: var(--intro-signal-soft);
  animation: none;
}
.intro-enter:active {
  background: var(--intro-signal-hot);
  transform: translateY(1px);
}
.intro-eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: 14px;
}
.intro-eq i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 1.5px;
  background: currentColor;
  transform-origin: bottom;
  transform: scaleY(0.55);
  animation: intro-eq 1s ease-in-out infinite;
}
.intro-eq i:nth-child(2) { animation-delay: -0.3s; }
.intro-eq i:nth-child(3) { animation-delay: -0.6s; }
.intro-eq i:nth-child(4) { animation-delay: -0.15s; }

.intro-quiet {
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--intro-mist);
  font: 400 0.875rem/1.2 var(--font-sans);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: rgb(201 207 218 / 0.45);
  text-underline-offset: 5px;
  cursor: pointer;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}
.intro-quiet:hover {
  color: var(--intro-text);
  text-decoration-color: var(--intro-text);
}

/* ---- Caption and progress edge ---- */
.intro-cap {
  width: 100%;
  max-width: 34ch;
  min-height: calc(1.35em * 3);
  margin: 0;
  font-size: clamp(1.0625rem, 0.95rem + 0.9vw, 1.625rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--intro-text);
  text-wrap: balance;
  opacity: 0;
  transform: translateY(10px);
  filter: blur(4px);
  transition:
    opacity 0.18s cubic-bezier(0.4, 0, 1, 1),
    transform 0.18s cubic-bezier(0.4, 0, 1, 1),
    filter 0.18s cubic-bezier(0.4, 0, 1, 1);
}
.intro-cap.is-on {
  opacity: 1;
  transform: none;
  filter: none;
  transition-duration: 0.45s;
  transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}
.intro-cap em {
  font-family: var(--font-heading);
  font-size: 1.12em;
  font-style: italic;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;
  color: var(--intro-signal-soft);
}
.intro-progress {
  position: relative;
}
.intro-bar {
  position: relative;
  width: min(16rem, 58vw);
  height: 7px;
}
.intro-bar-layer {
  position: absolute;
  inset: 0;
}
.intro-bar-layer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 3px;
  height: 1px;
}
.intro-bar-layer i {
  position: absolute;
  top: 0;
  width: 7px;
  height: 7px;
  margin-left: -3.5px;
  border-radius: 50%;
}
.intro-bar-layer i:nth-child(1) { left: 0; }
.intro-bar-layer i:nth-child(2) { left: 50%; }
.intro-bar-layer i:nth-child(3) { left: 100%; }
.intro-bar-base::before { background: var(--intro-line); }
.intro-bar-base i {
  border: 1px solid var(--intro-node-ring);
  background: var(--intro-bg);
}
.intro-bar-fill::before,
.intro-bar-fill i {
  background: var(--intro-signal);
}
.intro-bar-fill {
  clip-path: inset(-4px calc(100% - var(--p, 0%)) -4px -4px);
}
.intro-bar.is-done .intro-bar-fill {
  clip-path: inset(-4px);
}
.intro-pct {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  min-width: 4ch;
  font: 400 0.75rem/1 var(--intro-mono);
  font-variant-numeric: tabular-nums;
  color: var(--intro-dim);
}

/* ---- Corner controls ---- */
.intro-snd,
.intro-skip {
  position: absolute;
  z-index: 3;
  bottom: max(var(--edge), env(safe-area-inset-bottom));
  min-height: 44px;
  border: 1px solid rgb(255 255 255 / 0.16);
  background: transparent;
  color: var(--intro-mist);
  cursor: pointer;
}
.intro-snd {
  left: max(var(--edge), env(safe-area-inset-left));
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  opacity: 0;
  visibility: hidden;
  transition:
    background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    opacity 0.4s ease, visibility 0s linear 0.4s;
}
.intro-snd svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.intro-snd .intro-snd-off { display: none; }
.intro.is-muted .intro-snd-on { display: none; }
.intro.is-muted .intro-snd-off { display: inline; }
.intro.no-voice .intro-snd { display: none; }
.intro-skip {
  right: max(var(--edge), env(safe-area-inset-right));
  padding: 0 16px;
  border-radius: 9999px;
  font: 400 0.8125rem/1 var(--intro-mono);
  letter-spacing: 0.02em;
  transition:
    background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    opacity 0.4s ease, visibility 0s linear;
}
.intro-snd:hover,
.intro-skip:hover {
  background: rgb(255 255 255 / 0.06);
  border-color: var(--intro-line-strong);
  color: var(--intro-text);
}
.intro-snd:active,
.intro-skip:active {
  background: rgb(255 255 255 / 0.1);
}
.intro.is-play .intro-snd {
  opacity: 1;
  visibility: visible;
  transition:
    background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    opacity 0.4s ease 0.1s, visibility 0s linear 0s;
}

/* ---- Focus ---- */
.intro button:focus-visible {
  outline: 2px solid var(--intro-signal-soft);
  outline-offset: 3px;
}
/* The global :focus-visible sets border-radius: 4px; keep each control's own shape. */
.intro-enter:focus-visible { border-radius: 9999px; animation: none; }
.intro-skip:focus-visible { border-radius: 9999px; }
.intro-snd:focus-visible { border-radius: 50%; }
.intro-quiet:focus-visible { border-radius: 6px; }

/* ---- Exit (after the play rules so these win) ---- */
.intro.is-out .intro-c {
  opacity: 0;
  transform: translateY(-20px) scale(0.96);
}
.intro.is-out .intro-canvas,
.intro.is-out .intro-glow {
  opacity: 0;
}
.intro.is-out .intro-snd,
.intro.is-out .intro-skip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0s linear 0.4s;
}
.intro.is-out,
.intro.is-open {
  pointer-events: none;
}

/* ---- Keyframes ---- */
@keyframes intro-ring { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
@keyframes intro-tip { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes intro-pop { from { opacity: 0; transform: scale(0.86); } }
@keyframes intro-letter { from { opacity: 0; transform: translateY(0.3em); filter: blur(6px); } }
@keyframes intro-fade-in { from { opacity: 0; } }
@keyframes intro-gate-in {
  from { opacity: 0; visibility: hidden; }
  to { opacity: 1; visibility: visible; }
}
@keyframes intro-call {
  from { box-shadow: 0 0 0 0 rgb(255 106 51 / 0.45); }
  to { box-shadow: 0 0 0 16px rgb(255 106 51 / 0); }
}
@keyframes intro-eq { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
@keyframes intro-blink { 50% { opacity: 0; } }
@keyframes intro-node-pulse {
  from { transform: scale(1); opacity: 0.35; }
  to { transform: scale(3); opacity: 0; }
}
@keyframes intro-close-top { from { transform: translateY(-101%); } }
@keyframes intro-close-bottom { from { transform: translateY(101%); } }

/* ---- Responsive tiers (order matters: landscape is last) ---- */
@media (min-width: 768px) {
  .intro {
    --edge: 24px;
    --term-lh: 20px;
    --term-size: 0.8125rem;
  }
  .intro-enter {
    min-height: 56px;
    padding: 0 28px 0 24px;
    font-size: 1.0625rem;
  }
  .intro-cap {
    min-height: calc(1.35em * 2);
  }
}
@media (min-width: 768px) and (min-height: 701px) {
  .intro {
    --ring: 128px;
    --photo-inset: 12px;
    --gap-ring: 28px;
    --gap-term: 20px;
    --gap-role: 14px;
    --gap-swap: 32px;
  }
  .intro-stage {
    padding-top: 92px;
    padding-bottom: 92px;
  }
}
@media (orientation: portrait) and (max-height: 700px) {
  .intro {
    --ring: 88px;
    --photo-inset: 9px;
    --gap-ring: 16px;
    --gap-term: 12px;
    --gap-role: 8px;
    --gap-swap: 20px;
  }
}
@media (orientation: landscape) and (max-height: 520px) {
  .intro {
    --ring: 88px;
    --photo-inset: 9px;
    --gap-ring: 14px;
    --gap-term: 0px;
    --gap-role: 8px;
    --gap-swap: 16px;
    --edge: 12px;
    --term-lh: 18px;
    --term-size: 0.75rem;
  }
  .intro-stage {
    padding-top: max(16px, env(safe-area-inset-top));
  }
  .intro-c {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 40px;
    max-width: 46rem;
    text-align: left;
  }
  .intro-head {
    flex: 0 1 15rem;
    align-items: flex-start;
  }
  .intro-body {
    flex: 0 1 26rem;
    align-items: flex-start;
  }
  .intro-term { width: 100%; }
  .intro-swap { justify-items: start; }
  .intro-gate {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }
  .intro-enter {
    min-height: 48px;
    padding: 0 22px 0 18px;
    font-size: 1rem;
  }
  .intro-play {
    align-items: flex-start;
    gap: 10px;
  }
  .intro-cap {
    max-width: 100%;
    min-height: calc(1.35em * 2);
    font-size: 1.125rem;
  }
}

/* ---- Reduced motion: only reachable through "Replay intro" ---- */
@media (prefers-reduced-motion: reduce) {
  .intro { --intro-t0: 0ms; }
  .intro *,
  .intro *::before,
  .intro *::after {
    animation-duration: 1ms !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    transition-delay: 0s !important;
  }
  .intro-enter,
  .intro-eq i,
  .intro-caret,
  .intro-ring-tip::after {
    animation: none !important;
  }
  .intro-glyph,
  .intro-cap {
    filter: none !important;
  }
  .intro-cap { transform: none !important; }
  .intro.is-out .intro-c { transform: none; }
  .intro.is-open .intro-panel--top,
  .intro.is-open .intro-panel--bottom {
    transform: none;
  }
  .intro.is-open {
    opacity: 0;
    transition: opacity 0.2s linear;
  }
  .intro.is-replay {
    animation: intro-fade-in 0.2s linear backwards;
  }
}
```

### 12.1 JS contract (what the component toggles)

| Hook | Set by JS | When |
|---|---|---|
| `html.intro-on` | boot script (first load) or replay handler | removed at `is-open` |
| `.intro.is-gate` → `.is-play` | `start()` | on Enter or a gate button |
| `.intro.is-muted` | `start(false)` and the mute toggle | toggles |
| `.intro.no-voice` | `start()` | no `speechSynthesis` and no `voiceFile` |
| `.intro.is-replay` | replay mount | removed in `finish()` |
| `.intro.is-out`, then `.is-open` 380ms later | `finish()` | unmount at 1400ms |
| `.intro-cap.is-on` | caption swap | remove, wait 180ms, set the HTML, add it back |
| `--p` on `.intro-bar`; `.is-done` | rAF tick | `--p` as `NN.NN%`; `aria-valuenow` and the % text only when the integer changes |
| `.intro-term-line` / `.is-current` / `.is-ok` | log typing | render only the last 3 lines; the caret lives in the line being typed and stays at the end of the latest line |
| caption `aria-live` | `start()` and the mute toggle | `off` while the voice speaks; `polite` when muted or `no-voice` |
| focus | timers | primary at t0 + 1.8s; mute at play start (in the next `requestAnimationFrame`, after `is-play` has made it visible); Replay button after a replay |

---

## 13. Design-gate check (this spec)

| Tell | Verdict | Evidence |
|---|---|---|
| Purple-to-blue gradient | CLEAN | No purple or blue values. The only gradient is a single-hue alpha glow (`#ff5a1f`) plus the canvas mask |
| Gradient text | CLEAN | Name and caption are solid colors. The reference's gradient text is dropped |
| Emoji | CLEAN | None. The mute icon is an SVG line icon |
| Glassmorphism | CLEAN | No `backdrop-filter`. Skip and mute are hairline outlines |
| Low-contrast dark mode | CLEAN | The lowest text pair is 5.84:1 (dim log text over the glow) |
| Badge above headline | CLEAN | The run log above the name is live content (it types and changes), not a static badge |
| Fade-in everywhere | JUDGEMENT | One orchestrated sequence, the reference's choreography. Nothing on the page itself gains scroll motion |
| Hover fades on everything | CLEAN | Only the five controls react; color and border only, 0.15s |
| Serif italic accent | JUDGEMENT | The brief requires it for the caption emphasis, and it matches the hero. Limited to one per screen; the name stays upright |
| Space Grotesk + Instrument Serif | CLEAN | Geist + Instrument Serif + system mono, the site's existing stack |
| Inconsistent spacing | NEEDS EYES | Tokenized per tier in section 8; verify with screenshots at the four sizes |
| Em dashes, buzzwords | for site-copywriter | This spec sets length limits only (section 14) |

---

## 14. Copy limits (site-copywriter) and build notes

- **Log lines:** 30 characters or fewer, so nothing truncates in the landscape column (the hard
  limit is 42 in portrait and on desktop). Read like a workflow run: one trigger line, one or two
  action lines, one complete line. No "$" prompt is needed; the nodes already mark each step. No
  "✓" is needed; the complete line gets an orange node. If the copy keeps one, it renders in the
  line's text color.
- **Gate prompt line:** "press enter" means nothing on a phone. Use wording that works for touch
  too, or supply a touch variant that the engineer swaps under `(hover: none)`.
- **Captions:** 64 characters or fewer each (two lines on desktop, at most three at 360px). Put the
  emphasized part at the end, three words or fewer, wrapped in `<em>`.
- **Role:** 52 characters or fewer so it stays on one line in the landscape column.
- **Skip label:** it is set in mono. Keep it short (the reference's "skip intro →" length).
