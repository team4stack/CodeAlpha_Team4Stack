# Frontend API Migration Report

## 🔍 Analysis Complete

Frontend me **direct Supabase calls** ki complete list aur unhe API se replace karne ka guide.

## ⚠️ Important Note

**Supabase Auth** (login, signup, session) **direct use karna hai** - yeh backend API se nahi hoga kyunki Supabase Auth client-side hi kaam karta hai.

**Sirf Database operations** ko backend API se replace karna hai.

---

## 📋 Files That Need Updates

### 1. **Courses Module** (High Priority)

#### Files to Update:
- ✅ `frontend/modules/courses/pages/CoursesPage.tsx`
  - Line 63-69: `supabase.from('courses')` → `coursesApi.getAllCourses()`
  - Line 89-93: `supabase.from('admission_form')` → `coursesApi.getAdmissionForms()`

- ✅ `frontend/modules/courses/pages/CourseViewPage.tsx`
  - Check for `supabase.from('courses')` and `supabase.from('videos')`
  - Replace with `coursesApi.getCourseById()` and `coursesApi.getCourseVideos()`

- ✅ `frontend/modules/courses/pages/StudentPage.tsx`
  - Check for `supabase.from('progress_records')`
  - Replace with `coursesApi.getUserProgress()` and `coursesApi.updateProgress()`

- ✅ `frontend/modules/courses/admin/pages/ApplicationsPage.tsx`
  - Line 49-62: `supabase.from('admission_form')` → `coursesApi.getAdmissionForms()`
  - Line 69-73: `supabase.from('users')` → `usersApi.getUserByEmail()`
  - All update operations → `coursesApi.updateAdmissionForm()`

- ✅ `frontend/modules/courses/admin/pages/VideosManagementPage.tsx`
  - `supabase.from('videos')` → `coursesApi.getCourseVideos()`, `coursesApi.createVideo()`, etc.

- ✅ `frontend/modules/courses/admin/pages/StudentProgressPage.tsx`
  - `supabase.from('progress_records')` → `coursesApi.getUserProgress()`

- ✅ `frontend/modules/courses/admin/pages/CoursesSettingsPage.tsx`
  - `supabase.from('courses')` → `coursesApi.getAllCourses()`, `coursesApi.updateCourse()`

- ✅ `frontend/modules/courses/sections/AdmissionForm.tsx`
  - `supabase.from('admission_form').insert()` → `coursesApi.createAdmissionForm()`

---

### 2. **Landing Module** (High Priority)

#### Files to Update:
- ✅ `frontend/modules/landing/admin/pages/ContentPage.tsx`
  - Line 224-253: Multiple `supabase.from()` calls
  - Replace based on table:
    - `reviews` → `landingApi.getReviews()`
    - `projects` → `landingApi.getProjects()`
    - `services` → `landingApi.getServices()`
    - `site_settings` → `landingApi.getSiteSettings()`
    - `support_requests` → `landingApi.getSupportRequests()`
    - `team_members` → `teamApi.getTeamMembers()`
    - `mentor_profile` → `teamApi.getMentorProfiles()`
    - `courses` → `coursesApi.getAllCourses()`

- ✅ `frontend/modules/landing/admin/pages/SettingsPage.tsx`
  - `supabase.from('site_settings')` → `landingApi.getSiteSettings()`, `landingApi.upsertSiteSetting()`

- ✅ `frontend/modules/landing/admin/pages/DashboardPage.tsx`
  - All `supabase.from()` calls → respective API calls

- ✅ `frontend/modules/landing/admin/pages/UsersPage.tsx`
  - `supabase.from('users')` → `superadminApi.getUsers()`

- ✅ `frontend/modules/landing/admin/pages/FormsPage.tsx`
  - `supabase.from('support_requests')` → `landingApi.getSupportRequests()`

- ✅ `frontend/modules/landing/sections/projects/Projects.tsx`
  - Line 58-62: `supabase.from('projects')` → `landingApi.getProjects()`

- ✅ `frontend/modules/landing/sections/reviews/Reviews.tsx`
  - `supabase.from('reviews')` → `landingApi.getReviews({ status: 'approved' })`

- ✅ `frontend/modules/landing/sections/services/Services.tsx`
  - `supabase.from('services')` → `landingApi.getServices()`

- ✅ `frontend/modules/landing/sections/hero/Hero.tsx`
  - `supabase.from('site_settings')` → `landingApi.getSiteSettings()`

- ✅ `frontend/components/Projects.tsx`
  - Line 58-62: `supabase.from('projects')` → `landingApi.getProjects()`

- ✅ `frontend/components/Reviews.tsx`
  - `supabase.from('reviews')` → `landingApi.getReviews({ status: 'approved' })`

- ✅ `frontend/components/Services.tsx`
  - `supabase.from('services')` → `landingApi.getServices()`

---

### 3. **StackStore Module** (High Priority)

#### Files to Update:
- ✅ `frontend/modules/stackstore/admin/pages/ProductsManagementPage.tsx`
  - `supabase.from('products')` → `stackstoreApi.getProducts()`
  - `supabase.from('categories')` → `stackstoreApi.getCategories()`
  - All CRUD operations → respective API calls

- ✅ `frontend/modules/stackstore/admin/pages/OrdersManagementPage.tsx`
  - Line 55-83: `supabase.from('orders')` → `stackstoreApi.getOrders()`
  - Line 88-91: `supabase.from('users')` → `usersApi.getUserById()` or batch call
  - Line 105-107: `supabase.from('products')` → `stackstoreApi.getProductById()`

- ✅ `frontend/modules/stackstore/admin/pages/StackStoreAdminDashboard.tsx`
  - All `supabase.from()` calls → respective API calls

---

### 4. **Team Module** (Medium Priority)

#### Files to Update:
- ✅ `frontend/modules/team/admin/pages/TeamAdminDashboard.tsx`
  - `supabase.from('team_members')` → `teamApi.getTeamMembers()`
  - `supabase.from('mentor_profile')` → `teamApi.getMentorProfiles()`

- ✅ `frontend/modules/team/pages/TeamPage.tsx`
  - `supabase.from('team_members')` → `teamApi.getTeamMembers()`

---

### 5. **SuperAdmin Module** (High Priority)

#### Files to Update:
- ✅ `frontend/modules/superadmin/pages/SuperAdminDashboard.tsx`
  - `supabase.from('users')` → `superadminApi.getUsers()`
  - `supabase.from('admin_users')` → `superadminApi.getAdminUsers()`
  - `supabase.from('audit_logs')` → `superadminApi.getAuditLogs()`

- ✅ `frontend/modules/superadmin/pages/UsersManagementPage.tsx`
  - All `supabase.from('users')` → `superadminApi.getUsers()`
  - Update operations → `superadminApi.updateUser()`
  - Block/unblock → `superadminApi.blockUser()`, `superadminApi.unblockUser()`

- ✅ `frontend/modules/superadmin/pages/AuditLogsPage.tsx`
  - `supabase.from('audit_logs')` → `superadminApi.getAuditLogs()`

- ✅ `frontend/modules/superadmin/pages/RoleManagementPage.tsx`
  - `supabase.from('admin_users')` → `superadminApi.getAdminUsers()`

---

### 6. **User Management** (Medium Priority)

#### Files to Update:
- ✅ `frontend/components/UserSettingsModal.tsx`
  - `supabase.from('users')` → `usersApi.updateUser()`
  - `supabase.from('users').select().eq('username')` → `usersApi.checkUsernameAvailability()`

- ✅ `frontend/modals/UserSettingsModal.tsx`
  - Same as above

- ✅ `frontend/components/modals/UserSettingsModal.tsx`
  - Same as above

---

### 7. **Auth Context** (Special Case - Keep Supabase Auth)

#### Files to Check:
- ⚠️ `frontend/contexts/AuthContext.tsx`
  - **KEEP:** `supabase.auth.getSession()` - Auth operations
  - **REPLACE:** `supabase.from('users')` (Line 96-100) → `usersApi.getUserById()` or `usersApi.getUserByEmail()`
  - **REPLACE:** `supabase.from('users').upsert()` (Line 79) → `usersApi.upsertUser()`
  - **REPLACE:** `supabase.from('admin_users')` (Line 144-148) → `superadminApi.getAdminUsers()` with filter

- ⚠️ `frontend/context/AuthContext.tsx` (duplicate - same as above)

- ⚠️ `frontend/lib/auth/AuthContext.tsx` (duplicate - same as above)

**Note:** Auth operations (login, signup, session) Supabase se hi rahenge. Sirf user profile data API se aayega.

---

## 🔄 Migration Pattern

### Before (Direct Supabase):
```typescript
import { supabase } from '@/lib/supabase/client';

// Get data
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('active', true);

// Insert data
const { data, error } = await supabase
  .from('courses')
  .insert(newCourse);

// Update data
const { data, error } = await supabase
  .from('courses')
  .update(updates)
  .eq('id', id);
```

### After (API Call):
```typescript
import { coursesApi } from '@/lib/api';

// Get data
const { data, error } = await coursesApi.getAllCourses();

// Insert data
const { data, error } = await coursesApi.createCourse(newCourse);

// Update data
const { data, error } = await coursesApi.updateCourse(id, updates);
```

---

## ✅ API Wrappers Created

All API wrappers are ready in `frontend/lib/api/`:
- ✅ `client.ts` - Base API client
- ✅ `courses.ts` - Courses API
- ✅ `landing.ts` - Landing API
- ✅ `stackstore.ts` - StackStore API
- ✅ `team.ts` - Team API
- ✅ `superadmin.ts` - SuperAdmin API
- ✅ `users.ts` - Users API
- ✅ `index.ts` - All exports

---

## 📊 Summary

### Total Files to Update: ~30-35 files

### Priority:
1. **High Priority:** Courses, Landing, StackStore, SuperAdmin modules
2. **Medium Priority:** Team module, User settings
3. **Low Priority:** Components (can be done later)

### Estimated Time:
- High priority files: 2-3 hours
- All files: 4-5 hours

---

## 🚀 Next Steps

1. Start with Courses module (most critical)
2. Then Landing module
3. Then StackStore and SuperAdmin
4. Finally Team and User settings

### Testing Checklist:
- [ ] Test all GET operations
- [ ] Test all POST operations
- [ ] Test all PUT operations
- [ ] Test all DELETE operations
- [ ] Test error handling
- [ ] Test loading states
- [ ] Verify data matches Supabase

---

## ⚠️ Important Reminders

1. **Auth operations** (login, signup, session) **Supabase se hi rahenge**
2. **Only database queries** ko API se replace karna hai
3. **Error handling** properly implement karna hai
4. **Loading states** maintain karna hai
5. **Type safety** check karna hai

---

**Status:** Ready to migrate! All API wrappers are created. Start updating files one by one.
