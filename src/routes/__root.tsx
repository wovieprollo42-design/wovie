import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { INTRO_BOOT_SCRIPT } from '@/components/Intro'
import { NotFoundPage } from '@/components/NotFoundPage'
import { CursorLabel } from '@/components/CursorLabel'
import { links, profile, services, site, tools } from '@/data/site'

import '../styles.css'

/** Structured-data job title (Person.jobTitle below); the on-page <title> is set separately so it
 *  can read like a headline rather than a formal title. */
const JOB_TITLE = 'Workflow & AI Automation Specialist'
const TITLE = `${profile.name} | Certified GoHighLevel Expert & AI Automation Builder`
const DESCRIPTION = `${profile.positioning} GoHighLevel CRM setup, workflow automation, and practical AI agents.`

/* Every absolute URL comes from site.url (src/data/site.ts). */
const SITE_URL = site.url.replace(/\/+$/, '')
const PAGE_URL = `${SITE_URL}/`
/**
 * Share card, 1200x630. The name and role line are baked into the image, so
 * the alt text is written to match it. Regenerate the card if they change
 * (see docs/seo.md).
 */
const OG_IMAGE = `${SITE_URL}/og.png`
const OG_IMAGE_ALT = `${profile.name}, Certified GoHighLevel Expert & AI Automation Builder`

/* Structured data: only facts documented in src/data/site.ts. */
const PERSON_ID = `${PAGE_URL}#person`
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${PAGE_URL}#website`,
      url: PAGE_URL,
      name: profile.name,
      inLanguage: 'en',
      about: { '@id': PERSON_ID },
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: profile.name,
      jobTitle: JOB_TITLE,
      description: profile.positioning,
      url: PAGE_URL,
      image: `${SITE_URL}${profile.photo}`,
      email: links.email,
      address: {
        '@type': 'PostalAddress',
        // profile.location is 'Manila, Philippines'.
        addressLocality: profile.location.split(',')[0].trim(),
        addressCountry: 'PH',
      },
      sameAs: [links.linkedin],
      knowsAbout: Array.from(new Set([...tools, ...services.map((s) => s.title)])),
    },
  ],
}
/* Escape "<" so the JSON can never close the script tag early. */
const JSON_LD_HTML = JSON.stringify(JSON_LD).replace(/</g, '\\u003c')

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: profile.name },
      { property: 'og:url', content: PAGE_URL },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: OG_IMAGE_ALT },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: TITLE },
      { name: 'twitter:description', content: DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
    ],
    links: [
      { rel: 'canonical', href: PAGE_URL },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap',
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Browser UI color for each OS scheme. These live here, not in head().meta,
            because HeadContent keeps only one meta tag per name. */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f5f0" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e121a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON_LD_HTML }}
        />
        {/* Apply the saved theme (or the OS preference) before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();",
          }}
        />
        {/* Show the voiced intro overlay before first paint, unless this session has already
            seen it or the visitor prefers reduced motion (src/components/Intro.tsx). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        {/* Reveal is JS driven; keep content visible if JS never runs. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: '<style>.reveal{opacity:1;transform:none}</style>',
          }}
        />
      </head>
      <body>
        {children}
        <CursorLabel />
        <Scripts />
      </body>
    </html>
  )
}
