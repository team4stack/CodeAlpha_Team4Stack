# Import Path Fixes Needed

## Files That Need Updates

### 1. Environment Variables
Find and replace:
- `import.meta.env.VITE_SUPABASE_URL` → `process.env.NEXT_PUBLIC_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY` → `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
- `import.meta.env.DEV` → `process.env.NODE_ENV === 'development'`
- `import.meta.env.PROD` → `process.env.NODE_ENV === 'production'`

### 2. Supabase Client Imports
Find and replace:
- `from '../utils/supabaseClient'`
- `from '../../utils/supabaseClient'`
- `from '../../../utils/supabaseClient'`
- `from '../../../../utils/supabaseClient'`
- `from '@/utils/supabaseClient'` (if exists)

All should become: `from '@/lib/supabase/client'`

### 3. Context Imports
Find and replace:
- `from '../context/ThemeContext'` → `from '@/contexts/ThemeContext'`
- `from '../context/AuthContext'` → `from '@/contexts/AuthContext'`
- `from '../../context/ThemeContext'` → `from '@/contexts/ThemeContext'`
- `from '../../context/AuthContext'` → `from '@/contexts/AuthContext'`

### 4. Utils Imports
Find and replace:
- `from '../utils/...'` → `from '@/lib/utils/...'`
- `from '../../utils/...'` → `from '@/lib/utils/...'`

### 5. Add 'use client' Directive
Add `'use client'` at the top of files that:
- Use React hooks (useState, useEffect, etc.)
- Use event handlers
- Use browser APIs (window, document, localStorage, etc.)
- Use Context (useTheme, useAuth, etc.)
- Are interactive components

### 6. React Router → Next.js Navigation
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation()` → `usePathname()` from `next/navigation`
- `useParams()` → Get from page props: `{ params }: { params: { id: string } }`
- `<Link to="/path">` → `<Link href="/path">` from `next/link`

---

## Priority Files to Fix First

1. `lib/utils/supabaseClient.ts` - Update env vars
2. All components using supabaseClient
3. All components using contexts
4. All page components (add 'use client' if needed)
5. Navigation components (update React Router → Next.js)
