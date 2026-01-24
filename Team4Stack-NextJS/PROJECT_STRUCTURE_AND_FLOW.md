# Team4Stack Project - Complete Structure & Flow Documentation

## 📋 Project Overview

**Team4Stack** is a full-stack educational platform built with:
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (for users) + Custom Admin Auth (for admins)

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend       │         │   Backend API    │         │   Supabase       │
│   (Next.js)     │◄───────►│   (Express)      │◄───────►│   (PostgreSQL)   │
│   Port: 3000    │         │   Port: 5000     │         │   Database       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                            │
       │                            │
       └──────── Supabase Auth ─────┘
       (Client-side authentication)
```

### Data Flow

1. **User Authentication Flow**:
   - Frontend uses Supabase client directly for auth (sign in/sign up)
   - Session stored in localStorage (auto-login enabled)
   - User profile synced with `users` table in Supabase

2. **Admin Authentication Flow**:
   - Separate admin login system (NOT Supabase Auth)
   - Multi-layer security: Environment variables + Database check
   - Session stored in sessionStorage (24-hour expiry)
   - Role-based access control (super_admin, courses_admin, landing_admin, etc.)

3. **API Data Flow**:
   - Frontend → Backend API (Express) → Supabase (Admin Client)
   - All database operations go through backend (no direct frontend DB access)
   - Backend uses Supabase Admin client (bypasses RLS)

---

## 📁 Project Structure

### Root Directory

```
Team4Stack-NextJS/
├── frontend/              # Next.js application
├── backend/               # Express API server
├── README.md
├── API_ENDPOINTS_CHECK.md
├── BACKEND_START_GUIDE.md
└── [various docs]
```

---

## 🎨 Frontend Structure (`frontend/`)

### Core Directories

```
frontend/
├── app/                          # Next.js App Router (Routes)
│   ├── (main)/                   # Main public routes
│   │   ├── page.tsx              # Homepage
│   │   ├── courses/              # Course pages
│   │   ├── student/              # Student dashboard
│   │   ├── team/                 # Team page
│   │   ├── contact/              # Contact page
│   │   └── [legal pages]         # Privacy, Terms, etc.
│   │
│   ├── admincourset4s/           # Courses Admin Panel
│   ├── adminlandingt4s/          # Landing Admin Panel
│   ├── adminstackt4s/            # StackStore Admin Panel
│   ├── adminteamt4s/             # Team Admin Panel
│   ├── supadmin/                 # Super Admin Panel
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # Shared React Components
│   ├── admin/                    # Admin components
│   ├── modals/                   # Modal components
│   ├── navigation/               # Navbar components
│   ├── utilities/                # Utility components
│   └── [feature components]       # Services, Reviews, etc.
│
├── modules/                      # Feature Modules (Feature-based)
│   ├── courses/                  # Courses feature
│   │   ├── admin/                # Admin pages & components
│   │   ├── components/           # Course-specific components
│   │   ├── pages/                # Public course pages
│   │   └── sections/             # Course sections
│   │
│   ├── landing/                  # Landing page feature
│   │   ├── admin/                # Landing admin
│   │   ├── pages/                # Landing pages
│   │   └── sections/             # Landing sections (Hero, About, etc.)
│   │
│   ├── stackstore/               # StackStore (E-commerce)
│   │   ├── admin/                # StackStore admin
│   │   └── pages/                # StackStore pages
│   │
│   ├── superadmin/               # Super Admin feature
│   │   ├── components/           # Super admin components
│   │   └── pages/                # Super admin pages
│   │
│   └── team/                     # Team feature
│       ├── admin/                # Team admin
│       └── pages/                # Team pages
│
├── lib/                          # Libraries & Utilities
│   ├── api/                      # API client modules
│   │   ├── client.ts             # Base API client
│   │   ├── auth.ts               # Auth API
│   │   ├── courses.ts            # Courses API
│   │   ├── landing.ts            # Landing API
│   │   ├── stackstore.ts         # StackStore API
│   │   ├── superadmin.ts         # Super Admin API
│   │   ├── team.ts               # Team API
│   │   └── users.ts              # Users API
│   │
│   ├── auth/                     # Authentication utilities
│   │   ├── components/           # Auth components (AuthModal, AuthGuard)
│   │   ├── pages/                # Login pages (various admin types)
│   │   └── utils/                # Auth utilities
│   │
│   ├── supabase/                 # Supabase configuration
│   │   ├── client.ts             # Client-side Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   │
│   └── utils/                    # General utilities
│       ├── errorHandler.ts       # Error handling
│       ├── adminAuth.ts          # Admin auth utilities
│       ├── adminSecurity.ts      # Admin security checks
│       └── [other utilities]
│
├── contexts/                     # React Contexts
│   ├── AuthContext.tsx           # Authentication context
│   └── ThemeContext.tsx          # Theme context
│
├── hooks/                        # Custom React Hooks
│   ├── useTheme.ts
│   ├── useLenis.ts
│   └── [other hooks]
│
├── themes/                       # Theme configuration
│   ├── lightTheme.tsx
│   ├── darkTheme.tsx
│   └── ThemeManager.tsx
│
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── [config files]               # next.config.ts, tsconfig.json, etc.
```

### Key Frontend Files

1. **`app/layout.tsx`**: Root layout with Providers
2. **`app/(main)/layout.tsx`**: Main layout with Navbar/Footer
3. **`components/providers/Providers.tsx`**: Context providers wrapper
4. **`contexts/AuthContext.tsx`**: User authentication state management
5. **`lib/api/client.ts`**: Base API client for backend communication
6. **`lib/supabase/client.ts`**: Supabase client for authentication

---

## ⚙️ Backend Structure (`backend/`)

### Core Directories

```
backend/
├── src/
│   ├── server.ts                 # Express server entry point
│   │
│   ├── config/                   # Configuration
│   │   └── supabase.ts           # Supabase client setup
│   │
│   ├── modules/                  # Feature Modules
│   │   ├── courses/              # Courses module
│   │   │   ├── controllers/      # Request handlers
│   │   │   │   ├── courseController.ts
│   │   │   │   └── quizController.ts
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── courseService.ts
│   │   │   │   └── quizService.ts
│   │   │   ├── routes/           # Express routes
│   │   │   │   └── index.ts
│   │   │   ├── types/            # TypeScript types
│   │   │   │   └── index.ts
│   │   │   └── migrations/       # SQL migration files
│   │   │
│   │   ├── landing/              # Landing module
│   │   ├── stackstore/           # StackStore module
│   │   ├── superadmin/           # Super Admin module
│   │   └── team/                 # Team module
│   │
│   └── shared/                   # Shared modules
│       └── modules/
│           ├── auth/             # Authentication
│           │   ├── controllers/
│           │   ├── services/
│           │   └── routes/
│           │
│           └── users/             # User management
│               ├── controllers/
│               ├── services/
│               ├── routes/
│               └── types/
│
├── package.json
├── tsconfig.json
└── nodemon.json
```

### Backend Module Pattern

Each module follows this structure:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic & database operations
- **Routes**: Define API endpoints
- **Types**: TypeScript interfaces

### Key Backend Files

1. **`src/server.ts`**: Express server setup with middleware
2. **`src/config/supabase.ts`**: Supabase admin client configuration
3. **`src/modules/*/routes/index.ts`**: Route definitions
4. **`src/modules/*/controllers/*.ts`**: Request handlers
5. **`src/modules/*/services/*.ts`**: Database operations

---

## 🔐 Authentication System

### User Authentication (Normal Users)

**Flow**:
1. User signs in via Supabase Auth (client-side)
2. Session stored in localStorage
3. `AuthContext` manages user state
4. User profile synced with `users` table

**Files**:
- `frontend/lib/supabase/client.ts` - Supabase client
- `frontend/contexts/AuthContext.tsx` - Auth state
- `frontend/components/AuthModal.tsx` - Login modal

### Admin Authentication (Separate System)

**Flow**:
1. Admin logs in via custom admin login page
2. Multi-layer security check:
   - Environment variable whitelist (PRIMARY)
   - Database check (`admin_users` table) (SECONDARY)
3. Password verification via backend API
4. Session stored in sessionStorage (24-hour expiry)
5. Role-based redirect to appropriate admin panel

**Admin Roles**:
- `super_admin` → `/supadmin`
- `courses_admin` → `/admincourset4s`
- `landing_admin` → `/adminlandingt4s`
- `stackstore_admin` → `/adminstackt4s`
- `team_admin` → `/adminteamt4s`

**Files**:
- `frontend/lib/auth/pages/UnifiedAdminLoginPage.tsx` - Admin login
- `frontend/lib/utils/adminSecurity.ts` - Security checks
- `frontend/components/admin/AuthGuard.tsx` - Admin route protection
- `backend/src/modules/superadmin/` - Admin management APIs

---

## 🛣️ API Architecture

### API Client Pattern

**Frontend** → **Backend API** → **Supabase**

1. **Frontend** calls `lib/api/*.ts` functions
2. **API Client** (`lib/api/client.ts`) makes HTTP requests to backend
3. **Backend** (`backend/src/modules/*/controllers/`) handles requests
4. **Services** (`backend/src/modules/*/services/`) interact with Supabase
5. **Response** flows back through the chain

### API Endpoints Structure

```
/api/courses/*          # Course management
/api/landing/*          # Landing page content
/api/stackstore/*       # E-commerce operations
/api/team/*             # Team management
/api/superadmin/*       # Super admin operations
/api/users/*            # User management
/api/auth/*             # Authentication
```

### Example: Course API Flow

```
Frontend Component
  ↓
lib/api/courses.ts (getAllCourses())
  ↓
lib/api/client.ts (apiClient.get())
  ↓
HTTP GET http://localhost:5000/api/courses
  ↓
backend/src/modules/courses/routes/index.ts
  ↓
backend/src/modules/courses/controllers/courseController.ts
  ↓
backend/src/modules/courses/services/courseService.ts
  ↓
Supabase Database (courses table)
```

---

## 📊 Database Schema (Supabase)

### Key Tables

1. **`users`**: User profiles
2. **`admin_users`**: Admin accounts (separate from auth.users)
3. **`courses`**: Course information
4. **`videos`**: Course videos
5. **`quizzes`**: Quiz definitions
6. **`quiz_questions`**: Quiz questions
7. **`quiz_options`**: MCQ options
8. **`quiz_attempts`**: User quiz attempts
9. **`quiz_attempt_answers`**: User answers
10. **`progress`**: User course progress
11. **`admission_forms`**: Course admission applications
12. **`reviews`**: Landing page reviews
13. **`projects`**: Landing page projects
14. **`services`**: Landing page services
15. **`products`**: StackStore products
16. **`orders`**: StackStore orders
17. **`team_members`**: Team member profiles
18. **`mentors`**: Mentor profiles

---

## 🎯 Main Features

### 1. Courses System
- Course listing & details
- Video playback
- Quiz system (10 questions per video)
- Progress tracking
- Admission forms
- Student dashboard

### 2. Landing Page
- Hero section
- Services showcase
- Courses preview
- Projects gallery
- Reviews/testimonials
- Contact form
- Admin content management

### 3. StackStore (E-commerce)
- Product catalog
- Categories
- Order management
- Seller management
- Admin panel

### 4. Team Management
- Team member profiles
- Mentor profiles
- Admin management

### 5. Super Admin
- User management
- Admin role management
- Audit logs
- System settings

---

## 🔄 Application Flow

### User Journey

1. **Landing Page** (`/`)
   - Browse services, courses, projects
   - View reviews
   - Contact support

2. **Sign Up/Login**
   - Via AuthModal component
   - Supabase authentication
   - Profile creation/update

3. **Browse Courses** (`/courses`)
   - View course list
   - Course details
   - Apply for admission

4. **Student Dashboard** (`/student`)
   - Enrolled courses
   - Watch videos
   - Take quizzes
   - Track progress

### Admin Journey

1. **Admin Login** (`/admin/login` or role-specific)
   - Unified admin login page
   - Multi-layer security check
   - Role-based redirect

2. **Admin Dashboard** (role-specific)
   - Manage content
   - View analytics
   - User management (super admin)

---

## 🛡️ Security Features

1. **Rate Limiting**: 100 requests per 15 minutes (production)
2. **CORS**: Configured for frontend origin only
3. **Helmet.js**: Security headers
4. **Admin Security**: Multi-layer (env vars + database)
5. **Error Sanitization**: No sensitive info exposed
6. **Session Management**: Secure session storage
7. **RLS Bypass**: Backend uses admin client (controlled access)

---

## 🚀 Development Workflow

### Starting Development

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev  # Runs on port 5000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev  # Runs on port 3000
   ```

### Environment Variables

**Backend** (`.env`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `PORT=5000`
- `FRONTEND_URL=http://localhost:3000`

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

---

## 📝 Key Design Patterns

1. **Module Pattern**: Feature-based modules (courses, landing, etc.)
2. **MVC-like**: Controllers → Services → Database
3. **Context API**: Global state (Auth, Theme)
4. **API Client**: Centralized API communication
5. **Route Guards**: AuthGuard for protected routes
6. **Error Handling**: Centralized error handling

---

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State**: React Context API
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **3D**: Three.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS, Rate Limiting

### Database
- **Provider**: Supabase
- **Type**: PostgreSQL
- **Auth**: Supabase Auth

---

## 📚 Important Notes

1. **No Direct DB Access from Frontend**: All database operations go through backend API
2. **Supabase Auth Only for Users**: Admin uses custom auth system
3. **Admin Security**: Environment variable whitelist is PRIMARY security layer
4. **Session Storage**: Admin sessions in sessionStorage, user sessions in localStorage
5. **RLS**: Backend bypasses RLS using admin client (service role key)

---

## 🎓 Learning Resources

- Next.js App Router: https://nextjs.org/docs/app
- Supabase: https://supabase.com/docs
- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/docs/

---

**Last Updated**: January 2026
**Project Version**: 1.1.1
