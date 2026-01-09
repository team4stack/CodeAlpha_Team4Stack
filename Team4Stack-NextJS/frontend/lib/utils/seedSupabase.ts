import { supabase } from './supabaseClient'

type SeedResult = { table: string; inserted: number; skipped: boolean; error?: string }

async function seedIfEmpty(table: string, rows: any[]): Promise<SeedResult> {
  try {
    const { count, error: countErr } = await supabase.from(table).select('id', { count: 'exact', head: true })
    if (countErr) return { table, inserted: 0, skipped: true, error: countErr.message }
    if ((count || 0) > 0) return { table, inserted: 0, skipped: true }
    if (rows.length === 0) return { table, inserted: 0, skipped: true }
    const { error } = await supabase.from(table).insert(rows)
    if (error) return { table, inserted: 0, skipped: false, error: error.message }
    return { table, inserted: rows.length, skipped: false }
  } catch (e: any) {
    return { table, inserted: 0, skipped: false, error: String(e?.message || e) }
  }
}

export async function seedDemoData(): Promise<SeedResult[]> {
  const results: SeedResult[] = []

  // Projects: store title/description and a YouTube thumbnail as image_url
  const projects = [
    { title: 'YouTube Project 1', description: 'Demo project linked to YouTube', image_url: 'https://img.youtube.com/vi/7czFAU9QNPY/mqdefault.jpg' },
    { title: 'YouTube Project 2', description: 'Another demo entry', image_url: 'https://img.youtube.com/vi/46HxQUzM5Rg/mqdefault.jpg' },
    { title: 'YouTube Project 3', description: 'Sample showcase', image_url: 'https://img.youtube.com/vi/6i1zIT5fvIY/mqdefault.jpg' },
    { title: 'YouTube Project 4', description: 'Showcase', image_url: 'https://img.youtube.com/vi/1JPg6eso4Ag/mqdefault.jpg' },
    { title: 'YouTube Project 5', description: 'Showcase', image_url: 'https://img.youtube.com/vi/U6x56Zs2duw/mqdefault.jpg' },
    { title: 'YouTube Project 6', description: 'Showcase', image_url: 'https://img.youtube.com/vi/7BTsepZ9xp8/mqdefault.jpg' },
    { title: 'YouTube Project 7', description: 'Showcase', image_url: 'https://img.youtube.com/vi/tTCam8KGVRE/mqdefault.jpg' },
    { title: 'YouTube Project 8', description: 'Showcase', image_url: 'https://img.youtube.com/vi/Tkp3FDgOueM/mqdefault.jpg' },
    { title: 'YouTube Project 9', description: 'Showcase', image_url: 'https://img.youtube.com/vi/-u3vE84Wo_U/mqdefault.jpg' }
  ]
  results.push(await seedIfEmpty('projects', projects))

  // Services
  const services = [
    // detailed cards from Services.tsx
    { title: 'MERN Stack Websites', description: 'Custom full‑stack websites (React, Node.js, Express, MongoDB) with modern UI and secure auth.', image_url: '' },
    { title: 'Physical MERN Courses', description: 'Hands‑on classes at WE Connect with real projects, code reviews, and mentorship.', image_url: '' },
    { title: 'Online MERN Courses', description: 'Live online classes with recordings, assignments, and support community.', image_url: '' },
    { title: 'Portfolio Building', description: 'Personal portfolio websites and GitHub/readme setup to showcase your MERN skills.', image_url: '' },
    { title: 'Shop/Business Software', description: 'Custom software for shops and businesses: POS, inventory, billing, users, and reports.', image_url: '' },
    // grid fallback items
    { title: 'UI/UX Design', description: '', image_url: '' },
    { title: 'QA & Testing', description: '', image_url: '' },
    { title: 'DevOps & Deployment', description: '', image_url: '' }
  ]
  results.push(await seedIfEmpty('services', services))

  // Courses
  const courses = [
    { title: 'Physical Training (WE Connect)', description: 'Hands-on MERN stack training with real projects at WE Connect Software House.', image_url: '' },
    { title: 'Online Training', description: 'Live online MERN stack course with recordings and support community.', image_url: '' }
  ]
  results.push(await seedIfEmpty('courses', courses))

  // Reviews (if table exists)
  try {
    const { count: hasReviews } = await supabase.from('reviews').select('id', { count: 'exact', head: true })
    if ((hasReviews || 0) === 0) {
      const reviewRows = [
        { title: 'Great Work', description: 'Professional and fast delivery', image_url: '' },
        { title: 'Highly Recommended', description: 'Excellent MERN expertise', image_url: '' }
      ]
      results.push(await seedIfEmpty('reviews', reviewRows))
    } else {
      results.push({ table: 'reviews', inserted: 0, skipped: true })
    }
  } catch {
    // If reviews table not present, skip silently
  }

  return results
}

type UpsertItem = { title: string; description?: string; image_url?: string }

async function upsertByTitle(table: string, items: UpsertItem[]): Promise<SeedResult> {
  let inserted = 0
  try {
    for (const item of items) {
      const { data: existing } = await supabase.from(table).select('id').eq('title', item.title).maybeSingle()
      if (existing?.id) {
        await supabase.from(table).update(item).eq('id', existing.id)
      } else {
        const { error } = await supabase.from(table).insert(item)
        if (!error) inserted += 1
      }
    }
    return { table, inserted, skipped: false }
  } catch (e: any) {
    return { table, inserted, skipped: false, error: String(e?.message || e) }
  }
}

export async function migrateWebsiteData(): Promise<SeedResult[]> {
  const results: SeedResult[] = []

  // Services from website
  const services: UpsertItem[] = [
    { title: 'MERN Stack Websites', description: 'Custom full‑stack websites (React, Node.js, Express, MongoDB) with modern UI and secure auth.', image_url: '' },
    { title: 'Physical MERN Courses', description: 'Hands‑on classes at WE Connect with real projects, code reviews, and mentorship.', image_url: '' },
    { title: 'Online MERN Courses', description: 'Live online classes with recordings, assignments, and support community.', image_url: '' },
    { title: 'Portfolio Building', description: 'Personal portfolio websites and GitHub/readme setup to showcase your MERN skills.', image_url: '' },
    { title: 'Shop/Business Software', description: 'Custom software for shops and businesses: POS, inventory, billing, users, and reports.', image_url: '' },
    { title: 'UI/UX Design', description: '', image_url: '' },
    { title: 'QA & Testing', description: '', image_url: '' },
    { title: 'DevOps & Deployment', description: '', image_url: '' }
  ]
  results.push(await upsertByTitle('services', services))

  // Courses from website
  const courses: UpsertItem[] = [
    { title: 'Physical Training (WE Connect)', description: 'Hands-on MERN stack training with real projects at WE Connect Software House.', image_url: '' },
    { title: 'Online Training', description: 'Live online MERN stack course with recordings and support community.', image_url: '' }
  ]
  results.push(await upsertByTitle('courses', courses))

  // Projects based on YouTube IDs used across the site (thumbnail links only)
  const yt = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`
  const projects: UpsertItem[] = [
    { title: 'YouTube Project 1', description: 'Demo project linked to YouTube', image_url: yt('7czFAU9QNPY') },
    { title: 'YouTube Project 2', description: 'Another demo entry', image_url: yt('46HxQUzM5Rg') },
    { title: 'YouTube Project 3', description: 'Sample showcase', image_url: yt('6i1zIT5fvIY') },
    { title: 'YouTube Project 4', description: 'Showcase', image_url: yt('1JPg6eso4Ag') },
    { title: 'YouTube Project 5', description: 'Showcase', image_url: yt('U6x56Zs2duw') },
    { title: 'YouTube Project 6', description: 'Showcase', image_url: yt('7BTsepZ9xp8') },
    { title: 'YouTube Project 7', description: 'Showcase', image_url: yt('tTCam8KGVRE') },
    { title: 'YouTube Project 8', description: 'Showcase', image_url: yt('Tkp3FDgOueM') },
    { title: 'YouTube Project 9', description: 'Showcase', image_url: yt('-u3vE84Wo_U') }
  ]
  results.push(await upsertByTitle('projects', projects))

  return results
}

export async function migrateMentorProfile(): Promise<SeedResult> {
  // Default mentor profile sourced from existing site content
  const mentor = {
    name: 'M. Abdullah Wali',
    role: 'MERN Stack Expert & Mentor',
    description:
      'Leading expert in MERN Stack Development with 5+ years of hands-on experience in building scalable and high-performance web applications. Founder of WE Connect, conducting physical MERN courses and guiding students and professionals with real-world projects and mentorship.',
    primary_tag:
      'MongoDB, Express.js, React, Node.js, TypeScript, GraphQL, AWS, Docker',
    profile_image_url:
      'https://github.com/Sami3234/Images/blob/main/team4stack/sir_abdullah.jpg?raw=true',
    banner_image_url:
      'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600&auto=format&fit=crop',
    portfolio_url: 'https://github.com/AbdullahWali79',
    github_url: 'https://github.com/AbdullahWali79',
    order_index: 1,
    active: true
  }

  try {
    // upsert by name
    const { data: existing } = await supabase
      .from('mentor_profile')
      .select('id')
      .eq('name', mentor.name)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase
        .from('mentor_profile')
        .update(mentor)
        .eq('id', existing.id)
      return { table: 'mentor_profile', inserted: 0, skipped: false, error: error?.message }
    } else {
      const { error } = await supabase.from('mentor_profile').insert(mentor)
      return { table: 'mentor_profile', inserted: error ? 0 : 1, skipped: false, error: error?.message }
    }
  } catch (e: any) {
    return { table: 'mentor_profile', inserted: 0, skipped: false, error: String(e?.message || e) }
  }
}


