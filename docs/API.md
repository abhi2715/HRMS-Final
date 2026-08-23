# API Documentation

Base URL: `/api/v1`

All protected endpoints require an `Authorization: Bearer <token>` header.

---

## Authentication (`/auth`)

### `POST /auth/login`
- **Desc**: Authenticate user and receive JWT.
- **Auth**: Public
- **Body**: `{ "email": "user@hrms.test", "password": "password" }`
- **Returns**: `{ "token": "jwt...", "user": { ... } }`

### `POST /auth/logout`
- **Desc**: Logout user (client-side clears token, server logs event).
- **Auth**: Required
- **Returns**: `200 OK`

---

## Users (`/users`)

### `GET /users`
- **Desc**: List users.
- **Auth**: Required (`ADMIN` only)
- **Query**: `?role=EMPLOYEE&limit=100`
- **Returns**: `{ "status": "success", "data": [ ...User ] }`

### `POST /users`
- **Desc**: Create new user.
- **Auth**: Required (`ADMIN` only)
- **Body**: User object
- **Returns**: `201 Created`

### `GET /users/me`
- **Desc**: Get current user profile.
- **Auth**: Required (All roles)
- **Returns**: Current User object

---

## Teams (`/teams`)

### `GET /teams`
- **Desc**: Get all teams.
- **Auth**: Required (`ADMIN`, `CEO`, `TEAM_LEAD`)
- **Returns**: Array of Team objects

### `POST /teams`
- **Desc**: Create a new team.
- **Auth**: Required (`ADMIN` only)
- **Body**: `{ "name": "Dev", "description": "...", "lead": "userId" }`
- **Returns**: `201 Created`

---

## Tasks (`/tasks`)

### `GET /tasks`
- **Desc**: List tasks based on role visibility.
- **Auth**: Required (All roles)
- **Query**: `?status=in_progress&priority=high`
- **Returns**: Array of Task objects

### `POST /tasks`
- **Desc**: Create a task.
- **Auth**: Required (`ADMIN`, `CEO`, `TEAM_LEAD`)
- **Body**: Task object details
- **Returns**: `201 Created`

### `PUT /tasks/:id`
- **Desc**: Update a task (status, progress).
- **Auth**: Required
- **Note**: Employees can only update progress/status of their assigned tasks.

---

## Attendance (`/attendance`)

### `POST /attendance/check-in`
- **Desc**: Log today's check-in timestamp.
- **Auth**: Required (All roles)
- **Returns**: `201 Created`

### `POST /attendance/check-out`
- **Desc**: Log today's check-out timestamp.
- **Auth**: Required (All roles)
- **Returns**: `200 OK`

### `GET /attendance/history`
- **Desc**: Get personal attendance history.
- **Auth**: Required (All roles)
- **Query**: `?month=8&year=2026`
- **Returns**: Array of Attendance records

---

## Leave Management (`/leave`)

### `GET /leave/my-balances`
- **Desc**: Get personal leave balances.
- **Auth**: Required (All roles)
- **Returns**: Array of LeaveBalance objects

### `POST /leave/apply`
- **Desc**: Apply for leave.
- **Auth**: Required (All roles)
- **Body**: `{ "leaveTypeId": "...", "startDate": "...", "endDate": "...", "reason": "..." }`
- **Returns**: `201 Created`

### `PUT /leave/:id/process`
- **Desc**: Approve or reject a leave request.
- **Auth**: Required (`ADMIN`, `TEAM_LEAD`)
- **Body**: `{ "status": "approved", "adminComment": "..." }`

---

## Payroll (`/payroll`)

### `GET /payroll/my-salary`
- **Desc**: Get personal salary history.
- **Auth**: Required (All roles)
- **Returns**: Array of Payroll records (strictly isolated to `req.user.id`)

### `POST /payroll`
- **Desc**: Create a salary record for an employee.
- **Auth**: Required (`ADMIN` only)
- **Body**: Payroll record details
- **Returns**: `201 Created`

---

## Analytics (`/analytics`)

### `GET /analytics/organization`
- **Desc**: High-level metrics for the entire org (headcount, attendance %, active tasks).
- **Auth**: Required (`ADMIN`, `CEO`)

### `GET /analytics/team`
- **Desc**: Metrics scoped to the user's specific team.
- **Auth**: Required (`TEAM_LEAD`)

### `GET /analytics/employee`
- **Desc**: Personal performance metrics.
- **Auth**: Required (All roles)

---

## Audit Logs (`/audit`)

### `GET /audit`
- **Desc**: Retrieve system audit logs.
- **Auth**: Required (`ADMIN` only)
- **Query**: `?action=USER_CREATED&limit=50`
- **Returns**: Array of AuditLog records
