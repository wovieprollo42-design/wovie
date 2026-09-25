import { createFileRoute } from '@tanstack/react-router'
import { Intro } from '@/components/Intro'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { Hero } from '@/components/Hero'
import { ProofPoints } from '@/components/ProofPoints'
import { FeaturedWork } from '@/components/FeaturedWork'
import { CaseStudies } from '@/components/CaseStudies'
import { Services } from '@/components/Services'
import { About } from '@/components/About'
import { Certifications } from '@/components/Certifications'
import { Testimonials } from '@/components/Testimonials'
import { Booking } from '@/components/Booking'
import { Footer } from '@/components/Footer'

export const Route = createFileRoute('/')({
  component: Home,
})

/**
 * Layout: a sticky profile sidebar on the left, a column of cards on the
 * right. Below the lg breakpoint the sidebar becomes a profile card at the
 * top and the compact Navbar takes over navigation.
 */
function Home() {
  return (
    <>
      {/* The intro overlay is a sibling of the page, not a child: while it is up, #page (not
          this wrapper's parent) gets `inert` so the page underneath can't be focused or read
          by assistive tech until the intro finishes (docs/intro-design.md #1.1). */}
      <div id="page">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-paper"
        >
          Skip to content
        </a>
        <Navbar />
        <div className="mx-auto w-full max-w-[84rem] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
            <Sidebar />
            <main id="top" className="grid min-w-0 gap-3 sm:gap-4">
              <Hero />
              <ProofPoints />
              <FeaturedWork />
              <CaseStudies />
              <Services />
              <About />
              <Certifications />
              <Testimonials />
              <Booking />
            </main>
          </div>
          <Footer />
        </div>
      </div>
      <Intro />
    </>
  )
}
