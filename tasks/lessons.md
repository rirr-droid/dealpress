# DealPress Lessons Learned

**Purpose:** Track mistakes, corrections, and prevention rules to continuously improve

**Format:** Each lesson should include:
- **Date:** When the correction was made
- **Problem:** What went wrong
- **Root Cause:** Why it happened
- **Prevention Rule:** How to avoid it in the future

---

## Lesson 1: Don't Keep Backup Files in Source

**Date:** 2026-02-24

**Problem:** Build failed with TypeScript error because `page_old.tsx` backup file had outdated prop interfaces

**Root Cause:** Created backup file with `mv` instead of deleting old code after refactor

**Prevention Rule:**
- Delete old code, don't rename to `_old` or `_backup`
- Git history is the backup
- If you must keep a backup, add it to `.gitignore`

**Command to check:**
```bash
# Find backup files before committing
git status | grep -E '(_old|_backup|\.bak)'
```

---

## Lesson 2: Update Database Schema Incrementally

**Date:** 2026-02-24

**Problem:** Migration failed because existing data had `subscription_plan = 'free'` but new constraint only allowed `'starter'`

**Root Cause:** Tried to add constraint without first migrating existing data to new values

**Prevention Rule:**
1. Always UPDATE existing data BEFORE adding constraints
2. Run migrations in steps:
   - Step 1: Add columns (nullable, no constraints)
   - Step 2: Migrate data
   - Step 3: Add constraints
   - Step 4: Add indexes

**Example pattern:**
```sql
-- Step 1: Add column
ALTER TABLE organizations ADD COLUMN subscription_plan TEXT;

-- Step 2: Migrate existing data
UPDATE organizations SET subscription_plan = 'starter' WHERE subscription_plan IS NULL;

-- Step 3: Add constraint
ALTER TABLE organizations
ADD CONSTRAINT check_plan
CHECK (subscription_plan IN ('starter', 'professional', 'business'));
```

---

## Lesson 3: Explicitly Set Constrained Columns in INSERTs

**Date:** 2026-02-24

**Problem:** New user signup failed with "Database error creating new user"

**Root Cause:** Auth callback was inserting into `organizations` table without explicitly setting `subscription_plan`, relying on database defaults. However, CHECK constraints were preventing the insert.

**Prevention Rule:**
- Never rely on database defaults when columns have CHECK constraints
- Explicitly set all constrained columns in INSERT statements
- Test new user signup after any database schema changes

**Example fix:**
```typescript
// ❌ BAD - Relies on defaults
await supabase.from('organizations').insert({
  name: orgName,
});

// ✅ GOOD - Explicitly sets all constrained fields
await supabase.from('organizations').insert({
  name: orgName,
  subscription_plan: 'starter',
  subscription_status: 'active',
});
```

**Testing checklist after schema changes:**
- [ ] Test new user signup
- [ ] Test existing user login
- [ ] Test user with pending invitation
- [ ] Check all INSERT statements for constrained tables

---

## Lesson 4: [Template for Next Lesson]

**Date:** YYYY-MM-DD

**Problem:** What went wrong?

**Root Cause:** Why did it happen?

**Prevention Rule:** How to avoid it?

**Code/Command:** Examples to prevent it

---

## Review Schedule

- Review this file at the start of each session
- Add new lessons immediately after user corrections
- Archive old lessons after 90 days if mistake hasn't recurred
- Keep this file under 50 lessons (archive rest to `tasks/lessons_archive.md`)

---

## Patterns to Watch For

### Common Mistake Categories
- [x] Database migrations without data migration (Lesson 2)
- [x] Adding constraints before validating existing data (Lesson 2)
- [x] Backup files in source control (Lesson 1)
- [x] Relying on database defaults with constraints (Lesson 3)
- [ ] Hardcoded values instead of environment variables
- [ ] Missing error handling
- [ ] Security vulnerabilities (RLS, input validation)
- [ ] N+1 queries
- [ ] Client/server component confusion
- [ ] Missing TypeScript types

### Prevention Checklist
Before committing any code:
- [ ] No backup files (`_old`, `_backup`, `.bak`)
- [ ] All environment variables in `.env.example`
- [ ] Database changes include data migration
- [ ] Constrained columns explicitly set in INSERTs
- [ ] Error handling on all async operations
- [ ] Input validation on all user data
- [ ] TypeScript strict mode passes
- [ ] No console.log in production code
- [ ] Test new user signup after schema changes
