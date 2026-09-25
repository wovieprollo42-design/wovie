import { profile } from '@/data/site'

/**
 * TanStack Start root route notFoundComponent (fix round item 15): a simple branded page for any
 * unmatched path, with a link back to the one real page. Rendered by the same RootDocument as the
 * homepage, so the theme script still applies; the intro boot script only ever runs on `/`, so it
 * never shows here.
 */
export function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-paper px-6 py-24 text-center text-ink">
      <div>
        <p className="font-mono text-sm tracking-[0.14em] text-muted uppercase">404</p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Page not found.</h1>
        <p className="mt-3 max-w-sm text-muted">
          That page doesn&rsquo;t exist. {profile.name}&rsquo;s portfolio lives on the homepage.
        </p>
        <a href="/" className="btn btn-primary mt-6 inline-flex">
          Back to home
        </a>
      </div>
    </div>
  )
}
