# DealPress Development Workflow

**Last Updated:** 2026-02-24
**Purpose:** Operating principles for building DealPress efficiently and correctly

---

## Workflow Orchestration

### 1. Plan Mode Default
- ✅ **Enter plan mode for ANY non-trivial task** (3+ steps or architectural decisions)
- ✅ **If something goes sideways, STOP and re-plan immediately** – don't keep pushing
- ✅ **Use plan mode for verification steps, not just building**
- ✅ **Write detailed specs upfront to reduce ambiguity**

**When to use plan mode:**
- Multiple valid implementation approaches
- Architectural decisions (database schema, API design, etc.)
- Large-scale changes touching many files
- Unclear requirements that need exploration first
- User input needed to clarify direction

**When NOT to use plan mode:**
- Simple, straightforward tasks with obvious implementation
- Small bug fixes where solution is clear
- Adding a single function or small feature

### 2. Subagent Strategy
- ✅ **Use subagents liberally to keep main context window clean**
- ✅ **Offload research, exploration, and parallel analysis to subagents**
- ✅ **For complex problems, throw more compute at it via subagents**
- ✅ **One task per subagent for focused execution**

**Available subagents:**
- `Explore` - Finding files, searching codebase, understanding architecture
- `Plan` - Designing implementation strategy
- `feature-builder` - Implementing specific features
- `code-reviewer` - Reviewing code quality after implementation
- `test-runner` - Running tests and analyzing results

### 3. Self-Improvement Loop
- ✅ **After ANY correction from the user: update `tasks/lessons.md` with the pattern**
- ✅ **Write rules for yourself that prevent the same mistake**
- ✅ **Ruthlessly iterate on these lessons until mistake rate drops**
- ✅ **Review lessons at session start for relevant project**

**Lessons tracking:**
- Location: `tasks/lessons.md`
- Format: Problem → Root Cause → Prevention Rule
- Review before starting each session
- Update immediately after user corrections

### 4. Verification Before Done
- ✅ **Never mark a task complete without proving it works**
- ✅ **Diff behavior between main and your changes when relevant**
- ✅ **Ask yourself: "Would a staff engineer approve this?"**
- ✅ **Run tests, check logs, demonstrate correctness**

**Verification checklist:**
- [ ] Code compiles/builds successfully
- [ ] Tests pass (if applicable)
- [ ] Manually tested the change
- [ ] No console errors or warnings
- [ ] Matches requirements exactly
- [ ] Follows existing patterns in codebase

### 5. Demand Elegance (Balanced)
- ✅ **For non-trivial changes: pause and ask "is there a more elegant way?"**
- ✅ **If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"**
- ✅ **Skip this for simple, obvious fixes – don't over-engineer**
- ✅ **Challenge your own work before presenting it**

**When to optimize for elegance:**
- Core business logic
- Public APIs
- Reusable components
- Database schema design

**When to keep it simple:**
- One-off scripts
- Internal utilities
- Obvious bug fixes
- Temporary workarounds (clearly marked)

### 6. Autonomous Bug Fixing
- ✅ **When given a bug report: just fix it. Don't ask for hand-holding**
- ✅ **Point at logs, errors, failing tests – then resolve them**
- ✅ **Zero context switching required from the user**
- ✅ **Go fix failing CI tests without being told how**

**Bug fixing flow:**
1. Read error message/stack trace
2. Find root cause (use Grep, Read, Explore)
3. Implement fix
4. Verify fix works
5. Commit with clear message
6. Update lessons.md if applicable

---

## Task Management

### 1. Plan First
**Write plan to `tasks/todo.md` with checkable items**

Example:
```markdown
# Feature: Stripe Billing Integration

## Tasks
- [ ] Create database migration for subscription fields
- [ ] Update pricing tiers in code
- [ ] Build checkout API route
- [ ] Add webhook handler
- [ ] Test with Stripe test cards
```

### 2. Verify Plan
**Check in before starting implementation**
- Does the plan make sense?
- Are there edge cases missed?
- Is there a simpler approach?

### 3. Track Progress
**Mark items complete as you go**
- Use TodoWrite tool frequently
- Update status in real-time
- Only mark complete when verified working

### 4. Explain Changes
**High-level summary at each step**
- What you're doing
- Why it's necessary
- What the impact is

### 5. Document Results
**Add review section to `tasks/todo.md`**
- What was accomplished
- Any deviations from plan
- Issues encountered and resolved

### 6. Capture Lessons
**Update `tasks/lessons.md` after corrections**
- What went wrong
- Why it happened
- How to prevent it

---

## Core Principles

### Simplicity First
✅ **Make every change as simple as possible. Impact minimal code.**

**Before any change, ask:**
- What's the smallest change that solves this?
- Am I touching unnecessary code?
- Could this be simpler?

**Red flags:**
- Refactoring unrelated code
- Adding abstractions for single use cases
- Over-generalizing for hypothetical futures

### No Laziness
✅ **Find root causes. No temporary fixes. Senior developer standards.**

**Always:**
- Understand WHY before fixing HOW
- Fix the root cause, not symptoms
- Write code you'd be proud to show in a code review

**Never:**
- Band-aid fixes
- TODO comments without tickets
- "Works on my machine" solutions

### Minimal Impact
✅ **Changes should only touch what's necessary. Avoid introducing bugs.**

**Impact checklist:**
- [ ] Only modified files directly related to task
- [ ] No unrelated refactoring
- [ ] No style-only changes mixed with logic
- [ ] No scope creep

---

## Git & Deployment

### Commit Standards

**Format:** `[type]: [description]`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `style:` Formatting
- `test:` Adding tests
- `chore:` Maintenance

**Commit message rules:**
1. Clear, concise description
2. Explain WHY, not just WHAT
3. Reference issues/tickets if applicable
4. Include co-author credit

**Example:**
```
feat: Add Professional and Business pricing tiers

Redesigned pricing to optimize for $1K MRR:
- Professional: $49/month (need only 21 customers)
- Business: $99/month (need only 11 customers)

This reduces customer acquisition burden from 100 to ~15 customers
for reaching $1K MRR milestone.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Deployment Checklist

**Before deploying:**
- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Breaking changes documented

**After deploying:**
- [ ] Verify build succeeds
- [ ] Smoke test critical paths
- [ ] Check error monitoring
- [ ] Monitor for issues

---

## DealPress-Specific Guidelines

### Product Philosophy
**From CLAUDE.md:**
- Optimize for ICP: $10M–$500M ARR SaaS companies
- Reject features that serve anti-ICP
- Prioritize features that increase ARR or reduce churn within 90 days
- No vanity analytics, dashboard bloat, or over-engineering

### Feature Acceptance Criteria
**Every feature must answer:**
1. **Problem Statement:** What pain does this solve?
2. **ICP Affected:** Who needs this? (ICP or anti-ICP?)
3. **User Story:** As a [role], I want [action] so that [benefit]
4. **Acceptance Criteria:** What defines "done"?
5. **Metrics Impacted:** What KPI improves?
6. **Edge Cases:** What can break?
7. **Technical Dependencies:** What needs to exist first?
8. **Rollback Plan:** How do we undo if it fails?

### Architecture Non-Negotiables
1. ✅ Use row-level security in Supabase
2. ✅ All deal data multi-tenant isolated
3. ✅ No secrets in client
4. ✅ Log every approval action
5. ✅ No mock data in production routes

### Code Review Standards
**Before marking task complete:**
- [ ] Proper error handling
- [ ] Multi-tenant isolation enforced
- [ ] No N+1 queries
- [ ] Proper TypeScript types
- [ ] Server vs client components correct
- [ ] Security vulnerabilities checked
- [ ] Performance optimized

### Security Requirements
**Always:**
- Verify webhook signatures (Stripe)
- Use service role key for admin operations
- Validate all user input
- Sanitize database queries
- Check authorization on every route

**Never:**
- Commit API keys
- Bypass RLS policies
- Trust client-side validation alone
- Log sensitive data

---

## Session Workflow

### Session Start
1. Review `CLAUDE.md` for product context
2. Review `tasks/lessons.md` for past mistakes
3. Check `tasks/todo.md` for pending tasks
4. Understand current sprint goals

### During Work
1. Use TodoWrite to track progress
2. Commit frequently with clear messages
3. Test as you go, don't batch testing
4. Ask clarifying questions early
5. Document decisions in code comments

### Session End
1. Update `tasks/todo.md` with progress
2. Commit all work
3. Document any blockers
4. Update `tasks/lessons.md` if corrections were made
5. Leave clear notes for next session

---

## Anti-Patterns to Avoid

### ❌ Don't Do This

**Over-planning:**
- Spending hours planning trivial tasks
- Creating specs for obvious implementations
- Analysis paralysis

**Under-planning:**
- Starting complex features without a plan
- Making architectural decisions on the fly
- Skipping verification steps

**Scope creep:**
- Refactoring unrelated code
- Adding "nice to have" features
- Over-engineering simple solutions

**Poor communication:**
- Marking tasks complete without verification
- Not explaining changes
- Assuming user understands technical details

**Sloppy work:**
- Leaving commented-out code
- TODO comments without context
- Inconsistent formatting
- Copy-paste without understanding

---

## Quality Gates

### Before Committing
- [ ] Code builds successfully
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Follows existing code style
- [ ] Clear commit message

### Before Marking Complete
- [ ] All acceptance criteria met
- [ ] Manually tested
- [ ] Edge cases considered
- [ ] Documentation updated
- [ ] Lessons captured (if applicable)

### Before Deploying
- [ ] All tests pass
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Rollback plan exists
- [ ] Monitoring in place

---

## Emergency Procedures

### Production Bug
1. **Assess severity** (Critical/High/Medium/Low)
2. **If Critical:** Immediate rollback, then fix
3. **If High:** Fix within 24 hours
4. **Document in `tasks/lessons.md`**
5. **Add regression test**

### Failed Deployment
1. **Check build logs** for specific error
2. **Fix in new commit** (don't force push)
3. **Verify locally first**
4. **Redeploy**
5. **Document root cause**

### Data Issue
1. **STOP - Don't make it worse**
2. **Assess blast radius**
3. **Create backup if possible**
4. **Fix with migration**
5. **Verify in staging first**
6. **Document thoroughly**

---

## Success Metrics

### Code Quality
- Zero security vulnerabilities
- < 5% test failure rate
- All TypeScript strict mode
- No console errors in production

### Velocity
- Features ship within estimated time
- < 10% scope creep per feature
- < 5% rollback rate
- Quick bug turnaround (< 24h for High)

### Learning
- Lessons documented after corrections
- Mistake rate decreases over time
- Proactive issue prevention
- Knowledge sharing in docs

---

## Remember

> **Simplicity First** - Make every change as simple as possible
> **No Laziness** - Find root causes, no temporary fixes
> **Minimal Impact** - Only touch what's necessary
> **Verify Before Done** - Prove it works before marking complete
> **Capture Lessons** - Update lessons.md after every correction

**The goal:** Ship fast, ship right, ship learning.

---

**This is a living document. Update it as we learn better ways to work.**
