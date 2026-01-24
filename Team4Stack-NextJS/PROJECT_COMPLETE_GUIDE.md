# Team4Stack - Complete Project Guide

## 📋 Project Overview

**Team4Stack** is a full-stack educational platform with e-commerce capabilities, built with modern technologies.

### Tech Stack
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: 
  - Supabase Auth (for regular users)
  - Custom Admin Auth (for admin users)

---

## 🏗️ Project Structure

```
Team4Stack-NextJS/
├── frontend/                    # Next.js Application (Port 3000)
│   ├── app/                     # Next.js App Router (Routes)
│   │   ├── (main)/              # Public routes (home, courses, team, etc.)
│   │   ├── admincourset4s/     # Courses Admin Panel
│   │   ├── adminlandingt4s/    # Landing Admin Panel
│   │   ├── adminstackt4s/      # StackStore Admin Panel
│   │   ├── adminteamt4s/       # Team Admin Panel
│   │   ├── supadmin/           # Super Admin Panel
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/              # Shared React Components
│   │   ├── admin/              # Admin components (Sidebar, Header, etc.)
│   │   ├── modals/             # Modal components
│   │   ├── navigation/         # Navbar components
│   │   └── utilities/          # Utility components
│   │
│   ├── modules/                 # Feature Modules (Feature-based architecture)
│   │   ├── courses/            # Courses feature
│   │   │   ├── admin/          # Admin pages & components
│   │   │   ├── components/     # Course-specific components
│   │   │   ├── pages/          # Public course pages
│   │   │   └── sections/       # Course sections
│   │   │
│   │   ├── landing/            # Landing page feature
│   │   ├── stackstore/         # E-commerce feature
│   │   ├── superadmin/         # Super Admin feature
│   │   └── team/               # Team feature
│   │
│   ├── lib/                     # Libraries & Utilities
│   │   ├── api/                # API client modules
│   │   │   ├── client.ts       # Base API client
│   │   │   ├── courses.ts      # Courses API
│   │   │   ├── landing.ts      # Landing API
│   │   │   └── [other APIs]
│   │   │
│   │   ├── auth/               # Authentication utilities
│   │   ├── supabase/           # Supabase configuration
│   │   └── utils/              # General utilities
│   │
│   ├── contexts/                # React Contexts
│   │   ├── AuthContext.tsx     # User authentication state
│   │   └── ThemeContext.tsx    # Theme state
│   │
│   ├── hooks/                   # Custom React Hooks
│   ├── themes/                  # Theme configuration
│   └── types/                   # TypeScript definitions
│
└── backend/                     # Express API Server (Port 5000)
    └── src/
        ├── server.ts            # Express server entry point
        ├── config/
        │   └── supabase.ts     # Supabase admin client
        │
        └── modules/             # Feature Modules (MVC pattern)
            ├── courses/         # Courses module
            │   ├── controllers/ # Request handlers
            │   ├── services/    # Business logic & DB operations
            │   ├── routes/      # Express routes
            │   ├── types/       # TypeScript types
            │   └── migrations/  # SQL migration files
            │
            ├── landing/         # Landing module
            ├── stackstore/      # StackStore module
            ├── superadmin/      # Super Admin module
            ├── team/            # Team module
            │
            └── shared/         # Shared modules
                └── modules/
                    ├── auth/    # Authentication
                    └── users/   # User management
```

---

## 🔄 How The Project Works

### 1. **Application Flow**

```
User Browser
    ↓
Next.js Frontend (Port 3000)
    ↓
Backend API (Port 5000) ← Express Server
    ↓
Supabase Database (PostgreSQL)
```

### 2. **Data Flow Pattern**

**Frontend → Backend → Database**

1. **Frontend Component** calls API function from `lib/api/*.ts`
2. **API Client** (`lib/api/client.ts`) makes HTTP request to backend
3. **Backend Route** (`backend/src/modules/*/routes/index.ts`) receives request
4. **Controller** (`backend/src/modules/*/controllers/*.ts`) handles request
5. **Service** (`backend/src/modules/*/services/*.ts`) interacts with Supabase
6. **Response** flows back through the chain

**Example: Getting Courses**
```
Frontend: CourseListPage.tsx
    ↓
lib/api/courses.ts → getAllCourses()
    ↓
lib/api/client.ts → apiClient.get('/courses')
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

## 🔐 Authentication System

### **User Authentication (Regular Users)**

**Flow:**
1. User signs in via Supabase Auth (client-side)
2. Session stored in `localStorage`
3. `AuthContext` manages user state globally
4. User profile synced with `users` table in database

**Key Files:**
- `frontend/lib/supabase/client.ts` - Supabase client
- `frontend/contexts/AuthContext.tsx` - Auth state management
- `frontend/components/AuthModal.tsx` - Login modal

### **Admin Authentication (Separate System)**

**Flow:**
1. Admin logs in via custom admin login page (`/admin/login`)
2. Multi-layer security check:
   - **PRIMARY**: Environment variable whitelist
   - **SECONDARY**: Database check (`admin_users` table)
3. Password verification via backend API
4. Session stored in `sessionStorage` (24-hour expiry)
5. Role-based redirect to appropriate admin panel

**Admin Roles & Routes:**
- `super_admin` → `/supadmin`
- `courses_admin` → `/admincourset4s`
- `landing_admin` → `/adminlandingt4s`
- `stackstore_admin` → `/adminstackt4s`
- `team_admin` → `/adminteamt4s`

**Key Files:**
- `frontend/lib/auth/pages/UnifiedAdminLoginPage.tsx` - Admin login
- `frontend/lib/utils/adminSecurity.ts` - Security checks
- `frontend/components/admin/AuthGuard.tsx` - Route protection
- `backend/src/modules/superadmin/` - Admin management APIs

---

## 📡 API Architecture

### **API Endpoints Structure**

```
/api/courses/*          # Course management
/api/landing/*          # Landing page content
/api/stackstore/*       # E-commerce operations
/api/team/*             # Team management
/api/superadmin/*       # Super admin operations
/api/users/*            # User management
/api/auth/*             # Authentication
```

### **Backend Module Pattern**

Each backend module follows MVC-like pattern:

```
routes/index.ts         # Define endpoints
    ↓
controllers/*.ts        # Handle HTTP requests/responses
    ↓
services/*.ts           # Business logic & database operations
    ↓
Supabase Database
```

**Example Module Structure:**
```
backend/src/modules/courses/
├── routes/index.ts              # GET /api/courses, POST /api/courses, etc.
├── controllers/
│   ├── courseController.ts      # getAllCourses(), createCourse(), etc.
│   └── quizController.ts        # Quiz-related endpoints
├── services/
│   ├── courseService.ts         # Database operations for courses
│   └── quizService.ts           # Database operations for quizzes
└── types/index.ts               # TypeScript interfaces
```

---

## 🎯 Main Features

### 1. **Courses System**
- Course listing & details
- Video playback
- Quiz system (10 questions per video)
- Progress tracking
- Admission forms
- Student dashboard

**Key Files:**
- `frontend/modules/courses/pages/` - Course pages
- `frontend/modules/courses/admin/` - Admin management
- `backend/src/modules/courses/` - Backend APIs

### 2. **Landing Page**
- Hero section
- Services showcase
- Courses preview
- Projects gallery
- Reviews/testimonials
- Contact form
- Admin content management

**Key Files:**
- `frontend/modules/landing/sections/` - Landing sections
- `frontend/modules/landing/admin/` - Content management

### 3. **StackStore (E-commerce)**
- Product catalog
- Categories
- Order management
- Seller management
- Admin panel

**Key Files:**
- `frontend/modules/stackstore/` - Store pages
- `backend/src/modules/stackstore/` - Store APIs

### 4. **Team Management**
- Team member profiles
- Mentor profiles
- Admin management

**Key Files:**
- `frontend/modules/team/` - Team pages
- `backend/src/modules/team/` - Team APIs

### 5. **Super Admin**
- User management
- Admin role management
- Audit logs
- System settings

**Key Files:**
- `frontend/modules/superadmin/` - Super admin pages
- `backend/src/modules/superadmin/` - Super admin APIs

---

## 🚀 Development Workflow

### **Starting the Project**

#### 1. **Backend Server**
```bash
cd backend
npm install
npm run dev  # Runs on port 5000
```

**Environment Variables** (`.env` in `backend/`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

#### 2. **Frontend Application**
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

**Environment Variables** (`.env.local` in `frontend/`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Verification**

1. **Backend Health Check:**
   - Visit: `http://localhost:5000/health`
   - Should return: `{"status":"ok","message":"Team4Stack Backend API is running"}`

2. **Frontend:**
   - Visit: `http://localhost:3000`
   - Should see landing page

---

## 📊 Database Schema (Supabase)

### **Key Tables**

1. **`users`** - User profiles (synced with Supabase Auth)
2. **`admin_users`** - Admin accounts (separate from auth.users)
3. **`courses`** - Course information
4. **`videos`** - Course videos
5. **`quizzes`** - Quiz definitions
6. **`quiz_questions`** - Quiz questions
7. **`quiz_options`** - MCQ options
8. **`quiz_attempts`** - User quiz attempts
9. **`quiz_attempt_answers`** - User answers
10. **`progress`** - User course progress
11. **`admission_forms`** - Course admission applications
12. **`reviews`** - Landing page reviews
13. **`projects`** - Landing page projects
14. **`services`** - Landing page services
15. **`products`** - StackStore products
16. **`orders`** - StackStore orders
17. **`team_members`** - Team member profiles
18. **`mentors`** - Mentor profiles

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

## 📝 Key Design Patterns

1. **Module Pattern**: Feature-based modules (courses, landing, etc.)
2. **MVC-like**: Controllers → Services → Database
3. **Context API**: Global state (Auth, Theme)
4. **API Client**: Centralized API communication
5. **Route Guards**: AuthGuard for protected routes
6. **Error Handling**: Centralized error handling

---

## 🔧 Important Notes

1. **No Direct DB Access from Frontend**: All database operations go through backend API
2. **Supabase Auth Only for Users**: Admin uses custom auth system
3. **Admin Security**: Environment variable whitelist is PRIMARY security layer
4. **Session Storage**: 
   - Admin sessions in `sessionStorage` (24-hour expiry)
   - User sessions in `localStorage` (persistent)
5. **RLS**: Backend bypasses RLS using admin client (service role key)

---

## 📚 File Organization Rules

### **Frontend**
- **`app/`**: Next.js routes (App Router)
- **`components/`**: Shared, reusable components
- **`modules/`**: Feature-specific code (pages, components, sections)
- **`lib/`**: Utilities, API clients, configurations
- **`contexts/`**: React Context providers
- **`hooks/`**: Custom React hooks

### **Backend**
- **`modules/`**: Feature modules (MVC pattern)
  - **`routes/`**: Express route definitions
  - **`controllers/`**: Request handlers
  - **`services/`**: Business logic & database operations
  - **`types/`**: TypeScript interfaces

---

## 🎓 Common Tasks

### **Adding a New Feature**

1. **Backend:**
   - Create module in `backend/src/modules/`
   - Add routes, controllers, services
   - Register routes in `server.ts`

2. **Frontend:**
   - Create module in `frontend/modules/`
   - Add pages in `app/` (if needed)
   - Create API client in `lib/api/`
   - Add components as needed

### **Adding a New Admin Panel**

1. Create route in `app/admin[name]t4s/`
2. Create admin module in `frontend/modules/[feature]/admin/`
3. Add admin routes in backend
4. Update admin login redirect logic

---

## 📖 Documentation Files

- `PROJECT_STRUCTURE_AND_FLOW.md` - Detailed architecture
- `BACKEND_START_GUIDE.md` - Backend setup guide
- `API_ENDPOINTS_CHECK.md` - All API endpoints
- `README.md` - Quick start guide

---

**Last Updated**: January 2026  
**Project Version**: 1.1.1
