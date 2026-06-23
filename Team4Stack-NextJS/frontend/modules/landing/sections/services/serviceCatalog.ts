import type { IconType } from 'react-icons'
import {
  FiBriefcase,
  FiCloud,
  FiCode,
  FiGlobe,
  FiImage,
  FiLayers,
  FiMonitor,
  FiPenTool,
  FiShoppingBag,
  FiShoppingCart,
} from 'react-icons/fi'

export type CatalogService = {
  id: string
  title: string
  description?: string
  image_url?: string
  emoji?: string
  gradient_color?: string
  contact?: string
}

export const SHOPIFY_STORE_SERVICE: CatalogService = {
  id: 'shopify-store-design',
  title: 'Shopify Store Design',
  description:
    'Custom Shopify themes, product pages, checkout UX, and conversion-focused stores built to sell.',
}

export const FIGMA_DESIGN_SERVICE: CatalogService = {
  id: 'figma-design',
  title: 'Figma Design',
  description:
    'Professional UI/UX in Figma — wireframes, mockups, prototypes, and design systems for web and mobile.',
}

export const CANVA_DESIGN_SERVICE: CatalogService = {
  id: 'canva-design',
  title: 'Canva Design',
  description:
    'Eye-catching social posts, banners, thumbnails, and brand visuals designed in Canva for your business.',
}

export const WORDPRESS_SERVICE: CatalogService = {
  id: 'wordpress-websites',
  title: 'WordPress Websites',
  description:
    'Custom WordPress sites with modern themes, plugins, fast performance, and easy content management.',
}

/** Always show these on the home page when missing from CMS/API */
const HOME_CATALOG_EXTRAS: CatalogService[] = [
  SHOPIFY_STORE_SERVICE,
  {
    id: 's5',
    title: 'Shop/Business Software',
    description:
      'Custom software for shops and businesses: POS, inventory, billing, users, and reports.',
  },
  FIGMA_DESIGN_SERVICE,
  CANVA_DESIGN_SERVICE,
  WORDPRESS_SERVICE,
]

export const FALLBACK_CATALOG_SERVICES: CatalogService[] = [
  {
    id: 's1',
    title: 'MERN Stack Websites',
    description:
      'Custom full-stack websites (React, Node.js, Express, MongoDB) with modern UI and secure auth.',
  },
  SHOPIFY_STORE_SERVICE,
  {
    id: 's3',
    title: 'Online MERN Courses',
    description: 'Live online classes with recordings, assignments, and support community.',
  },
  {
    id: 's4',
    title: 'Portfolio Building',
    description:
      'Personal portfolio websites and GitHub/readme setup to showcase your MERN skills.',
  },
  {
    id: 's5',
    title: 'Shop/Business Software',
    description:
      'Custom software for shops and businesses: POS, inventory, billing, users, and reports.',
  },
  FIGMA_DESIGN_SERVICE,
  CANVA_DESIGN_SERVICE,
  WORDPRESS_SERVICE,
]

export type ServiceThemeVariant =
  | 'websites'
  | 'shopify'
  | 'online'
  | 'portfolio'
  | 'business'
  | 'figma'
  | 'canva'
  | 'wordpress'
  | 'default'

export type ServiceTheme = {
  variant: ServiceThemeVariant
  category: string
  Icon: IconType
}

export type EnrichedCatalogService = CatalogService & {
  highlights: string[]
}

const SERVICE_COPY: Record<
  ServiceThemeVariant,
  { description: string; highlights: [string, string] }
> = {
  websites: {
    description:
      'Production-ready MERN apps with modern UI, secure authentication, and scalable APIs.',
    highlights: ['React & Node.js', 'Admin + Auth'],
  },
  shopify: {
    description:
      'Custom Shopify themes, product pages, checkout UX, and stores built to convert.',
    highlights: ['Theme Design', 'Checkout UX'],
  },
  online: {
    description:
      'Live MERN training with real projects, mentorship, and job-ready portfolio outcomes.',
    highlights: ['Live Classes', 'Projects'],
  },
  portfolio: {
    description:
      'Personal portfolio sites and GitHub presence that stand out to recruiters.',
    highlights: ['Personal Brand', 'Resume Ready'],
  },
  business: {
    description:
      'POS, inventory, billing, and custom business software tailored to your shop.',
    highlights: ['POS & Billing', 'Reports'],
  },
  figma: {
    description:
      'UI/UX mockups, wireframes, prototypes, and design systems built in Figma.',
    highlights: ['UI Mockups', 'Prototypes'],
  },
  canva: {
    description:
      'Social posts, banners, thumbnails, and brand visuals designed in Canva.',
    highlights: ['Social Media', 'Brand Kits'],
  },
  wordpress: {
    description:
      'Custom WordPress websites with themes, plugins, speed optimization, and SEO.',
    highlights: ['Themes', 'SEO Ready'],
  },
  default: {
    description: 'End-to-end software solutions designed around your business goals.',
    highlights: ['Custom Build', 'Full Support'],
  },
}

export function normalizeServiceTitle(title: string): string {
  return title.replace(/protfolio/gi, 'Portfolio').trim()
}

/** Groups similar CMS/API titles so we do not duplicate cards (e.g. "MERN Websites" vs "MERN Stack Websites"). */
export function getServiceCatalogKey(title: string): string {
  const t = normalizeServiceTitle(title).toLowerCase()

  if (t.includes('figma')) return 'figma-design'
  if (t.includes('canva')) return 'canva-design'
  if (t.includes('wordpress') || t.includes('word press')) return 'wordpress'
  if (t.includes('shopify') || t.includes('ecommerce') || t.includes('e-commerce')) return 'shopify'
  if (t.includes('online') && t.includes('course')) return 'online-courses'
  if (t.includes('physical') && t.includes('course')) return 'physical-courses'
  if (t.includes('portfolio') || t.includes('protfolio')) return 'portfolio'
  if ((t.includes('shop') || t.includes('business') || t.includes('pos')) && !t.includes('shopify')) {
    return 'business-software'
  }
  if (
    t.includes('mern') ||
    t.includes('website') ||
    t.includes('web app') ||
    t.includes('full-stack')
  ) {
    return 'mern-websites'
  }

  return t
}

function hasCatalogService(list: EnrichedCatalogService[], title: string): boolean {
  const key = getServiceCatalogKey(title)
  return list.some((service) => getServiceCatalogKey(service.title) === key)
}

function mergeHomeCatalogExtras(list: EnrichedCatalogService[]): EnrichedCatalogService[] {
  let merged = [...list]

  for (const extra of HOME_CATALOG_EXTRAS) {
    if (!hasCatalogService(merged, extra.title)) {
      merged = [...merged, enrichCatalogService(extra)]
    }
  }

  return merged
}

export function mapApiServiceToCatalog(service: {
  id?: number | string
  title?: string
  description?: string | null
  image_url?: string | null
  emoji?: string | null
  gradient_color?: string | null
  contact?: string | null
}): CatalogService {
  return {
    id: String(service.id ?? service.title ?? 'service'),
    title: normalizeServiceTitle(service.title ?? 'Service'),
    description: service.description?.trim() || undefined,
    image_url: service.image_url?.trim() || undefined,
    emoji: service.emoji?.trim() || undefined,
    gradient_color: service.gradient_color?.trim() || undefined,
    contact: service.contact?.trim() || undefined,
  }
}

export function enrichCatalogService(service: CatalogService): EnrichedCatalogService {
  const title = normalizeServiceTitle(service.title)
  const theme = getServiceTheme(title)
  const copy = SERVICE_COPY[theme.variant]

  return {
    ...service,
    title,
    description: service.description?.trim() || copy.description,
    highlights: [...copy.highlights],
  }
}

export function prepareCatalogServices(raw: CatalogService[]): EnrichedCatalogService[] {
  const list = raw
    .filter((service) => service.title && !isPhysicalService(service.title))
    .map((service) => enrichCatalogService(service))

  return mergeHomeCatalogExtras(list)
}

export function isPhysicalService(title: string): boolean {
  return /\bphysical\b/i.test(title)
}

export function getServiceTheme(title: string): ServiceTheme {
  const t = title.toLowerCase()

  if (t.includes('figma')) {
    return { variant: 'figma', category: 'Design', Icon: FiPenTool }
  }
  if (t.includes('canva')) {
    return { variant: 'canva', category: 'Design', Icon: FiImage }
  }
  if (t.includes('wordpress') || t.includes('word press')) {
    return { variant: 'wordpress', category: 'CMS', Icon: FiGlobe }
  }
  if (t.includes('shopify') || t.includes('ecommerce') || t.includes('e-commerce')) {
    return { variant: 'shopify', category: 'E-Commerce', Icon: FiShoppingCart }
  }
  if (t.includes('online') || (t.includes('course') && !t.includes('physical'))) {
    return { variant: 'online', category: 'Training', Icon: FiMonitor }
  }
  if (t.includes('portfolio') || t.includes('protfolio')) {
    return { variant: 'portfolio', category: 'Career', Icon: FiLayers }
  }
  if (t.includes('shop') || t.includes('business') || t.includes('pos')) {
    return { variant: 'business', category: 'Business', Icon: FiShoppingBag }
  }
  if (
    t.includes('website') ||
    t.includes('mern') ||
    t.includes('web app') ||
    t.includes('full-stack')
  ) {
    return { variant: 'websites', category: 'Development', Icon: FiCode }
  }
  if (t.includes('devops') || t.includes('cloud') || t.includes('deploy')) {
    return { variant: 'default', category: 'DevOps', Icon: FiCloud }
  }
  if (t.includes('client') || t.includes('consult')) {
    return { variant: 'default', category: 'Consulting', Icon: FiBriefcase }
  }

  return { variant: 'default', category: 'Service', Icon: FiCode }
}
