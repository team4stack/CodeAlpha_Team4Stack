# Documentation

This folder contains all documentation and SQL files for the Team4Stack project.

## Folder Structure

### `/sql` - SQL Migration Files
Contains all SQL queries and migration scripts:
- `add_all_admins.sql` - Add all admin users with roles
- `add_super_admin.sql` - Add super admin user
- `create_password_hash_function.sql` - Password hashing functions
- `fix_super_admin_login.sql` - Fix super admin login issues
- `supabase_migration_add_role_column.sql` - Add role column to admin_users table

### `/admin` - Admin Documentation
Contains admin setup and configuration guides:
- `ADMIN_SETUP_COMPLETE.md` - Complete admin setup guide
- `ADD_SUPER_ADMIN_INSTRUCTIONS.md` - How to add super admin
- `ENV_CONFIGURATION.md` - Environment variables configuration
- `SUPABASE_MIGRATION_INSTRUCTIONS.md` - Database migration instructions
- `TROUBLESHOOTING_LOGIN.md` - Login troubleshooting guide

## Quick Start

1. **Database Setup:**
   - Run `sql/supabase_migration_add_role_column.sql` first
   - Run `sql/add_all_admins.sql` to add all admins

2. **Environment Setup:**
   - See `admin/ENV_CONFIGURATION.md` for `.env` setup

3. **Troubleshooting:**
   - See `admin/TROUBLESHOOTING_LOGIN.md` for common issues

