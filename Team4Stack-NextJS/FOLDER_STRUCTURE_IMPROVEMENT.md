# Folder Structure Improvement Plan

## Current Issues
- **Frontend**: Deep nesting like `modules/courses/admin/pages/` (4 levels)
- **Frontend**: Duplicate paths like `lib/auth/` and `lib/shared/auth/`
- **Backend**: Good structure but can be optimized

## Proposed Structure

### Frontend Structure (Flattened & Organized)

```
frontend/
├── app/                          # Next.js App Router
│   ├── (main)/                  # Main routes
│   ├── admin*/                  # Admin routes
│   └── api/                     # API routes (if needed)
│
├── features/                     # Feature-based modules (FLATTER)
│   ├── courses/
│   │   ├── components/          # Course-specific components
│   │   ├── pages/              # Course pages (public)
│   │   ├── admin/              # Admin pages (flat, no nested pages/)
│   │   │   ├── ApplicationsPage.tsx
│   │   │   ├── CoursesAdminDashboard.tsx
│   │   │   ├── StudentProgressPage.tsx
│   │   │   └── VideosManagementPage.tsx
│   │   ├── api/                # Course API calls
│   │   └── types.ts            # Course types
│   │
│   ├── landing/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── admin/              # Flat admin pages
│   │   ├── sections/           # Landing sections
│   │   └── types.ts
│   │
│   ├── stackstore/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── admin/              # Flat admin pages
│   │   └── types.ts
│   │
│   ├── superadmin/
│   │   ├── components/
│   │   ├── pages/              # Flat pages
│   │   └── types.ts
│   │
│   └── team/
│       ├── components/
│       ├── pages/
│       ├── admin/              # Flat admin pages
│       └── types.ts
│
├── components/                   # Shared components
│   ├── ui/                      # Basic UI components
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   └── admin/                   # Admin shared components
│
├── lib/                         # Utilities & Config
│   ├── api/                     # API clients
│   ├── auth/                    # Auth utilities (consolidated)
│   ├── supabase/                # Supabase config
│   └── utils/                   # General utilities
│
├── hooks/                       # Custom React hooks
├── contexts/                    # React contexts
├── types/                       # Global TypeScript types
└── public/                      # Static assets
```

### Backend Structure (Optimized)

```
backend/
├── src/
│   ├── api/                     # API routes (organized by feature)
│   │   ├── courses/
│   │   │   ├── routes.ts
│   │   │   ├── controller.ts
│   │   │   └── service.ts
│   │   ├── landing/
│   │   ├── stackstore/
│   │   ├── superadmin/
│   │   └── team/
│   │
│   ├── services/                # Business logic (if shared)
│   ├── models/                  # Data models/types
│   ├── middleware/              # Express middleware
│   ├── config/                 # Configuration
│   │   ├── database.ts
│   │   ├── supabase.ts
│   │   └── env.ts
│   │
│   └── server.ts                # Entry point
│
├── tests/                       # Tests
└── package.json
```

## Migration Steps

1. **Flatten admin pages**: Move `modules/*/admin/pages/*.tsx` → `features/*/admin/*.tsx`
2. **Consolidate lib/auth**: Merge `lib/auth/` and `lib/shared/auth/`
3. **Rename modules → features**: More semantic naming
4. **Update imports**: Update all import paths
5. **Backend optimization**: Keep current structure (already good)

## Benefits

✅ **Less depth**: Max 3-4 levels instead of 5-6
✅ **Clearer organization**: Feature-based, easier to find files
✅ **Better scalability**: Easy to add new features
✅ **Professional**: Industry-standard structure
