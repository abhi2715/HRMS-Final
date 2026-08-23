# Database Architecture

The HRMS uses MongoDB as its primary datastore, interacted with via Mongoose. The schema design emphasizes normalization for core entities (Users, Teams) and denormalization for read-heavy operations (Analytics).

## Core Collections

### 1. Users
- **Fields:** `firstName`, `lastName`, `email`, `password` (hashed), `role` (Enum), `jobTitle`, `isActive`, `team` (ObjectId), `joinDate`.
- **Indexes:** Unique index on `email`.
- **Security:** The `password` field is excluded from default queries via `select: false`.

### 2. Teams
- **Fields:** `name`, `description`, `lead` (ObjectId ref User), `isActive`.
- **Relationships:** One-to-many with Users.

### 3. Tasks
- **Fields:** `title`, `description`, `priority`, `status`, `assignedTo` (ObjectId ref User), `team` (ObjectId ref Team), `parentTask` (ObjectId ref Task), `progress`.
- **Hierarchy:** Implements the Materialized Path/Parent Reference pattern to support subtasks.
- **Indexes:** Compound indexes on `assignedTo` + `status`, and `team` + `status` for fast dashboard querying.

### 4. Attendance
- **Fields:** `user` (ObjectId ref User), `date` (Date), `checkIn` (Date), `checkOut` (Date), `status` (Enum).
- **Validation:** A user can only have one attendance record per day.
- **Indexes:** Compound unique index on `user` + `date`.

### 5. Leave Management
Split across three collections:
- **LeaveTypes:** Configuration (e.g., "Sick Leave", "Annual Leave") with `daysAllowed`.
- **LeaveBalances:** Tracks remaining days per user per leave type. (Yearly reset strategy).
- **LeaveRequests:** The actual requests containing `startDate`, `endDate`, `status` (Pending/Approved/Rejected), and `reason`.

### 6. Payroll
- **Fields:** `user` (ObjectId), `month` (Number), `year` (Number), `baseSalary`, `deductions`, `bonus`, `netSalary`.
- **Security:** Immutable historical records. Cannot be modified once issued (append-only architecture).

### 7. AuditLogs
- **Fields:** `action` (Enum), `performedBy` (ObjectId), `targetId` (String), `details` (JSON), `ipAddress`.
- **Purpose:** Compliance tracking. Cannot be deleted by anyone, including Admins.

## Deletion Strategy
The system implements **Soft Deletion** for core organizational entities.
- Users and Teams are marked with `isActive: false` rather than being permanently deleted from the database.
- This preserves referential integrity in historical Tasks, Payroll, and Audit Logs.
- Permanent deletion is only allowed for cascading cleanup in highly controlled testing environments.
