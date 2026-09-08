export type ProjectLink = {
  label: string
  href: string
}

/** Each project is a real object in the room, not an abstract shape. */
export type PropKind =
  | 'bookshelf'
  | 'desk'
  | 'windowNook'
  | 'kitchenette'
  | 'nightstand'

export type Vec3 = [number, number, number]

export type RoomProject = {
  id: string
  name: string
  short: string
  tech: string
  blurb: string
  proof: string
  links: ProjectLink[]
  prop: PropKind
  /** Where the prop sits on the floor plan. */
  position: Vec3
  rotationY: number
  /** Point the camera looks at when the prop is selected. */
  focus: Vec3
  /** Camera position relative to the focus point. */
  camOffset: Vec3
  /** Height of the floating label above the prop origin. */
  labelHeight: number
  color: string
  accent: string
}

export const projects: RoomProject[] = [
  {
    id: 'twiceasbooks',
    name: 'TwiceAsBooks — Online Bookstore',
    short: 'TwiceAsBooks',
    tech: 'PHP · MySQL · JavaScript',
    blurb:
      'A full-stack bookstore with customer shopping flows and an admin back office for products, users, orders, and enquiries.',
    proof: 'Multi-page PHP structure, auth, cart and checkout logic, and operations beyond a product listing.',
    links: [
      { label: 'Visit website', href: 'https://twiceasbooks.great-site.net/' },
      {
        label: 'View code',
        href: 'https://github.com/DitiroMoabelo/TwiceAsBooks/tree/main/ST10087657%26%20ST10033503_WEDE6021_POE',
      },
    ],
    prop: 'bookshelf',
    position: [-5.1, 0, -3.9],
    rotationY: 0.06,
    focus: [-5.1, 1.5, -3.9],
    camOffset: [0.4, 0.5, 4.4],
    labelHeight: 3.15,
    color: '#F7C7D3',
    accent: '#E8A0B4',
  },
  {
    id: 'helpdesk',
    name: 'IT Asset & Helpdesk System',
    short: 'Helpdesk System',
    tech: 'React · TypeScript · Spring Boot · PostgreSQL',
    blurb:
      'An internal IT operations platform: role-based tickets, an asset register, assignment rules, and a browser demo that enforces the same workflow as the backend.',
    proof: 'Full-stack delivery with JWT roles, controlled status transitions, and a live clickable demo.',
    links: [
      { label: 'Try live demo', href: 'https://ditiromoabelo.github.io/IT-Asset-Helpdesk-System/' },
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/IT-Asset-Helpdesk-System' },
    ],
    prop: 'desk',
    position: [-1.85, 0, -3.6],
    rotationY: 0,
    focus: [-1.6, 1.5, -3.3],
    camOffset: [1.25, 0.6, 2.7],
    labelHeight: 1.95,
    color: '#C7D8A5',
    accent: '#9BB57A',
  },
  {
    id: 'birdtrail',
    name: 'BirdTrail — Android Bird Tracking App',
    short: 'BirdTrail',
    tech: 'Kotlin · Firebase · Google Maps',
    blurb:
      'An Android field app for birdwatchers: sanctuary maps, photo-backed sightings, a RecyclerView history, and a light achievement system.',
    proof: 'Mobile state, image upload flows, location-aware features, and a full registration-to-sighting journey.',
    links: [
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/Birdtrail-android-app' },
    ],
    prop: 'windowNook',
    position: [1.35, 0, -4.15],
    rotationY: 0,
    focus: [1.35, 1.6, -4.0],
    camOffset: [0.1, 0.45, 3.4],
    labelHeight: 2.05,
    color: '#E8D5A3',
    accent: '#C9B07A',
  },
  {
    id: 'gas',
    name: 'Thedimogane Gas — Live Business Site',
    short: 'Thedimogane Gas',
    tech: 'HTML · CSS · JavaScript · Netlify',
    blurb:
      'A live ordering site for a real LPG supplier. Customers compare cylinder sizes and refill prices, check delivery areas, and order straight through WhatsApp.',
    proof: 'A working public deployment serving a real business, with pricing tables and a mobile-first ordering flow.',
    links: [
      { label: 'Visit live site', href: 'https://thedimoganegas.netlify.app/' },
      { label: 'View code', href: 'https://github.com/DitiroMoabelo/ThdimoganeGas' },
    ],
    prop: 'kitchenette',
    position: [4.55, 0, -3.75],
    rotationY: -0.05,
    focus: [4.55, 1.05, -3.5],
    camOffset: [-0.5, 0.6, 3.4],
    labelHeight: 1.85,
    color: '#DCC6E8',
    accent: '#B89BC9',
  },
  {
    id: 'medibook',
    name: 'MediBook — Hospital Booking System',
    short: 'MediBook',
    tech: 'Java · Spring Boot · Security · Thymeleaf · Gemini',
    blurb:
      'A team-built hospital booking platform with patient, doctor, and admin areas, password resets over email, and AI service recommendations.',
    proof: '31 classes across auth, booking, and AI — browsable Spring Boot source with honest local-run docs.',
    links: [{ label: 'View code', href: 'https://github.com/DitiroMoabelo/MediBook' }],
    prop: 'nightstand',
    position: [-3.6, 0, -3.95],
    rotationY: 0.12,
    focus: [-3.6, 0.95, -3.8],
    camOffset: [-0.65, 0.65, 2.5],
    labelHeight: 1.6,
    color: '#B7D3EC',
    accent: '#7FAFCF',
  },
]
