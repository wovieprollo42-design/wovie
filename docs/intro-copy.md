# Intro copy: voiced intro

Owner: site-copywriter. Source of facts: `src/data/site.ts` only.
Every claim below already appears on the site: "Certified GoHighLevel Expert" (hero title),
"set up CRM / automate follow-up" (positioning, services), "AI voice and chat agents" (services),
"keep leads moving" (tagline). No new numbers, clients, or results.

Voice: first person, calm, plain. Short sentences. No exclamation marks, no em dashes.

---

## 1. Voice lines

28 written words, 29 spoken words ("Go High Level" is spoken as 3).
At about 140 words per minute this runs about 13 seconds. Natural voices at a 0.9 rate usually finish in about 12.

| # | at (s) | say (spoken by TTS) | text (caption) | accent |
|---|--------|---------------------|----------------|--------|
| 1 | 0.2 | I'm Wovie Prollo, a certified Go High Level expert. | I'm Wovie Prollo, a certified GoHighLevel expert. | certified GoHighLevel expert |
| 2 | 4.3 | I set up your C.R.M. and automate follow-up. | I set up your CRM and automate follow-up. | automate follow-up |
| 3 | 8.0 | I build A.I. voice and chat agents. | I build AI voice and chat agents. | AI voice and chat agents |
| 4 | 11.2 | Let's get your leads moving. | Let's get your leads moving. | your leads moving |

Estimated line lengths at 140 wpm: 1) about 3.9 s, 2) about 3.5 s, 3) about 3 s, 4) about 2.1 s. The voice ends near 13.2 s.

Why these lines:
- Line 1 puts the name and the credential together, so the visitor hears who he is and why to trust him in one breath.
- Lines 2 and 3 name the three things he does, in the order the user gave them: CRM setup, workflow automation, AI voice and chat agents. One idea per sentence, each starting with "I".
- Line 4 is the invitation. "Let's" makes it about working together. "Leads moving" echoes the sidebar tagline ("keep leads moving") so the intro and the page sound like the same person.

Pronunciation notes (`say` only, never change `text` for these):
- "Go High Level" is spaced so the engine does not read "GoHighLevel" as one mangled word.
- "C.R.M." and "A.I." are dotted so each letter is spoken. If a voice pauses after the last dot as if the sentence ended, drop the final dot ("C.R.M", "A.I") and retest.
- "Wovie Prollo": open question, see Notes. If a voice says the name wrong, respell it phonetically in `say` for line 1 only.

Accent strings leave out the final period. Split the caption with `text.indexOf(accent)`.

---

## 2. Terminal lines

Monospace, typed character by character. Each is 38 characters or fewer.
They read as one workflow run: trigger, wait, actions, complete.

| key | text | chars | when |
|-----|------|-------|------|
| boot | `trigger: new visitor` | 20 | dim line, shown first |
| idle | `> press enter to start` | 22 | prompt while waiting at the gate |
| run | `> crm → follow-up → ai agents` | 29 | typed right after the visitor enters |
| done | `✓ workflow complete` | 19 | success line near the end |

The `run` steps match the voice lines 2 and 3, so the terminal and the voice describe the same system.

---

## 3. Role line

`Certified GoHighLevel Expert · AI Automation Builder` (52 characters, rendered uppercase by CSS)

Same wording as the hero title, so the intro and the first screen match.

---

## 4. Gate buttons and labels

| key | label | notes |
|-----|-------|-------|
| enter | Enter with sound | Primary pill button. |
| quiet | Enter without sound | Secondary link. Pairs directly with the primary, so the choice is clear at a glance. |
| skip | Skip intro | Add the arrow (→) in markup as a decorative `aria-hidden` span so screen readers do not say "right arrow". |
| mute | Mute intro voice | "Voice" instead of "audio": there is no music, only the voice. |
| unmute | Unmute intro voice | |
| dialog | Intro to Wovie Prollo's portfolio | `aria-label` on the overlay. Tells screen reader users this is an intro they can skip. |
| replay | Replay intro | New field. Footer button from the brief, kept here so every intro string lives in one place. |

---

## 5. Ready to paste

This matches `src/data/site.ts` (the source of truth: its `at` values are timed to the real
recording at `public/intro-voice.mp3`, and its wording matches what Wovie actually says on it).
Where this changed from the earlier draft above: line 1 says "I am" (not "I'm," what he recorded);
`at` values are 0.2 / 3.4 / 6.75 / 9.6, matching the recording's real timing; the terminal lines
drop the `$` / `>` / `✓` prefixes (the design's nodes carry that status instead) and the idle/run
wording works for touch as well as keyboard; and `labels` has a `welcome` field for the
finish-celebration "Welcome!" text (docs/intro-brief.md, 2026-09-25).

```ts
export const intro = {
  role: 'Certified GoHighLevel Expert · AI Automation Builder',
  lines: [
    {
      at: 0.2,
      say: 'I am Wovie Prollo, a certified Go High Level expert.',
      text: 'I am Wovie Prollo, a certified GoHighLevel expert.',
      accent: 'certified GoHighLevel expert',
    },
    {
      at: 3.4,
      say: 'I set up your C.R.M. and automate follow-up.',
      text: 'I set up your CRM and automate follow-up.',
      accent: 'automate follow-up',
    },
    {
      at: 6.75,
      say: 'I build A.I. voice and chat agents.',
      text: 'I build AI voice and chat agents.',
      accent: 'AI voice and chat agents',
    },
    {
      at: 9.6,
      say: "Let's get your leads moving.",
      text: "Let's get your leads moving.",
      accent: 'your leads moving',
    },
  ],
  terminal: {
    boot: 'trigger: new visitor',
    idle: 'waiting for you to enter',
    run: 'crm → follow-up → ai agents',
    done: 'workflow complete',
  },
  labels: {
    enter: 'Enter with sound',
    quiet: 'Enter without sound',
    skip: 'Skip intro',
    mute: 'Mute intro voice',
    unmute: 'Unmute intro voice',
    dialog: "Intro to Wovie Prollo's portfolio",
    replay: 'Replay intro',
    welcome: 'Welcome!',
  },
}
```

---

## Alternates (if the owner wants a different close)

- Line 4: "Let's work together." (shorter, more general)
- Line 4: "Let's talk about your leads." (points toward the booking call)

---

## Notes for other agents

- Owner: confirm how Wovie pronounces "Wovie Prollo". The TTS voices will guess. If they guess wrong, only line 1 `say` changes.
- frontend-engineer: `labels.replay` is a new field. Please render the footer "Replay intro" button from it.
- frontend-engineer: for the mute toggle, use one pattern. Either swap the label (mute / unmute) with no `aria-pressed`, or keep one label with `aria-pressed`. The reference does both, so screen readers hear "Unmute intro audio, pressed", which contradicts itself.
- frontend-engineer: the caption region is `aria-live="polite"` in the reference. With sound on, screen readers read the caption while the TTS voice says the same words. Consider making it live only in the "without sound" mode.
- frontend-engineer: `run` uses "→" and `done` uses "✓". Check that the monospace font has both glyphs.
- site-ui-designer: line 1 accent ("certified GoHighLevel expert") and line 3 accent ("AI voice and chat agents") are the longest italic runs. Check the caption wrap at 360 px. The role line is 52 characters in uppercase, so check that it wraps cleanly on a phone too.
