import { featured, websites } from '@/data/site'
import { ArrowIcon } from './Icons'

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute bottom-3 left-3 rounded-md bg-navy/90 px-2.5 py-1.5 font-mono text-[0.68rem] tracking-[0.12em] text-white uppercase backdrop-blur">
      {children}
    </span>
  )
}

export function FeaturedWork() {
  const { site, workflow } = featured

  return (
    <section id="work" aria-label="Selected work" className="grid gap-3 sm:gap-4">
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[1.55fr_1fr]">
        <article className="flex flex-col overflow-hidden rounded-[1.25rem] border border-line bg-card">
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="relative block">
            <img
              src={site.image}
              alt={`${site.title} website`}
              width={1440}
              height={900}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover object-top"
            />
            <Chip>{site.label}</Chip>
          </a>
          <div className="flex flex-1 flex-col p-6 md:p-7">
            <p className="eyebrow text-[0.7rem] text-signal-deep">Featured build</p>
            <h2 className="mt-2 font-heading text-3xl leading-tight">{site.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{site.description}</p>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 self-start text-sm font-medium underline decoration-signal decoration-2 underline-offset-4"
            >
              Visit the live site
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>
        </article>

        <article className="flex flex-col overflow-hidden rounded-[1.25rem] border border-line bg-card">
          <a href={workflow.image} target="_blank" rel="noopener noreferrer" className="relative block bg-white">
            <img
              src={workflow.image}
              alt="Lead routing workflow in GoHighLevel"
              width={716}
              height={992}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover object-top"
            />
            <Chip>{workflow.label}</Chip>
          </a>
          <div className="flex flex-1 flex-col p-6 md:p-7">
            <p className="eyebrow text-[0.7rem] text-signal-deep">{workflow.eyebrow}</p>
            <h2 className="mt-2 font-heading text-3xl leading-tight">{workflow.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{workflow.description}</p>
            <a
              href="#systems"
              className="mt-5 inline-flex items-center gap-2 self-start text-sm font-medium underline decoration-signal decoration-2 underline-offset-4"
            >
              See more systems
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>
        </article>
      </div>

      <div className="panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-[0.7rem] text-muted">Websites and funnels</p>
            <h2 className="mt-2 font-heading text-3xl leading-tight md:text-4xl">Live client sites.</h2>
          </div>
          <p className="text-sm text-muted">Each one opens in a new tab.</p>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {websites.map((w) => (
            <li key={w.url}>
              <a href={w.url} target="_blank" rel="noopener noreferrer" className="group block">
                <span className="block overflow-hidden rounded-lg border border-line">
                  <img
                    src={w.image}
                    alt={`${w.name} website`}
                    width={1440}
                    height={900}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </span>
                <span className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="font-medium">{w.name}</span>
                  <span className="text-xs text-muted">{w.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
