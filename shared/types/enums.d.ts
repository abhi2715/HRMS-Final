/**
 * Shared enumerations used by both client and server.
 * Single source of truth for all domain constants.
 */
export declare enum UserRole {
    ADMIN = "admin",
    CEO = "ceo",
    TEAM_LEAD = "team_lead",
    EMPLOYEE = "employee"
}
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    IN_REVIEW = "in_review",
    DONE = "done"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare enum LeaveType {
    CASUAL = "casual",
    SICK = "sick",
    EARNED = "earned",
    UNPAID = "unpaid"
}
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    HALF_DAY = "half_day",
    ON_LEAVE = "on_leave",
    HOLIDAY = "holiday"
}
export declare enum NotificationType {
    TASK = "task",
    LEAVE = "leave",
    ATTENDANCE = "attendance",
    ANNOUNCEMENT = "announcement",
    SYSTEM = "system"
}
//# sourceMappingURL=enums.d.ts.map