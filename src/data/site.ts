/**
 * All site copy and links live here. Edit this file to change the page;
 * the components only handle presentation.
 *
 * Every claim below is taken from Wovie's resume (public/resume.pdf) or the
 * previous portfolio's project write-ups. Do not add numbers, clients, or
 * results that are not documented there.
 */

/**
 * Public address of the site, without a trailing slash. The canonical link,
 * og:url, og:image, and JSON-LD in src/routes/__root.tsx are all built from it.
 * wovie.vercel.app was the first choice, but another Vercel account holds it.
 * If this changes, also update the static files public/robots.txt and
 * public/sitemap.xml and the host printed on public/og.png (see docs/seo.md).
 */
export const site = { url: 'https://wovie-certified.vercel.app' }

export const profile = {
  name: 'Wovie Prollo',
  /** Small label above the hero title. */
  heroEyebrow: 'GoHighLevel & AI automation · US / EU / APAC hours',
  /** Hero title (H1), one entry per line. The last line is the italic orange accent. */
  titleLines: ['Certified GoHighLevel', 'Expert And', 'AI Automation Builder.'],
  positioning:
    'I build systems that organize leads, automate follow-up, and simplify business operations.',
  location: 'Manila, Philippines',
  availability: 'Remote, working across time zones',
  /** Short line under the name in the sidebar. */
  tagline: 'I build the CRM and follow-up systems that keep leads moving.',
  /** Status chip in the sidebar. Set to '' to hide it. */
  status: 'Available for work & projects',
  timezone: 'Manila GMT+8 · remote across time zones',
  responseTime: 'Usually responds within 24 hours',
  /** Profile photo. Replace the file in /public or point this at a new one. */
  photo: '/profile.jpg',
  /**
   * Optional hero visual. Leave as null to show the built-in workflow
   * diagram, or set to an image path in /public (e.g. '/hero.png').
   */
  heroVisual: null as string | null,
  resume: '/resume.pdf',
}

/**
 * Voiced intro overlay, shown once per session before the page (src/components/Intro.tsx).
 * Words are owned by docs/intro-copy.md; a few strings (terminal wording, exact voice-line
 * text) were adjusted by the frontend engineer to match the real recording and touch/keyboard
 * use, where they differed from that doc's draft. See docs/intro-copy.md's "Notes for other
 * agents" and docs/intro-brief.md's "Technical decisions".
 *
 * The voice is the browser's own speechSynthesis (like the reference intro), reading
 * `lines[].say` with the preferred `voice` gender and `rate`; each caption appears when its
 * line starts speaking. `lines[].at` only drive the captions on the "Enter without sound"
 * path (and as a backup if the voice never starts), spaced over `seconds`. To use a recording
 * instead, set `voiceFile` to a file in /public and time `at` to it.
 */
export const intro = {
  enabled: true,
  role: 'Certified GoHighLevel Expert · AI Automation Builder',
  /**
   * Empty: the browser's own speech voice reads the lines (like the reference intro at
   * israelgonzaga.vercel.app). Set a path such as '/intro-voice.mp3' to play a recording instead.
   */
  voiceFile: '',
  /**
   * Browser voice: preferred gender and speaking rate. 1 is normal; the owner wanted it a
   * little brisk. Chrome on Windows rounds the rate to whole steps of the system voice, so
   * anything below about 1.26 still sounds like normal speed there.
   */
  voice: 'male' as 'male' | 'female',
  rate: 1.3,
  /** Length of the progress bar in seconds (about how long the voice takes to read the lines). */
  seconds: 13,
  /**
   * The lines are worded as an offer of services. `say` is what the voice speaks (spelled
   * for pronunciation); `text` is the caption. `at` is each caption's fallback time.
   */
  lines: [
    {
      at: 0.2,
      say: "Hi, I'm Wovie Prollo, a certified Go High Level expert.",
      text: "Hi, I'm Wovie Prollo, a certified GoHighLevel expert.",
      accent: 'certified GoHighLevel expert',
    },
    {
      at: 3.7,
      say: 'I can set up your C R M, and automate your follow-up.',
      text: 'I can set up your CRM and automate your follow-up.',
      accent: 'automate your follow-up',
    },
    {
      at: 7.2,
      say: 'I also build A I voice and chat agents for your business.',
      text: 'I also build AI voice and chat agents for your business.',
      accent: 'AI voice and chat agents',
    },
    {
      at: 10.4,
      say: "Let's get started!",
      text: "Let's Get Started!",
      accent: 'Get Started!',
    },
  ],
  /**
   * Run log lines. No "$", ">" or "checkmark" prefixes: the design's nodes carry status.
   * "idle" and "run" are worded to work for touch as well as keyboard (per the brief).
   */
  terminal: {
    boot: 'trigger: new visitor',
    idle: 'waiting for you to enter',
    run: 'crm → follow-up → ai agents',
    done: 'workflow complete',
  },
  labels: {
    enter: 'Please Enter',
    quiet: 'Enter without sound',
    skip: 'Skip intro',
    mute: 'Mute intro voice',
    unmute: 'Unmute intro voice',
    dialog: "Intro to Wovie Prollo's portfolio",
    replay: 'Replay intro',
    /** Shown once, decoratively, when the intro finishes (docs/intro-brief.md, 2026-09-25). */
    welcome: 'Welcome!',
  },
}

export const links = {
  linkedin: 'https://www.linkedin.com/in/wovie-prollo-3102a5308/',
  email: 'wovieprollo42@gmail.com',
  whatsapp: 'https://wa.me/639063425144',
  upwork: 'https://www.upwork.com/freelancers/~016098766f2632c3f0',
}

export const booking = {
  /** Calendly event link, taken from the previous portfolio's contact page. */
  url: 'https://calendly.com/wovieprollo42/30min',
  length: '30-minute',
}


export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Systems', href: '#systems' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Book a call', href: '#book' },
]

/** Featured pair at the top of the work area. Sources: previous portfolio. */
export const featured = {
  site: {
    label: 'Membership site · GoHighLevel',
    title: 'Your Power Suite',
    description:
      'Membership site for a national community of women in real estate and mortgage, with webinar and seminar sign-ups.',
    image: '/projects/websites/yourpowersuite.jpg',
    url: 'https://yourpowersuite.com/',
  },
  workflow: {
    label: 'One workflow',
    eyebrow: 'Under the hood',
    title: 'This is one automation.',
    description:
      'Every form submission gets tagged, an opportunity, email and SMS, then an AI voice call, and is routed by outcome: booked, engaged, or no answer.',
    image: '/projects/form-submission-lead.png',
  },
}

/** Live client sites. Source: previous portfolio's website projects. */
export const websites = [
  { name: 'Your Power Suite', note: 'Membership community', image: '/projects/websites/yourpowersuite.jpg', url: 'https://yourpowersuite.com/' },
  { name: 'The Row House', note: 'Fitness studio', image: '/projects/websites/therowhouse.jpg', url: 'https://www.therowhouse.com/' },
  { name: 'LeadKast', note: 'Business advisory', image: '/projects/websites/leadkast.jpg', url: 'https://leadkast.com/' },
  { name: 'The Disc Doctor', note: 'Local chiropractic', image: '/projects/websites/thediscdoctor.jpg', url: 'https://site.thediscdoctor.com/' },
  { name: 'AI Pro Partner', note: 'AI systems partner', image: '/projects/websites/aipropartner.jpg', url: 'https://aipropartner.com/home' },
  { name: 'Disruptors Media', note: 'Fractional CAIO and CMO', image: '/projects/websites/disruptorsmedia.jpg', url: 'https://disruptorsmedia.com/' },
]

/**
 * Years of experience: resume summary. The other counts come from the
 * previous portfolio's "By the Numbers", counted from its
 * project list: 22 workflows, 8 AI/voice agents, 6 websites and funnels,
 * 6 industries. Credentials come from the certificate images.
 */
export const proofPoints = [
  { value: '4', label: 'Years of experience' },
  { value: '22', label: 'Workflows shipped' },
  { value: '8', label: 'AI agents in production' },
  { value: '6', label: 'Funnels & landing pages' },
  { value: '6', label: 'Industries served' },
]

export const credentials = [
  'GoHighLevel CRM Expert badge',
  'n8n Academy: 4 course certificates',
]

export const about = {
  paragraphs: [
    'Most businesses I work with already have the tools. What they are missing is the system that connects them: leads land in one place, follow-up happens on time, and nobody has to remember the next step.',
    'I spend most of my time inside GoHighLevel, setting up pipelines, forms, tags, and the workflows that move contacts forward. When a job needs more, I build around it with n8n, Make, Zapier, APIs, and webhooks.',
    'I also build practical AI systems: chat agents that sort and answer incoming messages, voice agents that qualify callers and book appointments, and agents that turn intake data into structured records and proposals.',
  ],
  focus: [
    'CRM setup',
    'Workflow automation',
    'Lead management',
    'Customer communication',
    'Practical AI systems',
  ],
  experience: [
    {
      role: 'Workflow Automation Specialist',
      org: 'Freelance, Upwork and OnlineJobs.ph',
      note: 'Current',
    },
    {
      role: 'System Builder / Automation Expert',
      org: 'Press Haven Homes',
      note: 'Long-term rental',
    },
    {
      role: 'Automation Specialist',
      org: 'Stay Classy Homes',
      note: 'Short-term rental',
    },
  ],
}

export const services = [
  {
    title: 'CRM Architecture and GoHighLevel Setup',
    description:
      'Pipelines, custom fields, tags, forms, and calendars set up so every contact has a clear place and a clear next step.',
  },
  {
    title: 'Workflow Automation',
    description:
      'End-to-end workflows in GoHighLevel, n8n, Make, and Zapier that take repetitive handoffs off your team.',
  },
  {
    title: 'AI Voice and Chat Agents',
    description:
      'Retell AI voice agents and OpenAI chat agents that qualify leads, answer routine questions, and book appointments.',
  },
  {
    title: 'Funnels and Websites',
    description:
      'Landing pages, funnels, and multi-page sites that feed straight into your CRM and automations.',
  },
  {
    title: 'API and Webhook Integrations',
    description:
      'Custom connections between your apps so data moves between systems without copy and paste.',
  },
  {
    title: 'Reporting and Workflow Optimization',
    description:
      'Audit trails, tracking sheets, and SOPs, plus tuning existing workflows once real data shows where they stall.',
  },
]

export type CaseStudy = {
  title: string
  tools: string[]
  problem: string
  system: string
  result: string
  /** Workflow diagram. Each inner array is one lane of connected steps. */
  flow: string[][]
  /** Workflow screenshots in /public/projects. */
  screenshots: Array<{ label: string; src: string }>
}

/** Sources: project write-ups from the previous portfolio. Results are qualitative on purpose. */
export const caseStudies: CaseStudy[] = [
  {
    title: 'AI Chat Agent',
    tools: ['n8n', 'OpenAI', 'Vector store', 'Webhook'],
    problem:
      'Every incoming chat message needed a person to read it and decide if it was routine, a booking request, or urgent.',
    system:
      'An n8n AI agent with vector-store memory reads each message, classifies it, and routes it through a switch to an automatic reply, the booking flow, or a flagged escalation.',
    result:
      'Routine messages get an instant, on-brand reply. Only the ones that need a person reach one.',
    flow: [['Message in', 'Classify', 'Route', 'Reply or escalate']],
    screenshots: [{ label: 'Workflow', src: '/projects/ai-chat-agent.png' }],
  },
  {
    title: 'Lead Enrichment Engine',
    tools: ['n8n', 'AI agent', 'Apollo', 'Apify'],
    problem:
      'Building lead lists meant running Apollo searches by hand, exporting results, and scoring each contact manually.',
    system:
      'An AI agent turns a plain-language request into an Apollo search. Apify scrapes the results, and each lead is scored on industry, company size, and title before it goes to the outreach tool.',
    result:
      'Only scored leads with an email and a website reach the sales team. The manual list-building step is gone.',
    flow: [['Request', 'Apollo search', 'Apify scrape', 'Score', 'Outreach']],
    screenshots: [{ label: 'Workflow', src: '/projects/lead-enrichment-engine.png' }],
  },
  {
    title: 'Voice AI Booking and Call Flows',
    tools: ['Retell AI', 'n8n', 'Calendar'],
    problem:
      'Inbound calls needed a consistent greeting and qualification, and booking a call meant someone checking the calendar live.',
    system:
      'Retell AI voice agents greet callers, collect business details, and gauge interest. A backend n8n workflow checks real calendar availability and confirms the appointment during the call.',
    result:
      'Callers are qualified the same way every time and leave with a confirmed slot from the real calendar.',
    flow: [['Call', 'Greet + qualify', 'Check calendar', 'Booked']],
    screenshots: [
      { label: 'Booking workflow', src: '/projects/voice-inbound-booking-workflow.png' },
      { label: 'Voice agent', src: '/projects/voice-sara-lead-qualifier.png' },
    ],
  },
  {
    title: 'Client Onboarding and Proposal Agents',
    tools: ['n8n', 'AI agent', 'Documents'],
    problem:
      'Onboarding meant back-and-forth emails to collect details, then writing each proposal from scratch.',
    system:
      'A chat-based agent walks new clients through a structured intake. A second agent pulls that intake data and drafts a formatted proposal for final review.',
    result:
      'Each engagement starts with a complete record, and proposals are built from the same data every time.',
    flow: [['Intake chat', 'Structured record', 'Draft proposal', 'Review']],
    screenshots: [
      { label: 'Onboarding agent', src: '/projects/onboarding-agent.png' },
      { label: 'Proposal agent', src: '/projects/proposal-agent.png' },
    ],
  },
  {
    title: 'Lead Routing and CRM Intake',
    tools: ['GoHighLevel', 'Webhook', 'Voice AI'],
    problem:
      'Form submissions landed in a shared inbox with no clear owner, so leads waited until someone noticed.',
    system:
      'A GoHighLevel workflow tags the contact and opens an opportunity on submit, sends email and SMS, triggers an AI voice call by webhook, then routes the lead by outcome: booked, engaged, or no answer.',
    result:
      'Every lead is contacted right away and lands in the right follow-up path.',
    flow: [['Form submitted', 'Tag + opportunity', 'Email, SMS, call', 'Route by outcome']],
    screenshots: [{ label: 'Workflow', src: '/projects/form-submission-lead.png' }],
  },
  {
    title: 'Content Publishing and Payment Tracking',
    tools: ['n8n', 'WordPress', 'GoHighLevel'],
    problem:
      'Articles had to be written and posted by hand, and payments were reconciled manually, so mismatches surfaced late.',
    system:
      'An n8n workflow generates long-form articles and publishes them to WordPress on a schedule. A GoHighLevel workflow logs each payment, checks it against records, and flags mismatches.',
    result:
      'Content goes live on schedule without touching the dashboard, and payment discrepancies are flagged when they happen.',
    flow: [
      ['Schedule', 'Write article', 'Publish'],
      ['Payment', 'Reconcile', 'Flag mismatch'],
    ],
    screenshots: [
      { label: 'Publishing', src: '/projects/auto-article-wordpress.png' },
      { label: 'Payments', src: '/projects/payments-received-tracking-audit.png' },
    ],
  },
]

/**
 * Certifications, copied from wovieofficial.vercel.app. Images live in
 * /public/certifications. `badge` renders uncropped; certificates are
 * cropped to the certificate itself in the grid and shown in full on click.
 */
export const certifications = [
  {
    title: 'GHL CRM Expert',
    issuer: 'GoHighLevel',
    date: '',
    image: '/certifications/ghl-crm-expert-badge.png',
    badge: true,
  },
  {
    title: 'n8n Quickstart',
    issuer: 'n8n Academy',
    date: 'July 5, 2026',
    image: '/certifications/n8n-quickstart.png',
    badge: false,
  },
  {
    title: 'Essentials: Your First Workflows',
    issuer: 'n8n Academy',
    date: 'July 5, 2026',
    image: '/certifications/n8n-essentials-first-workflows.png',
    badge: false,
  },
  {
    title: 'Integrations: APIs & Connected Workflows',
    issuer: 'n8n Academy',
    date: 'July 5, 2026',
    image: '/certifications/n8n-integrations-apis.png',
    badge: false,
  },
  {
    title: 'In Practice: AI, Testing & Best Practices',
    issuer: 'n8n Academy',
    date: 'July 5, 2026',
    image: '/certifications/n8n-ai-testing-best-practices.png',
    badge: false,
  },
]

/**
 * Client testimonials, copied word for word from the previous portfolio.
 * Only add quotes a client actually gave; never edit their wording.
 */
export const testimonials = [
  {
    quote:
      "Working with Wovie has been an absolute relief. He's incredibly reliable, detail-oriented, and always delivers with professionalism and integrity. He adapts quickly to any task, communicates proactively, and consistently proves himself as a trusted, high-performing partner.",
    name: 'Elor Kahalanay',
    title: 'Business Owner',
  },
  {
    quote:
      "Wovie's attention to detail and deep understanding of automation tools is impressive. He created custom workflows that perfectly fit our business needs. Professional and results-driven.",
    name: 'Trey Pinkerman',
    title: 'Funding Business Owner',
  },
]

/**
 * Video testimonial, self-hosted in /public/testimonials (downloaded from the
 * client's Google Drive share). Set src to '' to hide it.
 */
export const videoTestimonial = {
  src: '/testimonials/john-pancerzewski.mp4',
  poster: '/testimonials/john-pancerzewski-poster.jpg',
  name: 'John Pancerzewski',
  title: 'Property Manager',
}

/** Sources: resume Technical Skills and Experience sections. */
export const tools = [
  'GoHighLevel',
  'n8n',
  'Make',
  'Zapier',
  'HubSpot',
  'OpenAI',
  'Claude',
  'Retell AI',
  'APIs',
  'Webhooks',
  'Google Sheets',
  'Airtable',
  'Monday.com',
  'Apollo',
  'Apify',
  'WordPress',
  'Google Workspace',
  'Mailchimp',
]
