# Sri Groups ERP & CRM

Enterprise sales pipeline, lead management, staff sales activity tracking, and call follow-up system for **Sri Groups**.

---

## 1. Architecture & Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & Database**: Firebase Authentication and Cloud Firestore (Enterprise DB).
- **Security & Authorization**: Attribute-Based Access Control (ABAC) in `firestore.rules` and server-side authentication validations.
- **Data Blueprint**: Formal intermediate schema documented in `firebase-blueprint.json`.
- **Audit Logging**: Immutable, append-only security logs in `/audit_logs`.

---

## 2. Role-Based Access Control (RBAC)

### Admin (Single Administrative Account)
- **Primary Admin**: `rcssri14@gmail.com`
- **Capabilities**:
  - Add, edit, assign, and delete company leads.
  - View all leads and sales activities across all staff.
  - Create and deactivate staff accounts with lead reassignment options.
  - Reset staff passwords securely.
  - Company-wide reports and conversion rate metrics.
  - Export filtered leads and reports to CSV / Excel.
  - Configure lead pipeline statuses and company settings.
  - View immutable system audit history.

### Staff
- **Sign-in**: Individual username and secure password (hashed with PBKDF2 + salt).
- **Capabilities**:
  - View **only** leads assigned to them (`assignedStaffId == uid`).
  - Click-to-call direct dialer links.
  - Record call outcomes, discussion summaries, and customer requirements.
  - Update lead pipeline status and schedule next follow-up date and time.
  - Manage their personal follow-ups (Today, Overdue, Upcoming, Completed).
  - Review personal sales conversion performance.
  - Change their password.
- **Restrictions (Enforced by Firestore Rules)**:
  - Cannot add new leads or delete existing leads.
  - Cannot view other staff members' leads.
  - Cannot modify assignment fields or system settings.

---

## 3. Lead Status Pipeline

1. **New Lead** (Blue)
2. **Not Contacted** (Slate)
3. **Call Connected** (Cyan)
4. **Not Reachable** (Amber)
5. **Call Back Requested** (Orange)
6. **Follow-up Pending** (Indigo)
7. **Interested** (Violet)
8. **Requirement Collected** (Teal)
9. **Proposal Sent** (Sky)
10. **Negotiation** (Purple)
11. **Converted** (Emerald — Triggers victory celebration)
12. **Not Interested** (Rose)
13. **Lost Lead** (Red)

---

## 4. Security Rules Summary

- `/admins/{adminId}`: Read accessible only to authenticated users; write restricted to bootstrap admin email (`rcssri14@gmail.com`).
- `/leads/{leadId}`: Read allowed only for Admins or the assigned staff member. Writes restricted to Admins for creation/deletion; Staff permitted only to modify call progression fields (`status`, `lastContactDate`, `lastCallOutcome`, `nextFollowUpDate`, `additionalNotes`).
- `/call_activities/{id}`: Permanent, append-only logs. Once logged, past calls cannot be modified or erased by staff.
- `/audit_logs/{id}`: Immutable audit trails (`allow update, delete: if false`).

---

## 5. Deployment & Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
