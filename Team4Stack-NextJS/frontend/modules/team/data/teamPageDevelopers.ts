export type WorkExperience = {
  title: string
  company: string
  period: string
  description: string
}

export type ClientReview = {
  id: string
  clientName: string
  company?: string
  rating: number
  text: string
  date: string
}

export type TeamPageDeveloper = {
  id: string
  slug: string
  name: string
  role: string
  skills: string[]
  bio: string
  longBio?: string
  image: string
  portfolio?: string
  github?: string
  availability: 'Available' | 'Busy' | 'Limited'
  yearsExperience?: number
  projectsCompleted?: number
  rating?: number
  reviewCount?: number
  experience?: WorkExperience[]
  reviews?: ClientReview[]
}

const SHARED_EXPERIENCE = {
  team4stack: {
    title: 'Full Stack Developer',
    company: 'Team4Stack',
    period: '2023 — Present',
    description: 'Delivering client projects across MERN stack, milestones, and production deployments.',
  },
}

export const TEAM_PAGE_DEVELOPERS: TeamPageDeveloper[] = [
  {
    id: 'sami',
    slug: 'sami',
    name: 'M. Sami Ullah Khan',
    role: 'Full Stack Developer — Team Lead',
    skills: ['MERN', 'Architecture', 'Project Management', 'Next.js', 'PostgreSQL'],
    bio: 'Leads client projects from planning through delivery and keeps timelines on track.',
    longBio:
      'I specialize in MERN stack architecture, client communication, and end-to-end delivery. I help scope projects, break work into milestones, and keep your build on schedule.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    availability: 'Available',
    yearsExperience: 5,
    projectsCompleted: 24,
    rating: 4.9,
    reviewCount: 12,
    experience: [
      { ...SHARED_EXPERIENCE.team4stack, title: 'Team Lead & Full Stack Developer' },
      {
        title: 'Freelance Web Developer',
        company: 'Independent',
        period: '2021 — 2023',
        description: 'Built dashboards, e-commerce flows, and custom APIs for small businesses.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Ahmed R.',
        company: 'Retail startup',
        rating: 5,
        text: 'Sami scoped our MVP clearly and delivered on time. Communication was excellent throughout.',
        date: 'Jan 2026',
      },
      {
        id: 'r2',
        clientName: 'Sara K.',
        rating: 5,
        text: 'Professional, fast replies, and solid architecture. Would hire again.',
        date: 'Nov 2025',
      },
    ],
  },
  {
    id: 'aftab',
    slug: 'aftab',
    name: 'Aftab Alam',
    role: 'Backend Developer',
    skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Supabase', 'Security'],
    bio: 'Builds secure APIs, database design, and server-side logic for production apps.',
    longBio:
      'Backend-focused engineer with experience in Node.js, PostgreSQL, and REST API design. I build reliable server layers that scale with your product.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    availability: 'Available',
    yearsExperience: 4,
    projectsCompleted: 18,
    rating: 4.8,
    reviewCount: 9,
    experience: [
      SHARED_EXPERIENCE.team4stack,
      {
        title: 'Backend Intern',
        company: 'Tech agency',
        period: '2020 — 2021',
        description: 'API integrations, database migrations, and auth flows.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Omar H.',
        company: 'SaaS client',
        rating: 5,
        text: 'Clean APIs and thorough documentation. Our app backend is rock solid.',
        date: 'Dec 2025',
      },
    ],
  },
  {
    id: 'hasnain',
    slug: 'hasnain',
    name: 'Hasnain Ali',
    role: 'Frontend Developer',
    skills: ['React', 'Next.js', 'UI/UX', 'Tailwind', 'Animations'],
    bio: 'Crafts responsive interfaces, animations, and pixel-perfect user experiences.',
    longBio:
      'Frontend specialist in React and Next.js. I turn designs into fast, accessible interfaces with clean component architecture.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    availability: 'Limited',
    yearsExperience: 3,
    projectsCompleted: 14,
    rating: 4.7,
    reviewCount: 7,
    experience: [
      {
        title: 'Frontend Developer',
        company: 'Team4Stack',
        period: '2023 — Present',
        description: 'Landing pages, admin dashboards, and responsive product UIs.',
      },
      {
        title: 'UI Developer',
        company: 'Design studio',
        period: '2022 — 2023',
        description: 'Component libraries and marketing sites in React.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Fatima N.',
        rating: 5,
        text: 'Beautiful UI and smooth animations. Exactly what we wanted.',
        date: 'Oct 2025',
      },
    ],
  },
  {
    id: 'fiaz',
    slug: 'fiaz',
    name: 'Fiaz Ahmed',
    role: 'Full Stack Developer',
    skills: ['MERN', 'DevOps', 'Integrations', 'Docker', 'Payments'],
    bio: 'Ships full features end-to-end and connects third-party services when needed.',
    longBio:
      'Full stack developer comfortable across the MERN stack and DevOps basics. I integrate payments, APIs, and deployment pipelines.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    availability: 'Available',
    yearsExperience: 4,
    projectsCompleted: 16,
    rating: 4.8,
    reviewCount: 8,
    experience: [
      SHARED_EXPERIENCE.team4stack,
      {
        title: 'Junior Developer',
        company: 'Software house',
        period: '2021 — 2022',
        description: 'Feature delivery, Stripe integrations, and CI/CD setup.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Bilal M.',
        company: 'E-commerce',
        rating: 5,
        text: 'Fiaz handled our payment flow and deployment without issues. Great work.',
        date: 'Feb 2026',
      },
      {
        id: 'r2',
        clientName: 'Hina T.',
        rating: 4,
        text: 'Responsive and skilled. Delivered integrations on schedule.',
        date: 'Aug 2025',
      },
    ],
  },
]

const AVAIL_MAP: Record<string, TeamPageDeveloper['availability']> = {
  available: 'Available',
  busy: 'Busy',
  limited: 'Limited',
}

export function mapApiProfile(row: Record<string, unknown>): TeamPageDeveloper {
  const avail = String(row.availability || 'available').toLowerCase()
  return {
    id: String(row.slug || row.id),
    slug: String(row.slug),
    name: String(row.name),
    role: String(row.role || 'Developer'),
    skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
    bio: String(row.bio || ''),
    longBio: row.long_bio ? String(row.long_bio) : undefined,
    image: String(row.image_url || ''),
    portfolio: row.portfolio_url ? String(row.portfolio_url) : undefined,
    github: row.github_url ? String(row.github_url) : undefined,
    availability: AVAIL_MAP[avail] || 'Available',
  }
}

export function findDummyBySlug(slug: string): TeamPageDeveloper | undefined {
  return TEAM_PAGE_DEVELOPERS.find((d) => d.slug === slug)
}

/** Merge portfolio/reviews/experience from local seed when API row is sparse */
export function enrichDeveloperProfile(profile: TeamPageDeveloper): TeamPageDeveloper {
  const seed = findDummyBySlug(profile.slug)
  if (!seed) return profile
  return {
    ...profile,
    yearsExperience: profile.yearsExperience ?? seed.yearsExperience,
    projectsCompleted: profile.projectsCompleted ?? seed.projectsCompleted,
    rating: profile.rating ?? seed.rating,
    reviewCount: profile.reviewCount ?? seed.reviewCount,
    experience: profile.experience?.length ? profile.experience : seed.experience,
    reviews: profile.reviews?.length ? profile.reviews : seed.reviews,
    longBio: profile.longBio || seed.longBio,
    portfolio: profile.portfolio || seed.portfolio,
    github: profile.github || seed.github,
  }
}
