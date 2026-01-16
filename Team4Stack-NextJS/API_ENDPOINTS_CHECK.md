# API Endpoints Verification

## Backend Server Status
**IMPORTANT**: Make sure backend server is running on port 5000
```bash
cd backend
npm run dev
```

## Frontend API Configuration
Check `.env.local` in frontend:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## All API Endpoints

### ✅ Courses API
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:courseId/videos` - Get course videos
- `POST /api/courses/videos` - Create video
- `PUT /api/courses/videos/:id` - Update video
- `DELETE /api/courses/videos/:id` - Delete video
- `GET /api/courses/admissions` - Get admission forms
- `POST /api/courses/admissions` - Create admission form
- `PUT /api/courses/admissions/:id` - Update admission form
- `DELETE /api/courses/admissions/:id` - Delete admission form
- `GET /api/courses/progress` - Get all progress records (admin)
- `GET /api/courses/progress/:userId` - Get user progress
- `POST /api/courses/progress` - Update progress

### ✅ Landing API
- `GET /api/landing/reviews` - Get reviews
- `POST /api/landing/reviews` - Create review
- `PUT /api/landing/reviews/:id` - Update review
- `DELETE /api/landing/reviews/:id` - Delete review
- `GET /api/landing/projects` - Get projects
- `POST /api/landing/projects` - Create project
- `PUT /api/landing/projects/:id` - Update project
- `DELETE /api/landing/projects/:id` - Delete project
- `GET /api/landing/services` - Get services
- `POST /api/landing/services` - Create service
- `PUT /api/landing/services/:id` - Update service
- `DELETE /api/landing/services/:id` - Delete service
- `GET /api/landing/settings` - Get site settings
- `POST /api/landing/settings` - Upsert site setting
- `POST /api/landing/settings/bulk` - Bulk upsert site settings
- `DELETE /api/landing/settings` - Delete site settings (bulk)
- `GET /api/landing/support` - Get support requests
- `POST /api/landing/support` - Create support request
- `PUT /api/landing/support/:id` - Update support request

### ✅ StackStore API
- `GET /api/stackstore/products` - Get products
- `GET /api/stackstore/products/:id` - Get product by ID
- `POST /api/stackstore/products` - Create product
- `PUT /api/stackstore/products/:id` - Update product
- `DELETE /api/stackstore/products/:id` - Delete product
- `GET /api/stackstore/categories` - Get categories
- `POST /api/stackstore/categories` - Create category
- `PUT /api/stackstore/categories/:id` - Update category
- `DELETE /api/stackstore/categories/:id` - Delete category
- `GET /api/stackstore/orders` - Get orders
- `POST /api/stackstore/orders` - Create order
- `PUT /api/stackstore/orders/:id` - Update order
- `GET /api/stackstore/sellers` - Get sellers
- `POST /api/stackstore/sellers` - Create seller
- `PUT /api/stackstore/sellers/:id` - Update seller

### ✅ Team API
- `GET /api/team/members` - Get team members
- `POST /api/team/members` - Create team member
- `PUT /api/team/members/:id` - Update team member
- `DELETE /api/team/members/:id` - Delete team member
- `GET /api/team/mentors` - Get mentor profiles
- `POST /api/team/mentors` - Create mentor profile
- `PUT /api/team/mentors/:id` - Update mentor profile
- `DELETE /api/team/mentors/:id` - Delete mentor profile

### ✅ SuperAdmin API
- `GET /api/superadmin/admins` - Get admin users
- `GET /api/superadmin/admins/check/:email` - Check admin by email
- `POST /api/superadmin/admins` - Create admin user
- `PUT /api/superadmin/admins/:id` - Update admin user
- `DELETE /api/superadmin/admins/:id` - Delete admin user
- `POST /api/superadmin/admins/verify-password` - Verify admin password
- `GET /api/superadmin/audit` - Get audit logs
- `POST /api/superadmin/audit` - Create audit log
- `GET /api/superadmin/users` - Get users
- `GET /api/superadmin/users/:id` - Get user by ID
- `PUT /api/superadmin/users/:id` - Update user
- `POST /api/superadmin/users/:id/block` - Block user
- `POST /api/superadmin/users/:id/unblock` - Unblock user
- `DELETE /api/superadmin/users/:id` - Delete user

### ✅ Users API
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `PUT /api/users/:id` - Update user
- `POST /api/users/upsert` - Upsert user
- `GET /api/users/check-username` - Check username availability

## Common Issues

1. **"Failed to fetch"** - Backend server not running
   - Solution: Start backend with `cd backend && npm run dev`

2. **CORS errors** - Frontend URL not in CORS config
   - Solution: Check `FRONTEND_URL` in backend `.env`

3. **404 errors** - Route not found
   - Solution: Check route order in backend routes file

4. **500 errors** - Backend server error
   - Solution: Check backend console logs for error details
