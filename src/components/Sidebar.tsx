import { links, navLinks, profile } from '@/data/site'
import { MailIcon, WhatsAppIcon } from './Icons'

/** Sticky profile card. On small screens it sits above the content, without the nav list. */
export function Sidebar() {
  return (
    <aside className="rounded-[1.25rem] border border-line bg-card p-4 sm:p-5 lg:sticky lg:top-6">
      {/* minmax(0,1fr), not 1fr: without it the "Available for work & projects" pill (nowrap)
          can force the track wider than its content, overflowing the page at 320-360px. */}
      <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 lg:block">
        <img
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          width={400}
          height={400}
          className="aspect-square w-full rounded-xl bg-paper-2 object-cover object-top"
        />
        <div className="min-w-0 lg:mt-5">
          <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
          <p className="mt-1 text-sm leading-snug text-muted">{profile.tagline}</p>
          {profile.status && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/[0.07] px-3 py-1 text-[0.8rem] font-medium text-ink">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              {profile.status}
            </p>
          )}
        </div>
      </div>

      <nav aria-label="Sections" className="mt-6 hidden lg:block">
        <ol className="space-y-0.5">
          {navLinks.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 text-[0.95rem] text-ink/80 transition-colors hover:bg-paper hover:text-ink"
              >
                <span className="font-mono text-[0.7rem] text-muted group-hover:text-signal-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:mt-6 lg:grid-cols-1">
        <a href="#book" className="btn btn-primary w-full sm:col-span-2 lg:col-span-1">
          <span className="btn-node" />
          Book a Call
        </a>
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full px-3 whitespace-nowrap">
          <WhatsAppIcon className="h-4 w-4" />
          Message on WhatsApp
        </a>
        <a href={`mailto:${links.email}`} className="btn btn-ghost w-full">
          <MailIcon className="h-4 w-4" />
          Send me an email
        </a>
      </div>

      <div className="mt-5 hidden space-y-1 border-t border-line pt-4 font-mono text-[0.7rem] leading-relaxed text-muted lg:block">
        <p>{profile.timezone}</p>
        <p>{profile.responseTime}</p>
      </div>
    </aside>
  )
}
