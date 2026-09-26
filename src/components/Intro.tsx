import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { intro, profile } from '@/data/site'

declare global {
  interface Window {
    /** Set by mountIntro once the real Skip/Escape/button handlers are wired up; read by the
     *  inline INTRO_BOOT_SCRIPT fallback so it knows when to stand down. */
    __wpIntroReady?: boolean
  }
}

/**
 * Voiced intro overlay (docs/intro-brief.md, docs/intro-design.md, docs/intro-copy.md).
 *
 * The overlay is server-rendered but hidden by default (styles.css: `.intro { display: none }`).
 * `INTRO_BOOT_SCRIPT` is inlined in <head> by src/routes/__root.tsx, the same way the theme
 * script is, and adds `intro-on` to <html> before first paint so returning visitors (or a
 * reduced-motion preference) never see a flash of it. This component renders the same markup on
 * the server and on first client render (no conditional based on sessionStorage/motion in JSX),
 * then wires up all behavior in an effect to avoid a hydration mismatch.
 */

export const REPLAY_EVENT = 'wp-intro-replay'
const SESSION_KEY = 'wp-intro'

/**
 * Runs before first paint, before the React bundle has necessarily loaded or hydrated. Two jobs:
 * 1) add `intro-on` so the SSR overlay is visible from the first frame (only on `/`: other routes,
 *    like a 404, must never turn navy or lock scroll for a first-time visitor).
 * 2) a resilience net for when the bundle is slow or blocked (docs/intro-brief.md fix round,
 *    "MUST FIX" #1): until `window.__wpIntroReady` is set (by mountIntro, once it has actually
 *    wired up the real Skip/Escape/Enter handlers), a fallback here handles Skip and Escape by
 *    itself, and a ~8s safety timer does the same if the component never takes over at all. Once
 *    real handlers are live, `__wpIntroReady` makes every fallback here a no-op.
 */
export const INTRO_BOOT_SCRIPT = `(function(){
  var d = document.documentElement;
  if (location.pathname !== '/') return;
  try {
    if (!(${intro.enabled ? 'true' : 'false'}) || sessionStorage.getItem('${SESSION_KEY}') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (e) {}
  d.classList.add('intro-on');
  function fallbackSkip() {
    try { sessionStorage.setItem('${SESSION_KEY}', '1'); } catch (e) {}
    d.classList.remove('intro-on');
    // The app script never took over, so the scroll-reveal blocks must show on their own.
    d.classList.add('js-failed');
    var page = document.getElementById('page');
    if (page) page.removeAttribute('inert');
  }
  document.addEventListener('click', function (e) {
    if (window.__wpIntroReady) return;
    var t = e.target;
    if (t && t.closest && t.closest('.intro-skip')) fallbackSkip();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (window.__wpIntroReady) return;
    if (e.key === 'Escape') fallbackSkip();
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { if (!window.__wpIntroReady) fallbackSkip(); }, 8000);
  });
})();`

type Line = (typeof intro.lines)[number]
type ConfettiFn = (options?: import('canvas-confetti').Options) => Promise<undefined> | null

/** Brand colors only (docs/intro-brief.md, 2026-09-25): no third-party palette. */
const CONFETTI_COLORS = ['#ff5a1f', '#ff6a33', '#ff8a5c', '#f7f5f0', '#c9cfda', '#141a26']

/** Split the name into words/letters for the SSR letter-stagger animation (design doc #1.1). */
function nameParts(name: string) {
  const words = name.split(' ')
  let i = 0
  return words.map((word) => {
    const glyphs = word.split('').map((ch) => {
      const at = i
      i += 1
      return { ch, at }
    })
    i += 1 // count the space between words, so the next word's stagger continues from it
    return glyphs
  })
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Wraps the line's accent phrase in <em>, per docs/intro-copy.md ("split with text.indexOf"). */
function captionHtml(line: Line) {
  const idx = line.text.indexOf(line.accent)
  if (idx === -1) return escapeHtml(line.text)
  const before = escapeHtml(line.text.slice(0, idx))
  const accent = escapeHtml(line.text.slice(idx, idx + line.accent.length))
  const after = escapeHtml(line.text.slice(idx + line.accent.length))
  return `${before}<em>${accent}</em>${after}`
}

function lineHtml(cls: string, text: string, caret: boolean) {
  const className = cls ? `intro-term-line ${cls}` : 'intro-term-line'
  const caretHtml = caret ? '<span class="intro-caret"></span>' : ''
  return `<div class="${className}"><span class="intro-term-text">${escapeHtml(text)}${caretHtml}</span></div>`
}

/**
 * Browser voice preference, same order as the reference intro (israelgonzaga.vercel.app):
 * natural/online voices first, then the common built-in ones. The browser voice is the
 * primary voice when `intro.voiceFile` is empty.
 */
const PREF_MALE = [
  /(Andrew|Guy|Davis|Brian|Christopher|Eric|Roger|Steffan).*(Natural|Online)/i,
  /(Ryan|Thomas|William|Liam|Connor).*(Natural|Online)/i,
  /Google UK English Male/i,
  /\b(Daniel|Alex|Fred|Aaron|Arthur|Rishi|Gordon|Oliver)\b/i,
  /\b(David|Mark|James|George|Richard|Male)\b/i,
]
const PREF_FEMALE = [
  /(Aria|Jenny|Ava|Emma|Michelle|Sonia|Libby).*(Natural|Online)/i,
  /(Natural|Neural)/i,
  /Google US English/i,
  /Google UK English Female/i,
  /\b(Samantha|Karen|Moira|Tessa|Serena)\b/i,
  /\b(Zira|Female)\b/i,
]

function isMaleVoice(v: SpeechSynthesisVoice | null) {
  return !!v && PREF_MALE.some((re) => re.test(v.name))
}

/** Reference intro's pitch rule: deep and steady for a male voice; if the browser only has
 *  female voices, pitch one down hard; a preferred female voice sits just above neutral. */
function pitchFor(v: SpeechSynthesisVoice | null) {
  if (intro.voice === 'male') return isMaleVoice(v) ? 0.86 : 0.62
  return 1.02
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  let voices: SpeechSynthesisVoice[] = []
  try {
    voices = synth.getVoices() || []
  } catch {
    voices = []
  }
  const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang))
  const pref = intro.voice === 'male' ? PREF_MALE : PREF_FEMALE
  for (const re of pref) {
    const match = en.find((v) => re.test(v.name))
    if (match) return match
  }
  return en[0] ?? voices[0] ?? null
}

/**
 * All imperative behavior lives here (timers, term log typing, captions, progress, voice,
 * focus, exit choreography), operating directly on the DOM nodes rendered below. This keeps
 * a single, precisely-timed sequence instead of driving it through React re-renders, and
 * mirrors the "JS contract" table in docs/intro-design.md #12.1.
 */
function mountIntro(root: HTMLDivElement, isReplay: boolean, onDone: () => void) {
  // Marks the overlay as wired up: the boot script's Skip/Escape/safety-timer fallbacks (see
  // INTRO_BOOT_SCRIPT) stand down once this is set, and the gate buttons only fade in from here
  // (never from first paint), so a slow or failed bundle never leaves visible-but-dead buttons on
  // screen (fix round item 1).
  root.classList.add('is-ready')
  window.__wpIntroReady = true

  const html = document.documentElement
  const page = document.getElementById('page')
  const termQ = root.querySelector<HTMLDivElement>('.intro-term')
  const capQ = root.querySelector<HTMLParagraphElement>('.intro-cap')
  const enterQ = root.querySelector<HTMLButtonElement>('.intro-enter')
  const quietQ = root.querySelector<HTMLButtonElement>('.intro-quiet')
  const muteQ = root.querySelector<HTMLButtonElement>('.intro-snd')
  const skipQ = root.querySelector<HTMLButtonElement>('.intro-skip')
  const barQ = root.querySelector<HTMLDivElement>('.intro-bar')
  const pctQ = root.querySelector<HTMLSpanElement>('.intro-pct')

  if (!termQ || !capQ || !enterQ || !quietQ || !muteQ || !skipQ || !barQ || !pctQ) {
    return () => {}
  }
  // Re-bound as fresh, definitely-non-null consts: TS narrowing from the guard above does not
  // carry into the nested function declarations below that close over these variables.
  const term = termQ
  const cap = capQ
  const enterBtn = enterQ
  const quietBtn = quietQ
  const muteBtn = muteQ
  const skipBtn = skipQ
  const bar = barQ
  const pct = pctQ

  if (isReplay) {
    root.classList.add('is-replay')
    html.classList.add('intro-on')
  }

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // Derived directly in JS, not parsed back from the CSS custom property: a minifier can rewrite
  // "600ms" as ".6s", which reads back as 0.6ms and desyncs the log/focus timers from the panel
  // animation (fix round item 3).
  const t0 = prefersReduced ? 0 : isReplay ? 600 : 0
  const synth: SpeechSynthesis | null = window.speechSynthesis ?? null
  const voiceAvailable = Boolean(intro.voiceFile) || Boolean(synth)
  if (!voiceAvailable) root.classList.add('no-voice')

  let started = false
  let finished = false
  let muted = false
  let usingFile = false
  let synthUsed = false
  let audio: HTMLAudioElement | null = null
  // Loaded as soon as the intro mounts (not a CDN script), so it is ready by finish().
  // If it fails to load, celebrate() just skips the confetti and still shows "Welcome!".
  let confettiFn: ConfettiFn | null = null
  import('canvas-confetti')
    .then((mod) => {
      // Vite/esbuild wrap this CommonJS module with a `.default`; fall back to the module
      // itself in case a future bundler exposes it as the direct export instead.
      const resolved = (mod as unknown as { default?: ConfettiFn }).default ?? (mod as unknown as ConfettiFn)
      confettiFn = typeof resolved === 'function' ? resolved : null
    })
    .catch(() => {
      confettiFn = null
    })
  let capIdx = -1
  let raf = 0
  let startedAt = 0
  /** Set once the audio element actually fires `playing` (not just `play()` called): progress
   *  and captions hold at 0 until then, and the finish safety cap is measured from here, not
   *  from the click (fix round item 6). */
  let playingAt: number | null = null
  /** True if the audio element has errored at any point (including before the visitor ever
   *  clicks), so a click can decide synchronously whether to attempt the file at all. */
  let audioErrored = false
  /** The progress bar/pct never regress, even when re-syncing after an unseekable unmute
   *  (fix round item 7). */
  let maxRatio = 0
  let typingTimer = 0
  const timers: number[] = []
  let doneLines: { cls: string; text: string }[] = []
  let activeLine: { cls: string; text: string } | null = null
  let themeMetas: { el: Element; original: string | null }[] = []

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timers.push(id)
    return id
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id))
    timers.length = 0
    window.clearTimeout(typingTimer)
  }

  function setInert(active: boolean) {
    if (!page) return
    if (active) page.setAttribute('inert', '')
    else page.removeAttribute('inert')
  }

  function setThemeColor() {
    const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'))
    themeMetas = metas.map((el) => ({ el, original: el.getAttribute('content') }))
    metas.forEach((el) => el.setAttribute('content', '#0e121a'))
  }

  function restoreThemeColor() {
    themeMetas.forEach(({ el, original }) => {
      if (original === null) el.removeAttribute('content')
      else el.setAttribute('content', original)
    })
    themeMetas = []
  }

  // ---- run log ----
  function renderTerm() {
    const finishedHtml = doneLines
      .slice(-2)
      .map((l) => lineHtml(l.cls, l.text, false))
      .join('')
    const activeHtml = activeLine ? lineHtml(activeLine.cls, activeLine.text, true) : ''
    term.innerHTML = finishedHtml + activeHtml
  }

  function typeLine(cls: string, text: string, cb?: () => void) {
    window.clearTimeout(typingTimer)
    if (activeLine) {
      doneLines.push({ cls: activeLine.cls === 'is-ok' ? 'is-ok' : '', text: activeLine.text })
    }
    activeLine = { cls, text: prefersReduced ? text : '' }
    renderTerm()
    if (prefersReduced) {
      cb?.()
      return
    }
    let ci = 0
    const step = () => {
      ci += 1
      if (activeLine) activeLine.text = text.slice(0, ci)
      renderTerm()
      if (ci < text.length) {
        typingTimer = window.setTimeout(step, 22)
      } else {
        cb?.()
      }
    }
    step()
  }

  function beginGateLog() {
    schedule(() => {
      typeLine('', intro.terminal.boot, () => {
        schedule(() => typeLine('is-current', intro.terminal.idle), prefersReduced ? 0 : 200)
      })
    }, prefersReduced ? 0 : t0 + 350)
  }

  // ---- captions ----
  function showCaption(i: number) {
    if (finished || i <= capIdx) return
    capIdx = i
    cap.classList.remove('is-on')
    schedule(() => {
      cap.innerHTML = captionHtml(intro.lines[i])
      cap.classList.add('is-on')
    }, prefersReduced ? 0 : 180)
  }

  function updateAriaLive() {
    const silent = muted || (!usingFile && !synthUsed)
    cap.setAttribute('aria-live', silent ? 'polite' : 'off')
  }

  // ---- voice ----
  function createAudio() {
    if (!intro.voiceFile) return null
    const el = new Audio(intro.voiceFile)
    // 'metadata' only: visitors who skip or go silent never download the file (fix round item 6).
    el.preload = 'metadata'
    return el
  }

  function onAudioEnded() {
    schedule(() => finish(), 400)
  }

  function onAudioPlaying() {
    if (playingAt === null) playingAt = performance.now()
  }

  function onAudioError() {
    audioErrored = true
    if (usingFile) {
      usingFile = false
      startSynthFallback()
    }
  }

  function startVoiceFile() {
    // Already known broken (e.g. a 404 discovered while the gate was up): go straight to the
    // speech fallback, synchronously, in the same click/keydown call stack (iOS requires the
    // utterance to start inside the user gesture, not from a later async callback).
    if (!audio || audioErrored) {
      usingFile = false
      startSynthFallback()
      return
    }
    usingFile = true
    playingAt = null
    try {
      audio.currentTime = 0
      audio.muted = false
      const p = audio.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          usingFile = false
          startSynthFallback()
        })
      }
    } catch {
      usingFile = false
      startSynthFallback()
    }
  }

  /** If the file never actually starts playing within 4s of the click, give up on it rather than
   *  leave the visitor stuck waiting on a stalled stream; continue silently on timers (no synth
   *  here: the user-gesture window for speechSynthesis on iOS has long since closed). */
  function watchForStalledFile() {
    schedule(() => {
      if (finished || !usingFile || playingAt !== null) return
      try {
        audio?.pause()
      } catch {
        // ignore
      }
      usingFile = false
      muted = true
      root.classList.add('is-muted')
      muteBtn.setAttribute('aria-label', intro.labels.unmute)
      updateAriaLive()
    }, 4000)
  }

  function startSynthFallback() {
    if (synthUsed || finished || !synth || typeof SpeechSynthesisUtterance === 'undefined') {
      updateAriaLive()
      return
    }
    synthUsed = true
    try {
      synth.cancel()
    } catch {
      // ignore
    }
    const voice = pickVoice(synth)
    intro.lines.forEach((line, i) => {
      const utter = new SpeechSynthesisUtterance(line.say)
      if (voice) utter.voice = voice
      utter.lang = voice?.lang || 'en-US'
      utter.rate = intro.rate
      utter.pitch = pitchFor(voice)
      utter.volume = 1
      utter.onstart = () => showCaption(i)
      synth.speak(utter)
    })
    updateAriaLive()
  }

  function currentDuration() {
    if (usingFile && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration
    }
    return intro.seconds
  }

  function setMuted(next: boolean) {
    if (finished) return
    muted = next
    root.classList.toggle('is-muted', muted)
    muteBtn.setAttribute('aria-label', muted ? intro.labels.unmute : intro.labels.mute)
    if (usingFile && audio) {
      audio.muted = muted
    } else if (synthUsed) {
      if (muted) {
        try {
          synth?.cancel()
        } catch {
          // ignore
        }
      }
    } else if (!muted && started && audio) {
      // "Enter without sound" never started audio; unmuting now starts it. Only seek to the
      // elapsed time if the browser actually has that range buffered (audio.seekable) - otherwise
      // let it start from wherever it can, re-sync the caption clock to the audio's own timeline
      // (captions must match what's actually being said), and let the maxRatio clamp in
      // setProgress keep the bar from visibly jumping backwards (fix round item 7).
      const elapsed = (performance.now() - startedAt) / 1000
      let canSeek = false
      try {
        const seekable = audio.seekable
        for (let i = 0; i < seekable.length; i += 1) {
          if (elapsed >= seekable.start(i) && elapsed <= seekable.end(i)) {
            canSeek = true
            break
          }
        }
      } catch {
        canSeek = false
      }
      playingAt = null
      try {
        if (canSeek) {
          audio.currentTime = Math.min(elapsed, Number.isFinite(audio.duration) ? audio.duration : elapsed)
        } else {
          capIdx = -1
        }
        audio.muted = false
        const p = audio.play()
        if (p && typeof p.then === 'function') {
          p.then(() => {
            usingFile = true
            updateAriaLive()
          }).catch(() => startSynthFallback())
        } else {
          usingFile = true
        }
      } catch {
        startSynthFallback()
      }
    } else if (!muted && started) {
      startSynthFallback()
    }
    updateAriaLive()
  }

  // ---- progress ----
  function setProgress(ratio: number) {
    // Never regress visually, even when re-syncing after an unseekable unmute (fix round item 7).
    maxRatio = Math.max(maxRatio, ratio)
    const clamped = Math.max(0, Math.min(1, maxRatio))
    bar.style.setProperty('--p', `${(clamped * 100).toFixed(2)}%`)
    const pctValue = Math.round(clamped * 100)
    if (bar.getAttribute('aria-valuenow') !== String(pctValue)) {
      bar.setAttribute('aria-valuenow', String(pctValue))
      pct.textContent = `${pctValue}%`
    }
    if (clamped >= 1) bar.classList.add('is-done')
  }

  function tick() {
    if (finished) return
    const duration = currentDuration()

    if (usingFile && audio) {
      if (playingAt === null) {
        // Hold at 0 (bar and captions) until the file has actually started playing, not just
        // been asked to (fix round item 6).
        raf = requestAnimationFrame(tick)
        return
      }
      const playhead = audio.currentTime
      const ratio = duration > 0 ? playhead / duration : 0
      setProgress(ratio)
      for (let i = 0; i < intro.lines.length; i += 1) {
        if (playhead >= intro.lines[i].at) showCaption(i)
      }
      // The safety cap is measured from when playback actually started, not from the click.
      if ((performance.now() - playingAt) / 1000 > intro.seconds + 4) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
      return
    }

    // Silent/timer mode ("Enter without sound", the stalled-file fallback, or speechSynthesis):
    // paced from the click.
    const elapsed = (performance.now() - startedAt) / 1000
    const ratio = duration > 0 ? elapsed / duration : 0
    setProgress(ratio)
    // With the browser voice, each utterance's onstart shows its caption. The timers only back
    // that up: they stay out of the way while the voice is speaking, and trail it by 1 s
    // otherwise, so a caption never runs ahead of the words (the reference does the same).
    const voiceDriving = synthUsed && !muted && !!synth && synth.speaking
    if (!voiceDriving) {
      const lead = synthUsed && !muted ? 1 : 0
      for (let i = 0; i < intro.lines.length; i += 1) {
        if (elapsed >= intro.lines[i].at + lead) showCaption(i)
      }
    }
    const synthBusy = synthUsed && synth ? synth.speaking : false
    const voiceBusy = !muted && synthBusy
    if (ratio >= 1 && !voiceBusy) {
      finish()
      return
    }
    if (elapsed > intro.seconds + 4) {
      finish()
      return
    }
    raf = requestAnimationFrame(tick)
  }

  // ---- gate -> play ----
  function focusEnter() {
    try {
      enterBtn.focus({ preventScroll: true })
    } catch {
      // ignore
    }
  }

  function start(withSound: boolean) {
    if (started || finished) return
    started = true
    // Pressing Enter in the first ~1s (while the gate's boot/idle lines are still typing) must
    // not scramble the log: cancel any pending gate-log timers, then drop "waiting for you to
    // enter" entirely so the log reads trigger -> run -> done only (fix round item 5).
    clearTimers()
    doneLines = [{ cls: '', text: intro.terminal.boot }]
    activeLine = null
    renderTerm()

    root.classList.remove('is-gate')
    root.classList.add('is-play')
    muted = !withSound
    if (muted) root.classList.add('is-muted')
    muteBtn.setAttribute('aria-label', muted ? intro.labels.unmute : intro.labels.mute)

    if (withSound) {
      startVoiceFile()
      if (!usingFile) startSynthFallback()
      else watchForStalledFile()
    }
    updateAriaLive()

    requestAnimationFrame(() => {
      try {
        muteBtn.focus({ preventScroll: true })
      } catch {
        // ignore
      }
    })

    schedule(() => typeLine('is-current', intro.terminal.run), 500)
    const doneDelayMs = Math.max(1200, currentDuration() * 1000 - 1600)
    schedule(() => typeLine('is-ok', intro.terminal.done), doneDelayMs)

    startedAt = performance.now()
    raf = requestAnimationFrame(tick)
  }

  function enterClick() {
    start(true)
  }
  function quietClick() {
    start(false)
  }
  function muteClick() {
    setMuted(!muted)
  }

  function resetOverlay() {
    root.className = voiceAvailable ? 'intro is-gate' : 'intro is-gate no-voice'
    bar.style.setProperty('--p', '0%')
    bar.classList.remove('is-done')
    bar.setAttribute('aria-valuenow', '0')
    pct.textContent = '0%'
    cap.classList.remove('is-on')
    cap.innerHTML = ''
    cap.setAttribute('aria-live', 'off')
    term.innerHTML = ''
    doneLines = []
    activeLine = null
    capIdx = -1
  }

  function teardownListeners() {
    enterBtn.removeEventListener('click', enterClick)
    quietBtn.removeEventListener('click', quietClick)
    skipBtn.removeEventListener('click', finish)
    muteBtn.removeEventListener('click', muteClick)
    if (audio) {
      audio.removeEventListener('ended', onAudioEnded)
      audio.removeEventListener('error', onAudioError)
      audio.removeEventListener('playing', onAudioPlaying)
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (finished) return
    if (e.key === 'Escape') {
      finish()
    } else if (e.key === 'Enter' && !started) {
      const target = e.target as HTMLElement | null
      if (target && target.tagName === 'BUTTON') return
      e.preventDefault()
      start(true)
    }
  }

  // ---- finish celebration: confetti + "Welcome!" (docs/intro-brief.md, 2026-09-25) ----
  // Runs on every finish (bar completing, "Enter without sound", Skip, Escape). Not tied to
  // `timers`/`schedule`, so it isn't cancelled by the teardown that follows in finish().
  function celebrate() {
    const node = document.createElement('div')
    node.className = 'intro-welcome'
    node.setAttribute('aria-hidden', 'true')
    const word = document.createElement('span')
    word.textContent = intro.labels.welcome
    node.appendChild(word)
    document.body.appendChild(node)
    window.setTimeout(
      () => {
        node.parentNode?.removeChild(node)
      },
      prefersReduced ? 700 : 2300,
    )

    if (prefersReduced) return // word only, no confetti
    window.setTimeout(() => {
      const fire = confettiFn
      if (!fire) return
      const zIndex = 200
      fire({
        particleCount: 170,
        spread: 100,
        startVelocity: 58,
        origin: { y: 0.62 },
        colors: CONFETTI_COLORS,
        zIndex,
        disableForReducedMotion: true,
      })
      fire({
        particleCount: 90,
        angle: 60,
        spread: 70,
        startVelocity: 65,
        origin: { x: 0, y: 0.85 },
        colors: CONFETTI_COLORS,
        zIndex,
        disableForReducedMotion: true,
      })
      fire({
        particleCount: 90,
        angle: 120,
        spread: 70,
        startVelocity: 65,
        origin: { x: 1, y: 0.85 },
        colors: CONFETTI_COLORS,
        zIndex,
        disableForReducedMotion: true,
      })
      window.setTimeout(() => {
        fire({
          particleCount: 120,
          spread: 160,
          startVelocity: 38,
          scalar: 0.9,
          origin: { y: 0.35 },
          colors: CONFETTI_COLORS,
          zIndex,
          disableForReducedMotion: true,
        })
      }, 380)
    }, 300)
  }

  function finish() {
    if (finished) return
    finished = true
    // Remove is-replay before anything else: if it's still present when is-open is added below,
    // its closing-panel animation fights the opening transform and the panels visibly snap
    // instead of sliding (design doc #6.4, fix round item 4).
    root.classList.remove('is-replay')
    clearTimers()
    cancelAnimationFrame(raf)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // ignore
    }
    celebrate()
    if (audio) {
      try {
        audio.pause()
      } catch {
        // ignore
      }
    }
    if (synth) {
      try {
        synth.cancel()
      } catch {
        // ignore
      }
    }
    document.removeEventListener('keydown', onKeydown)
    root.classList.add('is-out')
    const openDelay = prefersReduced ? 60 : 380
    const doneDelay = prefersReduced ? 260 : 1400
    schedule(() => {
      root.classList.add('is-open')
      html.classList.remove('intro-on')
      setInert(false)
      restoreThemeColor()
    }, openDelay)
    schedule(() => {
      teardownListeners()
      resetOverlay()
      if (isReplay) {
        try {
          document.getElementById('replay-intro-btn')?.focus()
        } catch {
          // ignore
        }
      }
      onDone()
    }, doneDelay)
  }

  // ---- init ----
  setInert(true)
  setThemeColor()
  audio = createAudio()
  audio?.addEventListener('ended', onAudioEnded)
  audio?.addEventListener('error', onAudioError)
  audio?.addEventListener('playing', onAudioPlaying)
  // Nice to have: on a slow connection the name can start animating in the fallback serif before
  // Instrument Serif has loaded. Pause the letters (CSS: .intro-name.is-font-wait) until the font
  // resolves or 600ms pass, whichever is first; letters don't start until 0.75s in, so this never
  // runs past their own delay.
  const nameEl = root.querySelector<HTMLElement>('.intro-name')
  if (nameEl && !prefersReduced && document.fonts && !document.fonts.check('400 1em "Instrument Serif"')) {
    nameEl.classList.add('is-font-wait')
    let resumed = false
    const resume = () => {
      if (resumed) return
      resumed = true
      nameEl.classList.remove('is-font-wait')
    }
    document.fonts.load('400 1em "Instrument Serif"').then(resume).catch(resume)
    window.setTimeout(resume, 600)
  }
  if (synth) {
    try {
      synth.getVoices()
      synth.onvoiceschanged = () => synth.getVoices()
    } catch {
      // ignore
    }
  }
  document.addEventListener('keydown', onKeydown)
  enterBtn.addEventListener('click', enterClick)
  quietBtn.addEventListener('click', quietClick)
  skipBtn.addEventListener('click', finish)
  muteBtn.addEventListener('click', muteClick)
  beginGateLog()
  schedule(focusEnter, prefersReduced ? 0 : t0 + 1800)

  return function cleanup() {
    clearTimers()
    cancelAnimationFrame(raf)
    document.removeEventListener('keydown', onKeydown)
    teardownListeners()
    if (audio) {
      try {
        audio.pause()
      } catch {
        // ignore
      }
    }
    if (synth) {
      try {
        synth.cancel()
      } catch {
        // ignore
      }
    }
  }
}

export function Intro() {
  if (!intro.enabled) return null
  return <IntroOverlay />
}

function IntroOverlay() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cleanupActive: (() => void) | null = null

    function activate(isReplay: boolean) {
      if (cleanupActive) return
      cleanupActive = mountIntro(root as HTMLDivElement, isReplay, () => {
        cleanupActive = null
      })
    }

    if (document.documentElement.classList.contains('intro-on')) {
      activate(false)
    }

    function onReplay() {
      activate(true)
    }
    window.addEventListener(REPLAY_EVENT, onReplay)
    return () => {
      window.removeEventListener(REPLAY_EVENT, onReplay)
      cleanupActive?.()
    }
  }, [])

  const words = nameParts(profile.name)

  return (
    <div className="intro is-gate" role="dialog" aria-modal="true" aria-label={intro.labels.dialog} ref={rootRef}>
      <div className="intro-panel intro-panel--top" aria-hidden="true" />
      <div className="intro-panel intro-panel--bottom" aria-hidden="true" />
      <div className="intro-canvas" aria-hidden="true" />
      <div className="intro-glow" aria-hidden="true" />

      <div className="intro-stage">
        <div className="intro-c">
          <div className="intro-head">
            <div className="intro-mark">
              <svg className="intro-ring" viewBox="0 0 120 120" aria-hidden="true">
                <circle className="intro-ring-track" cx="60" cy="60" r="58" />
                <circle className="intro-ring-draw" cx="60" cy="60" r="58" pathLength={100} />
              </svg>
              <span className="intro-photo">
                {photoFailed ? (
                  <span className="intro-photo-fallback">{profile.name.charAt(0)}</span>
                ) : (
                  <img
                    src={profile.photo}
                    alt=""
                    width={400}
                    height={400}
                    decoding="async"
                    onError={() => setPhotoFailed(true)}
                  />
                )}
              </span>
              <span className="intro-ring-tip" aria-hidden="true" />
            </div>
            <div className="intro-term" aria-hidden="true" />
          </div>

          <div className="intro-body">
            <h2 className="intro-name" id="intro-name">
              <span className="intro-sr">{profile.name}</span>
              <span aria-hidden="true">
                {words.map((glyphs, wi) => (
                  <Fragment key={wi}>
                    {wi > 0 ? ' ' : null}
                    <span className="intro-word">
                      {glyphs.map(({ ch, at }) => (
                        <span className="intro-glyph" style={{ '--i': at } as CSSProperties} key={at}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  </Fragment>
                ))}
              </span>
            </h2>
            {/* One line with a middle dot on wide screens; stacked, dot hidden, on phones. */}
            <p className="intro-role" id="intro-role">
              {intro.role.split(' · ').map((part, i) => (
                <Fragment key={part}>
                  {i > 0 && (
                    <>
                      <span className="intro-role-sep" aria-hidden="true">
                        {' · '}
                      </span>
                      <span className="intro-sr">, </span>
                    </>
                  )}
                  <span className="intro-role-part">{part}</span>
                </Fragment>
              ))}
            </p>

            <div className="intro-swap">
              <div className="intro-gate">
                <button type="button" className="intro-enter">
                  <span className="intro-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  {intro.labels.enter}
                </button>
                <button type="button" className="intro-quiet">
                  {intro.labels.quiet}
                </button>
              </div>
              <div className="intro-play">
                <p className="intro-cap" aria-live="off" />
                <div className="intro-progress">
                  <div
                    className="intro-bar"
                    role="progressbar"
                    aria-label="Intro progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={0}
                    style={{ '--p': '0%' } as CSSProperties}
                  >
                    <div className="intro-bar-layer intro-bar-base">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="intro-bar-layer intro-bar-fill">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <span className="intro-pct" aria-hidden="true">
                    0%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="intro-snd" aria-label={intro.labels.mute}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path className="intro-snd-on" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          <path className="intro-snd-off" d="M16 9l6 6M22 9l-6 6" />
        </svg>
      </button>
      <button type="button" className="intro-skip">
        {intro.labels.skip}
        <span aria-hidden="true"> →</span>
      </button>
    </div>
  )
}
