# DealPress Scripts

## Seed Demo Data

The `seed-demo-data.ts` script populates your DealPress database with demo data for testing and demonstration purposes.

### Prerequisites

1. **Supabase project must be set up** - Run the SQL schema from `SUPABASE_SETUP.md` first
2. **Environment variables configured** - Ensure `.env.local` has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for seeding)
3. **At least one user signed up** - The script will use your organization as the base

### Usage

```bash
npm run seed
```

### What the script creates

1. **Demo Users** (3 additional profiles):
   - Sarah Chen (VP Sales, Admin)
   - Michael Park (Sales Manager, Member)
   - Jennifer Smith (Sales Rep, Member)

2. **Approval Templates** (2):
   - Standard Deal Approval (for deals under $50k)
   - Enterprise Deal Approval (for deals over $50k with CFO sign-off)

3. **Approval Requests** (4) with various statuses:
   - Acme Corp - Enterprise License ($85k, pending at VP approval)
   - TechStart Inc - Annual Subscription ($35k, fully approved)
   - Global Dynamics - Pilot Program ($15k, pending at manager review)
   - MegaCorp - Multi-Year Deal ($250k, rejected at VP level)

### Notes

- The script is idempotent - running it multiple times won't create duplicates
- Demo user profiles are created with fake IDs since they're not real Supabase auth users
- In production, you would sign up real users instead
- All data is scoped to your organization

### Troubleshooting

**Error: "No users found"**
- Sign up at least one user through the UI first
- The script needs an existing organization to work with

**Error: "Missing environment variables"**
- Ensure `.env.local` has all required variables
- Get the service role key from Supabase dashboard → Settings → API

**Error: "Failed to create..."**
- Check your Supabase RLS policies
- Ensure the service role key bypasses RLS correctly
