# DealPress Product Brain

**Last Updated:** 2026-02-16
**Version:** 1.0
**Target ARR:** $250K+ within 12 months

---

## 🎯 Product Vision (North Star)

**Product:** DealPress
**Category:** Deal Desk & Approval Automation for B2B SaaS
**Target Customer:** RevOps, Finance, Deal Desk, and Sales Leadership at $10M–$500M ARR SaaS companies

### Mission
Reduce deal cycle time and approval friction by 30–50% while improving margin governance and compliance control.

### Core Thesis
Most SaaS companies:
- ❌ Run approvals in Slack + email
- ❌ Have no structured pricing governance
- ❌ Lack margin visibility
- ❌ Create inconsistent exceptions
- ❌ Lose revenue to discount chaos

**DealPress becomes:** The "Stripe for Deal Approvals" — programmable, structured, and analytics-first.

---

## 👥 ICP Definition

### ✅ Ideal Customer Profile (ICP)
- 50–500 employees
- B2B SaaS
- Multi-product pricing
- Discounting allowed but controlled
- Has RevOps or Finance function
- Currently using Salesforce / HubSpot
- $10M–$500M ARR

### ❌ Anti-ICP
- < $5M ARR startups
- PLG-only self-serve businesses
- No discounting process
- No CRM
- Consumer products

**Agent Directive:** Reject feature requests that optimize for anti-ICP.

---

## 🏛️ Core Product Pillars (Non-Negotiables)

### Pillar 1: Structured Deal Object
Every deal has:
- ARR
- Discount %
- Term length
- Product mix
- Margin estimate
- Risk flags

**No Slack-based approvals. Structured only.**

### Pillar 2: Approval Workflow Engine
- Dynamic approval routing
- Rules-based triggers
- Escalation logic
- Approval SLAs
- Audit trail

### Pillar 3: Margin Intelligence
- Real-time gross margin impact
- Discount guardrails
- Historical deal comparables
- Exception tracking

### Pillar 4: Speed + UX
- < 5 min setup
- 1-click approvals
- No friction for reps
- Slack-native notifications

---

## 📋 Product Principles (Decision Filters)

Use these to evaluate every feature:

| Principle | Action |
|-----------|--------|
| If it slows down reps | ❌ REJECT |
| If it improves margin visibility | ✅ PRIORITIZE |
| If it increases compliance tracking | ✅ PRIORITIZE |
| If it adds configuration complexity | 🔄 SIMPLIFY |
| If it's edge-case driven | ⬇️ DEPRIORITIZE |

**Founder Mode Guardrail:**
"Prioritize features that increase ARR or reduce churn within 90 days."
- No vanity analytics
- No dashboard bloat
- No over-engineering

---

## 🗺️ Versioned Roadmap

### v1 (Current - MVP)
- [x] Manual deal submission
- [x] Rules-based approval templates
- [x] Multi-step approval workflows
- [x] Audit log
- [x] Basic analytics dashboard
- [ ] Email notifications
- [ ] Slack notifications
- [ ] Template builder UI

### v2 (Next 90 Days)
- [ ] CRM integration (Salesforce first)
- [ ] Auto-calculated margin
- [ ] SLA tracking
- [ ] Deal approval heatmap
- [ ] Admin rule builder UI
- [ ] Approval bottleneck analytics

### v3 (6-12 Months)
- [ ] AI margin recommendations
- [ ] Deal anomaly detection
- [ ] Approval bottleneck predictions
- [ ] "Suggest optimal discount" engine
- [ ] Revenue forecasting integration

---

## 🏗️ Technical Architecture

### Current Stack
- **Frontend:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **Database:** Supabase (Postgres + Auth)
- **Payments:** Stripe
- **Email:** Resend
- **Version Control:** GitHub

### Non-Negotiables
1. ✅ Use row-level security in Supabase
2. ✅ All deal data multi-tenant isolated
3. ✅ No secrets in client
4. ✅ Log every approval action
5. ✅ No mock data in production routes

### Database Schema Principles
- Multi-tenant by `organization_id`
- Audit everything (created_at, updated_at, user actions)
- Foreign keys properly defined
- No cascading deletes on critical data
- Use enums for status fields

### API Design
- Server actions for mutations
- Server components for data fetching
- Client components only when interactive
- No over-fetching
- Proper error handling

---

## 🤖 Agent Structure

### 1️⃣ PM Agent (Product Manager)
**Role:** Product strategy, roadmap, feature prioritization

**Responsibilities:**
- Own roadmap
- Reject low-value features
- Write structured specs
- Enforce ICP alignment
- Challenge scope creep

**Decision Framework:**
For every feature request, answer:
1. **Problem Statement:** What pain does this solve?
2. **ICP Affected:** Who needs this? (ICP or anti-ICP?)
3. **User Story:** As a [role], I want [action] so that [benefit]
4. **Acceptance Criteria:** What defines "done"?
5. **Metrics Impacted:** What KPI improves?
6. **Edge Cases:** What can break?
7. **Technical Dependencies:** What needs to exist first?
8. **Rollback Plan:** How do we undo if it fails?

**Reject if:**
- Not ICP-focused
- Doesn't impact revenue/churn in 90 days
- Adds unnecessary complexity
- Optimizes for edge case

### 2️⃣ Staff Engineer Agent
**Role:** Technical architecture, code quality, scalability

**Responsibilities:**
- Review architecture decisions
- Refactor for scale
- Enforce data integrity
- Review database migrations
- Prevent technical debt

**Code Review Checklist:**
- [ ] Proper error handling
- [ ] Multi-tenant isolation enforced
- [ ] No N+1 queries
- [ ] Proper TypeScript types
- [ ] Server vs client components correct
- [ ] Security vulnerabilities checked
- [ ] Performance optimized
- [ ] Tests written (when complex logic)

**Reject if:**
- Security vulnerabilities
- Performance issues
- Poor data modeling
- Mock data in production
- Missing error handling

### 3️⃣ Red Team QA Agent
**Role:** Aggressive testing, break things, find edge cases

**Test Scenarios:**

**1. Malicious Rep**
- Submit negative margin deal
- Edit deal after approval
- Circumvent workflow
- Delete critical data

**2. Edge Case Admin**
- Change rules mid-deal
- Delete approval stage while in use
- Add overlapping conditions
- Create circular dependencies

**3. Fat-Finger User**
- 999% discount
- Blank required fields
- Invalid ARR values
- Special characters in names
- Extremely long text

**4. Concurrency**
- Two approvers act simultaneously
- Approval and rejection collision
- Race conditions in status updates

**5. Multi-Tenant Security**
- Attempt to access other org data
- Manipulate URLs to see other deals
- JWT token manipulation
- SQL injection attempts

**Report Format:**
```
BUG: [Title]
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. ...
2. ...
Expected: ...
Actual: ...
Impact: ...
```

---

## 📊 Metrics Framework

### Primary KPIs (Optimize For)
- **Deal Cycle Time:** Submission → Final Approval (Target: < 24 hours)
- **Discount Variance:** Standard deviation from policy (Target: < 5%)
- **Approval SLA Compliance:** % within target time (Target: > 90%)
- **Margin Erosion:** Lost margin from exceptions (Target: < 2%)

### Secondary KPIs
- Rep time to submit deal (Target: < 5 min)
- Admin rule creation time (Target: < 10 min)
- Audit completeness (Target: 100%)
- User satisfaction (Target: NPS > 50)

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Net Revenue Retention

---

## 💰 Pricing Strategy

### Free Tier
- 5 approval requests/month
- 1 user
- Basic templates
- Email notifications only

### Pro Tier ($10/user/month)
- Unlimited approval requests
- Unlimited users
- Custom templates
- Slack integration
- Analytics dashboard
- SLA tracking

### Enterprise Tier (Custom)
- Everything in Pro
- CRM integration
- SSO
- Advanced analytics
- API access
- Dedicated support

---

## 🚀 Feature Spec Template

Use this for every new feature:

```markdown
# Feature: [Name]

## Problem Statement
What pain does this solve?

## ICP Affected
Who needs this? Why?

## User Story
As a [role], I want [action] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Metrics Impacted
- Primary: [KPI]
- Secondary: [KPI]

## Edge Cases
1. Case 1
2. Case 2

## Technical Dependencies
- Dependency 1
- Dependency 2

## Rollback Plan
How to undo if it fails?

## Revenue Impact (90 days)
Does this increase ARR or reduce churn?
```

---

## 🔒 Security Requirements

### Authentication
- Email/password with magic links
- OAuth (Google, Microsoft)
- Session management via Supabase Auth
- Proper CSRF protection

### Authorization
- Row-level security (RLS) on all tables
- Organization-based isolation
- Role-based access control (Admin, Member)
- API rate limiting

### Data Protection
- All PII encrypted at rest
- HTTPS only
- No sensitive data in logs
- Regular security audits
- GDPR compliant

---

## 🐛 Bug Severity Levels

### Critical (Fix Immediately)
- Data loss
- Security vulnerability
- Multi-tenant data bleed
- Payment processing broken
- App completely down

### High (Fix Within 24 Hours)
- Core feature broken
- User can't complete workflow
- Performance severely degraded
- Data inconsistency

### Medium (Fix Within 1 Week)
- Minor feature broken
- Workaround exists
- UI issues
- Non-critical edge case

### Low (Backlog)
- Cosmetic issues
- Nice-to-have improvements
- Rare edge cases
- Performance optimizations

---

## 📝 Git Commit Standards

Format: `[type]: [description]`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `style:` Formatting
- `test:` Adding tests
- `chore:` Maintenance

Example:
```
feat: Add multi-step approval template builder
fix: Prevent concurrent approval conflicts
refactor: Optimize request query performance
```

---

## 🎓 Onboarding Checklist (For New Agents)

- [ ] Read this entire CLAUDE.MD
- [ ] Understand ICP vs Anti-ICP
- [ ] Review current tech stack
- [ ] Study database schema
- [ ] Review security requirements
- [ ] Understand metrics framework
- [ ] Review bug severity levels

---

## 🔄 Document Maintenance

This document should be updated:
- When product vision changes
- When new architectural decisions are made
- When ICP evolves
- When new metrics are added
- At least monthly during active development

**Owner:** Product Lead / Founder
**Review Frequency:** Monthly
**Last Reviewed:** 2026-02-16

---

## 🚨 Red Flags (Stop Immediately)

If any agent or developer encounters these, STOP and escalate:

1. ❌ Multi-tenant data leak
2. ❌ Security vulnerability discovered
3. ❌ Data loss or corruption
4. ❌ Payment processing issue
5. ❌ Critical performance degradation
6. ❌ Architectural decision that violates principles
7. ❌ Feature that optimizes for anti-ICP

---

## 🎯 Current Focus (This Sprint)

**Week of 2026-02-16:**
1. ✅ Fix template management (DONE)
2. ✅ Fix approval tracking (DONE)
3. 🔄 Add email notifications
4. 🔄 Add Slack notifications
5. 🔄 Improve error handling
6. 🔄 Add comprehensive testing

**Next Sprint:**
1. CRM integration research
2. Margin calculation engine
3. SLA tracking
4. Customer onboarding flow

---

**Remember:** Ship fast, but ship right. Every feature should serve the ICP and move the revenue needle.
