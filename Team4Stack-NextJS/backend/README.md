# Team4Stack Backend API

Node.js + Express backend server for Team4Stack application.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (Supabase, etc.)
│   ├── modules/         # Feature modules
│   │   ├── courses/     # Courses API
│   │   ├── landing/     # Landing page API
│   │   ├── stackstore/  # StackStore API
│   │   ├── team/        # Team management API
│   │   └── superadmin/  # Super admin API
│   ├── shared/          # Shared modules
│   │   └── modules/
│   │       └── users/   # User management
│   └── server.ts        # Express server setup
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:courseId/videos` - Get course videos
- `POST /api/courses/videos` - Create video
- `GET /api/courses/admissions` - Get admission forms
- `POST /api/courses/admissions` - Create admission form
- `GET /api/courses/progress/:userId` - Get user progress

### Landing
- `GET /api/landing/reviews` - Get reviews
- `POST /api/landing/reviews` - Create review
- `GET /api/landing/projects` - Get projects
- `GET /api/landing/services` - Get services
- `GET /api/landing/settings` - Get site settings
- `GET /api/landing/support` - Get support requests

### StackStore
- `GET /api/stackstore/products` - Get products
- `POST /api/stackstore/products` - Create product
- `GET /api/stackstore/categories` - Get categories
- `GET /api/stackstore/orders` - Get orders

### Team
- `GET /api/team/members` - Get team members
- `GET /api/team/mentors` - Get mentor profiles

### Super Admin
- `GET /api/superadmin/users` - Get all users
- `GET /api/superadmin/admins` - Get admin users
- `GET /api/superadmin/audit` - Get audit logs

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

## 🔒 Security

- Helmet.js for security headers
- CORS configured for frontend origin
- Rate limiting (100 requests per 15 minutes)
- Environment variables for sensitive data

## 📝 Notes

- All database operations use Supabase Admin client (bypasses RLS)
- TypeScript for type safety
- Express.js for routing
- Error handling middleware included
