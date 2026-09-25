import { useEffect, useState } from 'react'
import { REPLAY_EVENT } from '@/components/Intro'
import { intro, links, navLinks, profile } from '@/data/site'

export function Footer() {
  // Rendered only after hydration, so a no-JS visitor never sees a button that does nothing
  // (docs/intro-design.md #11).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function replayIntro() {
    window.dispatchEvent(new CustomEvent(REPLAY_EVENT))
  }

  return (
    <footer className="mt-4">
      <div className="flex flex-col gap-6 px-2 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              LinkedIn
            </a>
          </li>
          {mounted && intro.enabled && (
            <li>
              <button
                type="button"
                id="replay-intro-btn"
                onClick={replayIntro}
                className="relative cursor-pointer hover:text-ink before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
              >
                {intro.labels.replay}
              </button>
            </li>
          )}
        </ul>
      </div>
    </footer>
  )
}
