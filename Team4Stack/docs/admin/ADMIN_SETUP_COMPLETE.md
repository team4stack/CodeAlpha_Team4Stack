# Complete Admin Setup Guide

## ✅ What's Been Done

1. **All Admin Dashboards Designed** - Super Admin style with modern UI
2. **SQL Query Created** - `add_all_admins.sql` to add all admins
3. **Environment Configuration** - `.env` setup guide created
4. **Role-Based Access Control** - Each admin can only access their panel

## 📋 Setup Steps

### Step 1: Run SQL Query in Supabase

1. Open Supabase Dashboard → **SQL Editor**
2. Copy content from `add_all_admins.sql`
3. Paste and run the query
4. Verify all 4 admins were created

### Step 2: Configure Environment Variables

1. Create `.env` file in project root (if not exists)
2. Add this line:
   ```env
   VITE_ALLOWED_ADMIN_EMAILS=superadmin@gmail.com,stackstoreadmin@gmail.com,teamadmin@gmail.com,courseadmin@gmail.com
   ```
3. **IMPORTANT:** Restart your dev server after adding `.env`

### Step 3: Test Login

| Admin | Email | Password | Login URL |
|-------|-------|---------|-----------|
| Super Admin | superadmin@gmail.com | password123 | `/supadmin/login` |
| StackStore Admin | stackstoreadmin@gmail.com | password123 | `/adminstackt4s/login` |
| Team Admin | teamadmin@gmail.com | password123 | `/adminteamt4s/login` |
| Courses Admin | courseadmin@gmail.com | password123 | `/admincourset4s/login` |

## 🔒 Security Features

1. **Environment Variable Check** - First security layer
2. **Supabase Table Check** - Second security layer
3. **Role-Based Access** - Each admin can only access their panel
4. **Password Verification** - Uses bcrypt hashing

## 📁 Files Created

- `add_all_admins.sql` - SQL query to add all admins
- `ENV_CONFIGURATION.md` - Environment variables guide
- `ADMIN_SETUP_COMPLETE.md` - This file

## 🎨 Dashboard Designs

All dashboards now have:
- ✅ Modern gradient headers
- ✅ Custom stat cards with icons
- ✅ Quick action buttons
- ✅ Responsive design
- ✅ Dark mode support

## ⚠️ Important Notes

1. **All passwords are:** `password123`
2. **Change passwords in production!**
3. **Email must be in `.env` file**
4. **Server must be restarted after `.env` changes**
5. **Each admin can ONLY access their assigned panel**

## 🚀 Next Steps

1. Run SQL query in Supabase
2. Add emails to `.env` file
3. Restart dev server
4. Test login with each admin
5. Verify role-based access is working

## 🐛 Troubleshooting

If login doesn't work:
1. Check `.env` file has all emails
2. Restart dev server
3. Verify admins exist in Supabase
4. Check browser console for errors
5. See `TROUBLESHOOTING_LOGIN.md` for details

