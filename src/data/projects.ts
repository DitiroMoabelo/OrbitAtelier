export type ProjectLink = {
  label: string
  href: string
}

export type OrbitProject = {
  id: string
  name: string
  tech: string
  blurb: string
  proof: string
  links: ProjectLink[]
  /** Pastel surface colour */
  color: string
  /** Soft atmosphere tint */
  atmosphere: string
  /** Distance from sun centre */
  orbitRadius: number
  /** Planet body radius */
  size: number
  /** Radians per second */
  orbitSpeed: number
  /** Axial spin */
  spinSpeed: number
  /** Optional ring */
  hasRing?: boolean
  ringColor?: string
}

export const projects: OrbitProject[] = [
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
    atmosphere: '#D8E6C3',
    orbitRadius: 6.2,
    size: 0.72,
    orbitSpeed: 0.18,
    spinSpeed: 0.6,
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
    atmosphere: '#FDECF2',
    orbitRadius: 8.4,
    size: 0.58,
    orbitSpeed: 0.13,
    spinSpeed: 0.85,
    hasRing: true,
    ringColor: '#F7C7D3',
  },
  {
    id: 'medibook',
    name: 'MediBook',
    tech: 'Java · Spring Boot · Security · Thymeleaf · Gemini',
    blurb:
      'A team-built hospital booking platform with patient, doctor, and admin areas, password resets, and AI service recommendations.',
    proof: '31 classes across auth, booking, and AI — browsable Spring Boot source with honest local-run docs.',
    links: [{ label: 'View code', href: 'https://github.com/DitiroMoabelo/MediBook' }],
    color: '#A8C8E8',
    atmosphere: '#D8E8F5',
    orbitRadius: 10.6,
    size: 0.64,
    orbitSpeed: 0.1,
    spinSpeed: 0.45,
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
    atmosphere: '#FFF7EE',
    orbitRadius: 12.8,
    size: 0.5,
    orbitSpeed: 0.08,
    spinSpeed: 0.9,
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
    atmosphere: '#EFDDF4',
    orbitRadius: 15.0,
    size: 0.55,
    orbitSpeed: 0.06,
    spinSpeed: 0.55,
    hasRing: true,
    ringColor: '#EFDDF4',
  },
]
