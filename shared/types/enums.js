"use strict";
/**
 * Shared enumerations used by both client and server.
 * Single source of truth for all domain constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.AttendanceStatus = exports.LeaveType = exports.LeaveStatus = exports.TaskPriority = exports.TaskStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["CEO"] = "ceo";
    UserRole["TEAM_LEAD"] = "team_lead";
    UserRole["EMPLOYEE"] = "employee";
})(UserRole || (exports.UserRole = UserRole = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["IN_REVIEW"] = "in_review";
    TaskStatus["DONE"] = "done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "pending";
    LeaveStatus["APPROVED"] = "approved";
    LeaveStatus["REJECTED"] = "rejected";
    LeaveStatus["CANCELLED"] = "cancelled";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["CASUAL"] = "casual";
    LeaveType["SICK"] = "sick";
    LeaveType["EARNED"] = "earned";
    LeaveType["UNPAID"] = "unpaid";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["HALF_DAY"] = "half_day";
    AttendanceStatus["ON_LEAVE"] = "on_leave";
    AttendanceStatus["HOLIDAY"] = "holiday";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK"] = "task";
    NotificationType["LEAVE"] = "leave";
    NotificationType["ATTENDANCE"] = "attendance";
    NotificationType["ANNOUNCEMENT"] = "announcement";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=enums.js.map