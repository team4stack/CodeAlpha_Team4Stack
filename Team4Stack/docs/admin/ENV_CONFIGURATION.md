# Environment Variables Configuration

## Required Environment Variables

Create a `.env` file in the root of your project with the following:

```env
# ============================================
# ADMIN EMAILS CONFIGURATION
# ============================================
# Only Super Admin email is required in environment variable
# Other admins (stackstore, team, courses) are managed via Supabase only

VITE_ALLOWED_ADMIN_EMAILS=superadmin@gmail.com

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Add your Supabase credentials here
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================
# OTHER CONFIGURATION
# ============================================
# Add any other environment variables below
```

## Admin Credentials

All admins have the same password: `password123`

| Role | Email | Password | Access URL | Env Required |
|------|-------|----------|------------|--------------|
| Super Admin | superadmin@gmail.com | password123 | /supadmin | ✅ Yes |
| StackStore Admin | stackstoreadmin@gmail.com | password123 | /adminstackt4s | ❌ No |
| Team Admin | teamadmin@gmail.com | password123 | /adminteamt4s | ❌ No |
| Courses Admin | courseadmin@gmail.com | password123 | /admincourset4s | ❌ No |

## Security Model

- **Super Admin**: Must be in `.env` file (highest security)
- **Other Admins**: Managed via Supabase only (can be added/removed from database)

## Important Notes

1. **Only superadmin@gmail.com needs to be in `.env`**
2. **Other admins are verified via Supabase table only**
3. **After updating `.env` file, restart your dev server**
4. **Email must be lowercase in the environment variable**

## Setup Steps

1. Copy the `.env` configuration above
2. Create `.env` file in project root
3. Add only `superadmin@gmail.com` to `VITE_ALLOWED_ADMIN_EMAILS`
4. Run the SQL query from `add_all_admins.sql` in Supabase
5. Restart your dev server
6. Test login with each admin
