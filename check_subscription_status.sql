-- Check subscription status for rirr@tepper.cmu.edu
SELECT 
  o.id,
  o.name,
  o.stripe_customer_id,
  o.stripe_subscription_id,
  o.subscription_plan,
  o.subscription_status,
  o.subscription_tier,
  o.current_period_start,
  o.current_period_end,
  u.email
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN auth.users u ON om.user_id = u.id
WHERE u.email = 'rirr@tepper.cmu.edu';
