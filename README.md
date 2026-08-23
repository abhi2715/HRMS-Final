# Premium SaaS HRMS

A modern, high-performance Human Resource Management System (HRMS) designed for comprehensive organization management, task tracking, leave processing, attendance monitoring, and payroll management. Built with the MERN stack (MongoDB, Express, React, Node.js) with strict TypeScript typing.

## Overview
This HRMS provides a scalable, role-based platform mapping directly to complex organizational hierarchies. It supports a granular permission model allowing Administrative staff, C-Level executives (CEO), Team Leads, and regular Employees to securely interact with the data they need.

## Features
* **Role-Based Access Control (RBAC):** Strict boundaries separating Admin, CEO, Team Lead, and Employee capabilities.
* **Organization & Team Management:** Hierarchical team structures with assigned leaders and members.
* **Task Management:** Parent-child task tracking, priority levels, and progress monitoring.
* **Attendance System:** Daily check-in/out tracking with monthly history and correction requests.
* **Leave Management:** Multi-tier leave requests (Sick, Casual, Annual) with balance tracking, overlapping validation, and approval workflows.
* **Payroll & Salary Tracking:** Secure historical salary records isolated per employee with organization-wide summaries.
* **Analytics Dashboards:** Highly optimized analytical views providing insights into task completion, attendance rates, and leave utilization.
* **Command Palette (Global Search):** Quick keyboard-accessible navigation and data fetching, bound by security permissions.
* **Audit Logging:** System-wide immutable logging of critical actions for compliance and accountability.
* **Responsive, Premium UI:** Built with Vite and modern React, focusing on a premium SaaS aesthetic and lightning-fast UX.

## Architecture & Documentation
Comprehensive architectural details, API specifications, and workflow logic are documented in the `docs/` directory:

- [Architecture Guide](docs/ARCHITECTURE.md) - System design, frontend/backend structures, and RBAC details.
- [API Documentation](docs/API.md) - Complete REST endpoint documentation.
- [Database Schema](docs/DATABASE.md) - MongoDB collections, relationships, and indexing strategies.
- [Workflows](docs/WORKFLOWS.md) - Core lifecycle documentation (Tasks, Leaves, Reports).
- [Deployment Guide](docs/DEPLOYMENT.md) - Environment configurations and production deployment.

## Technology Stack
**Frontend:**
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- React Router DOM
- Date-fns
- Recharts (Analytics Data Visualization)

**Backend:**
- Node.js & Express
- TypeScript
- MongoDB (Mongoose)
- JSON Web Tokens (Auth)
- Bcrypt (Password Hashing)
- Zod (Request Validation)
- Helmet & Express Rate Limit (Security)

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd HRMS
   ```

2. **Install Dependencies:**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` in both the `server` and `client` directories and adjust as necessary.

4. **Start the Development Servers:**
   ```bash
   # Terminal 1: Start Backend (from /server)
   npm run dev

   # Terminal 2: Start Frontend (from /client)
   npm run dev
   ```

## Testing
The backend is equipped with a comprehensive integration test suite verifying data integrity, authorization boundaries, and core workflows.

```bash
cd server
npm run test
```

## License
Proprietary / Closed Source. All rights reserved.
