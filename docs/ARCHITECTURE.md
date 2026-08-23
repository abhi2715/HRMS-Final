# System Architecture

This document describes the high-level architecture of the HRMS application.

## 1. High-Level Architecture
The HRMS is a Single Page Application (SPA) communicating with a monolithic REST API.

- **Frontend:** React SPA built with Vite, TypeScript, and Tailwind CSS.
- **Backend:** Express.js RESTful API running on Node.js, written in TypeScript.
- **Database:** MongoDB, interacted with via Mongoose ODM.

The application follows a standard Client-Server model. The frontend handles presentation, routing, state management, and user interactions. The backend enforces business rules, handles authentication/authorization, data validation, and persists data to MongoDB.

## 2. Frontend Architecture
The React application is structured by domain and feature, rather than strictly by technical concern.

### Directory Structure
```
client/src/
├── components/   # Reusable UI components (buttons, modals, tables)
├── contexts/     # React Context providers (AuthContext)
├── hooks/        # Custom React hooks
├── layouts/      # Page layouts (AppLayout, AuthLayout)
├── pages/        # Route components, grouped by role (admin, ceo, team-lead, employee)
├── services/     # API client functions (axios instances, endpoints)
├── shared/       # Types and enums shared with the backend
└── utils/        # Helper functions (formatting, validation)
```

### State Management
- **Global State:** React Context is used exclusively for global, app-wide state such as Authentication (`AuthContext`).
- **Local State:** Component-level state (`useState`, `useReducer`) is used for UI toggles, forms, and local data fetching.
- **Data Fetching:** Standard `useEffect` hooks combined with `services/` layer abstractions manage server state.

## 3. Backend Architecture
The Express API follows a classic Layered Architecture (Controller-Service-Repository pattern is flattened slightly into Controller-Model for simplicity).

### Directory Structure
```
server/src/
├── controllers/  # Request/Response handling, business logic execution
├── middleware/   # Express middlewares (Auth, RBAC, Error Handling, Validation)
├── models/       # Mongoose Schemas and Models
├── routes/       # Express Router definitions linking endpoints to controllers
├── shared/       # Shared TS interfaces (symlinked or mirrored with frontend)
└── utils/        # Utilities (catchAsync, AppError, response formatters)
```

### Request Lifecycle
1. **Route:** Matches URL and HTTP method.
2. **Middleware:** 
   - `authMiddleware.protect`: Validates JWT.
   - `authMiddleware.restrictTo`: Checks RBAC permissions.
   - `validateRequest`: Uses Zod to ensure the request body/query matches expected schemas.
3. **Controller:** Executes business logic, performs DB operations via Mongoose.
4. **Response:** Formats data using `sendResponse` utility or throws an `AppError` caught by the global error handler.

## 4. Authentication & Authorization
- **Authentication:** Stateless JSON Web Tokens (JWT). Upon login, the server issues a JWT. The client stores it in `localStorage` and attaches it as a Bearer token in the `Authorization` header of subsequent requests.
- **Authorization (RBAC):** Users are assigned one of four roles:
  - `ADMIN`: Full system access, IT/System configuration, user management.
  - `CEO`: High-level read access across all teams, tasks, and reports for organization oversight.
  - `TEAM_LEAD`: Write access to their specific team, its members, tasks, and leaves.
  - `EMPLOYEE`: Access strictly limited to their own records (attendance, tasks, leaves, payroll).
  
> [!IMPORTANT]
> The system implements strict Insecure Direct Object Reference (IDOR) protection. An Employee cannot access another Employee's salary by simply changing the user ID in the API request, as the backend explicitly filters queries using `req.user.id`.

## 5. Subsystem Architectures

### Organization & Teams
Teams are the central grouping mechanism. A Team has one Team Lead and multiple Employees. Changes to a team (deletions, reassignments) strictly validate that references in Tasks and Leaves are not orphaned.

### Task Management
Tasks are hierarchical. A task can be assigned to a Team or an individual Employee. Tasks can have subtasks (via parent-child references). Progress is calculated either manually or aggregated from subtasks.

### Attendance & Leaves
- **Attendance:** A daily record bound to an Employee. Supports check-in and check-out timestamps.
- **Leaves:** Employees submit requests which undergo an approval pipeline (Pending -> Approved/Rejected). Leave balances are strictly enforced and updated transactionally when a leave is approved.

### Payroll
Payroll records are immutable snapshots generated monthly by the Admin. They are strictly isolated. No one except the specific Employee and the Admin can view a salary record.

### Analytics
Analytics are dynamically aggregated using MongoDB Aggregation Pipelines to prevent large memory overhead in Node.js. Calculations for attendance percentages and task completion rates are done database-side.

### Audit Logging
Critical actions (e.g., updating salaries, changing roles, modifying team structures) automatically generate an immutable `AuditLog` entry detailing the action, the user who performed it, and the affected entity.
