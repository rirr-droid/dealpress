-- DEALPRESS CLEAN SLATE - Delete all users and related data
-- WARNING: This will delete ALL data including organizations, requests, templates, etc.
-- Run this to start completely fresh

-- Step 1: Delete all approval requests and related data
DELETE FROM approval_request_attachments;
DELETE FROM approval_request_approvers;
DELETE FROM approval_requests;

-- Step 2: Delete all templates and related data
DELETE FROM template_steps;
DELETE FROM approval_templates;

-- Step 3: Delete all team invitations
DELETE FROM team_invitations;

-- Step 4: Delete all organization members
DELETE FROM organization_members;

-- Step 5: Delete all organizations
DELETE FROM organizations;

-- Step 6: Delete all users from auth.users (Supabase auth table)
-- NOTE: You may need to run this from the Supabase Dashboard SQL Editor
-- as it requires elevated permissions
DELETE FROM auth.users;

-- Verify everything is clean
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Organization Members', COUNT(*) FROM organization_members
UNION ALL
SELECT 'Approval Templates', COUNT(*) FROM approval_templates
UNION ALL
SELECT 'Template Steps', COUNT(*) FROM template_steps
UNION ALL
SELECT 'Approval Requests', COUNT(*) FROM approval_requests
UNION ALL
SELECT 'Request Approvers', COUNT(*) FROM approval_request_approvers
UNION ALL
SELECT 'Request Attachments', COUNT(*) FROM approval_request_attachments
UNION ALL
SELECT 'Team Invitations', COUNT(*) FROM team_invitations
UNION ALL
SELECT 'Auth Users', COUNT(*) FROM auth.users;

