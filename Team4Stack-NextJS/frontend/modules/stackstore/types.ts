export const STACK_PLATFORMS = [
  'MERN Stack',
  'Next.js',
  'React',
  'Vue.js',
  'Angular',
  'Django',
  'Laravel',
  'Flutter',
  'React Native',
  'Node.js API',
  'Other',
] as const

export type StackPlatform = (typeof STACK_PLATFORMS)[number]

export type StoreProduct = {
  id: string
  name: string
  description?: string
  price?: number
  image_url?: string
  category_id?: string
  platform?: string
  github_url?: string
  demo_url?: string
  live_url?: string
  team4stack_verified?: boolean
  verification_status?: string
}

export type SellerApplication = {
  id: number
  status: 'pending' | 'approved' | 'rejected'
  store_name: string
  primary_platform: string
  created_at?: string
}

export type StoreOrder = {
  id: string
  product_id?: string
  status: string
  escrow_status?: string
  payment_status?: string
  total_amount?: number
  created_at?: string
}
