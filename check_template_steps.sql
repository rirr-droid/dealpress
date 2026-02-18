-- Check if template steps actually exist in the database
-- Run this in Supabase SQL Editor

-- List all templates
SELECT
  id,
  name,
  is_active,
  created_at
FROM approval_templates
ORDER BY created_at DESC;

-- List all template steps
SELECT
  ts.id,
  ts.template_id,
  at.name as template_name,
  ts.step_name,
  ts.step_order,
  ts.approver_role,
  ts.created_at
FROM template_steps ts
JOIN approval_templates at ON at.id = ts.template_id
ORDER BY ts.template_id, ts.step_order;

-- Count steps per template
SELECT
  at.id,
  at.name,
  COUNT(ts.id) as step_count
FROM approval_templates at
LEFT JOIN template_steps ts ON ts.template_id = at.id
GROUP BY at.id, at.name
ORDER BY at.created_at DESC;
