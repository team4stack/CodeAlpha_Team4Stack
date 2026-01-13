# Direct Supabase Calls Summary

## 🔍 Complete Analysis

Frontend me **direct Supabase database calls** ki complete list.

---

## 📊 Statistics

- **Total files with direct Supabase calls:** ~88 files
- **Files with `supabase.from()`:** 19 files
- **Files with `supabase.auth`:** 10 files (✅ Keep these - Auth operations)
- **Files importing Supabase:** 88 files

---

## ✅ Files That Should Keep Supabase (Auth Only)

These files should **KEEP** Supabase for authentication:
- `frontend/contexts/AuthContext.tsx` - Auth operations (but replace user profile queries)
- `frontend/context/AuthContext.tsx` - Same as above
- `frontend/lib/auth/AuthContext.tsx` - Same as above
- `frontend/components/AuthModal.tsx` - Login/signup
- `frontend/lib/auth/components/AuthModal.tsx` - Login/signup
- `frontend/components/admin/AdminPasswordModal.tsx` - Admin auth
- All login pages in `frontend/lib/auth/pages/` - Auth operations

**Note:** Auth operations (login, signup, session management) Supabase se hi rahenge. Sirf database queries ko API se replace karna hai.

---

## ❌ Files That Need API Migration

### 1. Courses Module (9 files)
- `frontend/modules/courses/pages/CoursesPage.tsx` ⚠️
- `frontend/modules/courses/pages/CourseViewPage.tsx` ⚠️
- `frontend/modules/courses/pages/StudentPage.tsx` ⚠️
- `frontend/modules/courses/pages/CourseListPage.tsx` ⚠️
- `frontend/modules/courses/admin/pages/ApplicationsPage.tsx` ⚠️
- `frontend/modules/courses/admin/pages/VideosManagementPage.tsx` ⚠️
- `frontend/modules/courses/admin/pages/StudentProgressPage.tsx` ⚠️
- `frontend/modules/courses/admin/pages/CoursesSettingsPage.tsx` ⚠️
- `frontend/modules/courses/sections/AdmissionForm.tsx` ⚠️

### 2. Landing Module (11 files)
- `frontend/modules/landing/admin/pages/ContentPage.tsx` ⚠️ **CRITICAL**
- `frontend/modules/landing/admin/pages/SettingsPage.tsx` ⚠️
- `frontend/modules/landing/admin/pages/DashboardPage.tsx` ⚠️
- `frontend/modules/landing/admin/pages/UsersPage.tsx` ⚠️
- `frontend/modules/landing/admin/pages/FormsPage.tsx` ⚠️
- `frontend/modules/landing/sections/projects/Projects.tsx` ⚠️
- `frontend/modules/landing/sections/reviews/Reviews.tsx` ⚠️
- `frontend/modules/landing/sections/services/Services.tsx` ⚠️
- `frontend/modules/landing/sections/hero/Hero.tsx` ⚠️
- `frontend/components/Projects.tsx` ⚠️
- `frontend/components/Reviews.tsx` ⚠️
- `frontend/components/Services.tsx` ⚠️

### 3. StackStore Module (3 files)
- `frontend/modules/stackstore/admin/pages/ProductsManagementPage.tsx` ⚠️
- `frontend/modules/stackstore/admin/pages/OrdersManagementPage.tsx` ⚠️
- `frontend/modules/stackstore/admin/pages/StackStoreAdminDashboard.tsx` ⚠️

### 4. Team Module (2 files)
- `frontend/modules/team/admin/pages/TeamAdminDashboard.tsx` ⚠️
- `frontend/modules/team/pages/TeamPage.tsx` ⚠️

### 5. SuperAdmin Module (5 files)
- `frontend/modules/superadmin/pages/SuperAdminDashboard.tsx` ⚠️
- `frontend/modules/superadmin/pages/UsersManagementPage.tsx` ⚠️
- `frontend/modules/superadmin/pages/AuditLogsPage.tsx` ⚠️
- `frontend/modules/superadmin/pages/RoleManagementPage.tsx` ⚠️
- `frontend/modules/superadmin/pages/SystemSettingsPage.tsx` ⚠️

### 6. User Management (3 files)
- `frontend/components/UserSettingsModal.tsx` ⚠️
- `frontend/modals/UserSettingsModal.tsx` ⚠️
- `frontend/components/modals/UserSettingsModal.tsx` ⚠️

### 7. Auth Context (Partial Update)
- `frontend/contexts/AuthContext.tsx` ⚠️ (Keep auth, replace user queries)
- `frontend/context/AuthContext.tsx` ⚠️ (Same)
- `frontend/lib/auth/AuthContext.tsx` ⚠️ (Same)

---

## 🔄 Migration Priority

### Priority 1 (Critical - Do First):
1. ✅ Courses Module - Core functionality
2. ✅ Landing Admin Pages - Most used admin pages
3. ✅ StackStore Admin - E-commerce operations

### Priority 2 (Important):
4. ✅ SuperAdmin Module - User management
5. ✅ Landing Public Sections - Public pages

### Priority 3 (Can Wait):
6. ✅ Team Module - Less critical
7. ✅ User Settings Modals - User-facing but not critical

---

## 📝 Quick Reference: API Replacements

| Supabase Call | API Replacement |
|--------------|----------------|
| `supabase.from('courses')` | `coursesApi.getAllCourses()` |
| `supabase.from('courses').insert()` | `coursesApi.createCourse()` |
| `supabase.from('courses').update()` | `coursesApi.updateCourse()` |
| `supabase.from('admission_form')` | `coursesApi.getAdmissionForms()` |
| `supabase.from('videos')` | `coursesApi.getCourseVideos()` |
| `supabase.from('progress_records')` | `coursesApi.getUserProgress()` |
| `supabase.from('reviews')` | `landingApi.getReviews()` |
| `supabase.from('projects')` | `landingApi.getProjects()` |
| `supabase.from('services')` | `landingApi.getServices()` |
| `supabase.from('site_settings')` | `landingApi.getSiteSettings()` |
| `supabase.from('support_requests')` | `landingApi.getSupportRequests()` |
| `supabase.from('products')` | `stackstoreApi.getProducts()` |
| `supabase.from('orders')` | `stackstoreApi.getOrders()` |
| `supabase.from('categories')` | `stackstoreApi.getCategories()` |
| `supabase.from('team_members')` | `teamApi.getTeamMembers()` |
| `supabase.from('mentor_profile')` | `teamApi.getMentorProfiles()` |
| `supabase.from('users')` | `usersApi.getUserById()` or `superadminApi.getUsers()` |
| `supabase.from('admin_users')` | `superadminApi.getAdminUsers()` |
| `supabase.from('audit_logs')` | `superadminApi.getAuditLogs()` |

---

## ✅ API Wrappers Status

All API wrappers are **READY**:
- ✅ `frontend/lib/api/client.ts` - Base client
- ✅ `frontend/lib/api/courses.ts` - Courses API
- ✅ `frontend/lib/api/landing.ts` - Landing API
- ✅ `frontend/lib/api/stackstore.ts` - StackStore API
- ✅ `frontend/lib/api/team.ts` - Team API
- ✅ `frontend/lib/api/superadmin.ts` - SuperAdmin API
- ✅ `frontend/lib/api/users.ts` - Users API
- ✅ `frontend/lib/api/index.ts` - All exports

---

## 🚀 Next Steps

1. Read `FRONTEND_API_MIGRATION_REPORT.md` for detailed migration guide
2. Start with Priority 1 files
3. Test each module after migration
4. Update error handling
5. Verify all operations work correctly

---

**Status:** ✅ Analysis complete. Ready to start migration!
