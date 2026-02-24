-- DEALPRESS CLEAN SLATE - Delete all users and related data
-- WARNING: This will delete ALL data including organizations, requests, templates, etc.
-- Run this to start completely fresh

-- Step 1: Delete all approval-related data
DELETE FROM step_comments;
DELETE FROM approval_steps;
DELETE FROM approval_requests;

-- Step 2: Delete all templates and related data
DELETE FROM template_steps;
DELETE FROM approval_templates;

-- Step 3: Delete other related data
DELETE FROM notifications;
DELETE FROM audit_logs;
DELETE FROM usage_tracking;

-- Step 4: Delete team invitations (if table exists)
DELETE FROM team_invitations;

-- Step 5: Delete slack integration data (if tables exist)
DELETE FROM slack_users;

-- Step 6: Delete conversion tracking (if table exists)
DELETE FROM conversion_events;

-- Step 7: Delete contacts (if table exists)
DELETE FROM contacts;

-- Step 8: Delete attachments (if table exists)
DELETE FROM approval_attachments;

-- Step 9: Delete template step approvers (if table exists)
DELETE FROM template_step_approvers;

-- Step 10: Delete all organization members
DELETE FROM organization_members;

-- Step 11: Delete all user profiles
DELETE FROM user_profiles;

-- Step 12: Delete all organizations
DELETE FROM organizations;

-- Step 13: Delete all users from auth.users (Supabase auth table)
-- NOTE: This requires elevated permissions
DELETE FROM auth.users;

-- Verify everything is clean
SELECT 'organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'organization_members', COUNT(*) FROM organization_members
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'approval_templates', COUNT(*) FROM approval_templates
UNION ALL
SELECT 'template_steps', COUNT(*) FROM template_steps
UNION ALL
SELECT 'approval_requests', COUNT(*) FROM approval_requests
UNION ALL
SELECT 'approval_steps', COUNT(*) FROM approval_steps
UNION ALL
SELECT 'step_comments', COUNT(*) FROM step_comments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'usage_tracking', COUNT(*) FROM usage_tracking
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;

-- Success message
SELECT 'Database cleaned successfully! All users and data deleted.' as status;
