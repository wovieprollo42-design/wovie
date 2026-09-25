import { useRef, useState } from 'react'
import { certifications } from '@/data/site'
import { cn } from '@/lib/utils'
import { SectionHeading } from './SectionHeading'

type Cert = (typeof certifications)[number]

export function Certifications() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<Cert | null>(null)

  function open(cert: Cert) {
    setActive(cert)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  return (
    <section id="certifications" className="panel">
      <SectionHeading
        eyebrow="Certifications"
        title="Certified by GoHighLevel and n8n Academy."
        intro="Click any badge or certificate to view it in full."
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1fr]">
        {certifications.map((c) => (
          <li key={c.image} className={cn(c.badge && 'sm:col-span-2 xl:col-span-1 xl:row-span-2')}>
            <button
              type="button"
              onClick={() => open(c)}
              aria-label={`View ${c.title}`}
              className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-paper text-left transition-colors hover:border-ink/30"
            >
              <span
                className={cn(
                  'block w-full overflow-hidden',
                  c.badge
                    ? 'grid flex-1 place-items-center border-b border-line bg-white p-8'
                    : 'aspect-[3/2] border-b border-line bg-navy',
                )}
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className={cn(
                    'transition-transform duration-300 group-hover:scale-[1.03]',
                    c.badge
                      ? 'max-h-64 w-auto object-contain'
                      : 'h-full w-full object-cover object-top',
                  )}
                />
              </span>
              <span className="block p-4">
                <span className="block font-medium leading-snug">{c.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {c.issuer}
                  {c.date && ` · ${c.date}`}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby="cert-dialog-title"
        onClose={() => setActive(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === e.currentTarget) close()
        }}
        className="m-auto max-h-[90vh] w-[min(56rem,92vw)] overflow-visible bg-transparent p-0 backdrop:bg-navy/80 backdrop:backdrop-blur-sm"
      >
        {active && (
          <figure className="relative m-0 overflow-hidden rounded-xl bg-card">
            <img
              src={active.image}
              alt={active.title}
              className={cn('block max-h-[78vh] w-full object-contain', active.badge && 'bg-white p-8')}
            />
            <figcaption className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5">
              <span>
                <span id="cert-dialog-title" className="block font-medium text-ink">
                  {active.title}
                </span>
                <span className="block text-sm text-muted">
                  {active.issuer}
                  {active.date && ` · ${active.date}`}
                </span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line text-ink hover:border-ink"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </section>
  )
}
