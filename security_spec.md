# Security Specification & Threat Model — Sri Groups ERP & CRM

## 1. Data Invariants

1. **Strict RBAC & Privilege Isolation**:
   - Exactly one Admin account exists (identified by administrative record in `/admins/{adminId}` and verified email `rcssri14@gmail.com`).
   - Staff accounts cannot create new leads, delete leads, or modify any other staff member's leads.
   - Staff accounts can only view and update leads where `assignedStaffId == request.auth.uid`.
   - Staff can never modify assignment fields (`assignedStaffId`, `assignedStaffName`), creation timestamps, or creator information.

2. **Audit Log Immutability**:
   - Audit records in `/audit_logs` are append-only.
   - No user (neither Admin nor Staff) can update or delete existing audit entries (`allow update, delete: if false`).

3. **Call Activity Non-Repudiation**:
   - Once a call activity record is created in `/call_activities`, it cannot be modified or deleted by staff (`allow update, delete: if false` or admin-only).
   - Staff can only log a call for a lead that is assigned to them (`staffId == request.auth.uid`).

4. **Status Pipeline Integrity**:
   - Only valid lead pipeline statuses can be assigned.
   - Staff can only transition status when executing a verified call activity or follow-up update.

5. **PII and Account Protection**:
   - Deactivated staff (`isActive == false`) immediately lose read and write access to all resources.
   - Password hashes / credential fields are strictly shielded from public reads.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Payload 1 (Privilege Escalation)**: Unauthenticated or staff user attempts to create an `/admins/{uid}` document to promote themselves.
2. **Payload 2 (Staff Unauthorized Lead Creation)**: Staff attempts to write directly to `/leads/{leadId}` with `leadId: "SRI-LD-9999"` (only Admin can create leads).
3. **Payload 3 (Unauthorized Lead Deletion)**: Staff attempts to delete `/leads/{leadId}` directly.
4. **Payload 4 (Staff Cross-Tenant Lead Read)**: Staff A queries `/leads/{leadId}` where `assignedStaffId` is Staff B.
5. **Payload 5 (Staff Self-Reassignment)**: Staff modifies `assignedStaffId` of an unassigned lead to their own UID.
6. **Payload 6 (Shadow Field Injection)**: Staff includes unexpected properties like `isSystemAdmin: true` or `role: "admin"` in a lead update.
7. **Payload 7 (Audit Log Tampering)**: User attempts to modify or delete a record in `/audit_logs/{id}` to erase activity history.
8. **Payload 8 (Call Activity Deletion)**: Staff tries to erase an unflattering call note or mistake from `/call_activities/{id}`.
9. **Payload 9 (Deactivated Staff Access)**: A user marked `isActive: false` attempts to list leads or submit call logs.
10. **Payload 10 (ID Poisoning Attack)**: Attacker sends document writes using 2KB garbage characters for `{leadId}`.
11. **Payload 11 (Oversized Payload / Denial-of-Wallet)**: Write request with 500KB text in `additionalNotes` exceeding maximum limits.
12. **Payload 12 (Impersonation Call Log)**: Staff A submits a call log with `staffId` set to Staff B's UID.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

All 12 attacks are targeted against the Firestore security rules. Every single payload in the Dirty Dozen must evaluate to `PERMISSION_DENIED`.
