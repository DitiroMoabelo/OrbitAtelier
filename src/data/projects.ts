export type ProjectLink = {
  label: string
  href: string
}

/** Shape vocabulary for the kinetic mobile — no spheres-as-planets. */
export type CharmShape =
  | 'ticket'
  | 'book'
  | 'capsule'
  | 'wing'
  | 'lantern'

export type CharmProject = {
  id: string
  name: string
  tech: string
  blurb: string
  proof: string
  links: ProjectLink[]
  /** Porcelain body colour */
  color: string
  /** Soft rim / thread tint */
  accent: string
  shape: CharmShape
  /** Horizontal slot along the ceiling bar, -1..1 */
  slot: number
  /** Resting thread length */
  drop: number
  /** Pendulum phase offset */
  phase: number
  /** Sway amplitude */
  sway: number
  scale: number
}

export const projects: CharmProject[] = [
  {
    id: 'helpdesk',
    name: 'IT Asset & Helpdesk System',
    tech: 'React · TypeScript · Spring Boot · PostgreSQL',
    blurb:
      'An internal IT operations platform: role-based tickets, asset register, assignment rules, and a browser demo that enforces the same workflow as the backend.',
    proof: 'Full-stack delivery with JWT roles, controlled status transitions, and a live clickable demo.',
    links: [
      { label: 'Try live demo', href: 'https://ditiromoabelo.github.io/IT-Asset-Helpdesk-System/' },
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/IT-Asset-Helpdesk-System' },
    ],
    color: '#C7D8A5',
    accent: '#9BB57A',
    shape: 'ticket',
    slot: -0.82,
    drop: 2.4,
    phase: 0.2,
    sway: 0.22,
    scale: 1.05,
  },
  {
    id: 'twiceasbooks',
    name: 'TwiceAsBooks',
    tech: 'PHP · MySQL · JavaScript',
    blurb:
      'A full-stack bookstore with customer shopping flows and an admin back office for products, users, orders, and enquiries.',
    proof: 'Multi-page PHP structure, auth, cart logic, and operations beyond a product listing.',
    links: [
      { label: 'Visit website', href: 'https://twiceasbooks.great-site.net/' },
      {
        label: 'View code',
        href: 'https://github.com/DitiroMoabelo/TwiceAsBooks/tree/main/ST10087657%26%20ST10033503_WEDE6021_POE',
      },
    ],
    color: '#F7C7D3',
    accent: '#E8A0B4',
    shape: 'book',
    slot: -0.38,
    drop: 3.1,
    phase: 1.1,
    sway: 0.28,
    scale: 1,
  },
  {
    id: 'medibook',
    name: 'MediBook',
    tech: 'Java · Spring Boot · Security · Thymeleaf · Gemini',
    blurb:
      'A team-built hospital booking platform with patient, doctor, and admin areas, password resets, and AI service recommendations.',
    proof: '31 classes across auth, booking, and AI — browsable Spring Boot source with honest local-run docs.',
    links: [{ label: 'View code', href: 'https://github.com/DitiroMoabelo/MediBook' }],
    color: '#B7D3EC',
    accent: '#7FAFCF',
    shape: 'capsule',
    slot: 0.05,
    drop: 2.7,
    phase: 2.0,
    sway: 0.2,
    scale: 1.08,
  },
  {
    id: 'birdtrail',
    name: 'BirdTrail',
    tech: 'Kotlin · Firebase · Google Maps',
    blurb:
      'An Android field app for birdwatchers: sanctuary maps, photo-backed sightings, history, and a light achievement system.',
    proof: 'Mobile state, image upload, location features, and a complete registration-to-sighting journey.',
    links: [
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/Birdtrail-android-app' },
    ],
    color: '#E8D5A3',
    accent: '#C9B07A',
    shape: 'wing',
    slot: 0.48,
    drop: 3.4,
    phase: 2.7,
    sway: 0.34,
    scale: 1.12,
  },
  {
    id: 'gas',
    name: 'Thedimogane Gas',
    tech: 'HTML · CSS · JavaScript · Netlify',
    blurb:
      'A live business site for a local gas supplier — clear offers, contact paths, and a polished public presence.',
    proof: 'Shipped client-facing web work that is online and serving a real business.',
    links: [
      { label: 'Visit live site', href: 'https://thedimoganegas.netlify.app/' },
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/ThdimoganeGas' },
    ],
    color: '#DCC6E8',
    accent: '#B89BC9',
    shape: 'lantern',
    slot: 0.88,
    drop: 2.9,
    phase: 3.4,
    sway: 0.24,
    scale: 1,
  },
]
