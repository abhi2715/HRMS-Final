# Application Workflows

This document outlines the operational lifecycles and role-based workflows within the HRMS.

## 1. Role-Based Workflows

### Admin Workflow
The Admin is responsible for system configuration and organizational setup.
1. **Onboarding:** Creates Users and assigns initial passwords and roles.
2. **Organization Structure:** Creates Teams and assigns a `TEAM_LEAD`.
3. **Configuration:** Sets up Leave Types (e.g., configuring Annual Leave at 20 days).
4. **Payroll:** Monthly execution of salary generation for all employees.
5. **Auditing:** Monitors system integrity via the read-only Audit Logs.

### CEO Workflow
The CEO requires a high-level overview of company performance.
1. **Oversight:** Views aggregate attendance and task completion metrics across the entire organization.
2. **Team Insight:** Drills down into specific team performance, viewing team leads and their respective metrics.
3. **No Direct Mutation:** The CEO primarily interacts with read-only analytical dashboards and cannot directly modify an employee's daily attendance or personal tasks.

### Team Lead Workflow
The Team Lead bridges management and daily execution.
1. **Task Delegation:** Creates Tasks and assigns them to specific employees on their team.
2. **Approval Pipeline:** Reviews and Approves/Rejects leave requests submitted by their team members.
3. **Progress Tracking:** Monitors the Daily Progress reports submitted by team members and reviews the aggregated Weekly Reports.
4. **Analytics:** Views team-scoped analytics to identify bottlenecks.

### Employee Workflow
The Employee focuses on individual execution and HR requirements.
1. **Daily Routine:** Logs into the system and clicks "Check In" at the start of the day, and "Check Out" at the end.
2. **Task Execution:** Updates the status (Backlog -> In Progress -> Done) and percentage progress of assigned tasks.
3. **Leave Requests:** Submits leave applications and views remaining balances.
4. **Payroll Visibility:** Securely downloads/views historical salary slips.

---

## 2. Entity Lifecycles

### Task Lifecycle
1. **Creation:** Admin, CEO, or Team Lead creates a task, optionally assigning it a parent task ID to create a subtask.
2. **Assignment:** Assigned to a specific Employee.
3. **Execution:** Employee updates the status to `IN_PROGRESS`.
4. **Progress Updates:** Progress increments from `0%` to `100%`. If it's a parent task, progress is an aggregate of child tasks.
5. **Completion:** Status marked as `DONE`.

### Leave Request Lifecycle
1. **Submission:** Employee applies for leave (specifies dates and type).
2. **Validation:** System synchronously checks for overlapping approved leaves and verifies the user has sufficient balance.
3. **Pending:** Request enters `PENDING` state.
4. **Review:** Team Lead views the request.
5. **Decision:** 
   - If `REJECTED`, the flow ends.
   - If `APPROVED`, the system deducts the requested days from the Employee's `LeaveBalance` for that specific year and type.

### Attendance Lifecycle
1. **Check-In:** Employee records start time. System sets status to `PRESENT` or `LATE` based on organizational rules (e.g., after 9:30 AM).
2. **Check-Out:** Employee records end time.
3. **Correction:** If an employee forgets to check out, they can submit an Attendance Correction request to the Admin/Team Lead to retroactively update the time.

### Weekly Report Lifecycle
1. **Daily Inputs:** Employees log `DailyProgress` entries linking to specific tasks.
2. **Aggregation:** At the end of the week, the system (or Employee) generates a `WeeklyReport` aggregating all daily progress.
3. **Review:** Team Lead reviews the weekly report to assess team velocity.
