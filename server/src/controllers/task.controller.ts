import { Request, Response } from 'express';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/AuditLog.model';
import { UserRole, TaskStatus } from '../../../shared/types/enums';

// Valid state transitions
const validTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]: [TaskStatus.ASSIGNED, TaskStatus.CANCELLED],
  [TaskStatus.ASSIGNED]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.REVIEW]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [],
  [TaskStatus.CANCELLED]: [],
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { status, priority, assignedTo, team, createdBy, overdue, parentTask, search, tags } = req.query;

    const query: any = {};
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (userRole === UserRole.EMPLOYEE) {
      query.assignedTo = userId;
    } else if (userRole === UserRole.TEAM_LEAD) {
      query.$or = [{ createdBy: userId }, { assignedTo: userId }, { assigner: userId }];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && userRole !== UserRole.EMPLOYEE) query.assignedTo = assignedTo;
    if (team) query.team = team;
    if (createdBy) query.createdBy = createdBy;
    if (parentTask) query.parentTask = parentTask;
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] };
    }
    if (tags) {
      const tagsArray = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagsArray };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('createdBy', 'firstName lastName email role')
        .populate('assigner', 'firstName lastName email role')
        .populate('assignedTo', 'firstName lastName email role')
        .populate('team', 'name')
        .populate('parentTask', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    res.json({
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assigner', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('team', 'name')
      .populate('comments.author', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const userRole = req.user!.role;
    const userId = req.user!.id;
    if (userRole === UserRole.EMPLOYEE && task.assignedTo._id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only view tasks assigned to you' });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, status, startDate, dueDate, assignedTo, team, progress, parentTask, tags, attachments } = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required' });
    }

    if (userRole === UserRole.EMPLOYEE) {
      return res.status(403).json({ message: 'Employees cannot assign tasks' });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee || !assignee.isActive) {
      return res.status(400).json({ message: 'Assigned user not found or inactive' });
    }

    if (userRole === UserRole.CEO && assignee.role !== UserRole.TEAM_LEAD) {
      return res.status(403).json({ message: 'CEO can only assign tasks to Team Leads' });
    }

    if (userRole === UserRole.TEAM_LEAD) {
      const leadUser = await User.findById(userId);
      if (assignee.team?.toString() !== leadUser?.team?.toString()) {
        return res.status(403).json({ message: 'Team Leads can only assign tasks to their own team members' });
      }
    }

    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (!parent) return res.status(400).json({ message: 'Parent task not found' });
    }

    const initialStatus = status || TaskStatus.BACKLOG;

    const newTask = await Task.create({
      title,
      description,
      priority,
      status: initialStatus,
      startDate,
      dueDate,
      assigner: userId,
      assignedTo,
      team: team || assignee.team || undefined,
      parentTask: parentTask || undefined,
      createdBy: userId,
      progress: progress || 0,
      tags: tags || [],
      attachments: attachments || [],
      statusHistory: [{
        status: initialStatus,
        changedBy: userId,
        timestamp: new Date(),
        reason: 'Task created',
      }]
    });

    await logAudit({
      action: AuditAction.TASK_CREATED,
      performedBy: userId,
      targetUser: assignedTo,
      targetTask: newTask._id,
      targetTeam: newTask.team,
      details: { title, priority: newTask.priority },
    });

    const populated = await Task.findById(newTask._id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assigner', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('team', 'name');

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = req.user!.id;
    const { title, description, priority, status, startDate, dueDate, assignedTo, team, progress, tags, attachments, statusReason } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const changes: Record<string, any> = {};

    if (title !== undefined) { task.title = title; changes.title = title; }
    if (description !== undefined) task.description = description;
    if (priority !== undefined && priority !== task.priority) {
      changes.oldPriority = task.priority;
      changes.newPriority = priority;
      task.priority = priority;
    }
    if (startDate !== undefined) task.startDate = startDate;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (progress !== undefined) task.progress = progress;
    if (team !== undefined) task.team = team || undefined;
    if (tags !== undefined) task.tags = tags;
    if (attachments !== undefined) task.attachments = attachments;

    if (status !== undefined && status !== task.status) {
      if (!validTransitions[task.status as TaskStatus].includes(status as TaskStatus) && req.user!.role !== UserRole.ADMIN) {
        return res.status(400).json({ message: `Invalid state transition from ${task.status} to ${status}` });
      }

      changes.oldStatus = task.status;
      changes.newStatus = status;
      task.status = status;

      task.statusHistory.push({
        status: status as TaskStatus,
        changedBy: userId as any,
        timestamp: new Date(),
        reason: statusReason || undefined,
      });

      if (status === TaskStatus.COMPLETED) {
        task.completedAt = new Date();
        task.progress = 100;
      } else {
        task.completedAt = undefined;
      }

      await logAudit({
        action: AuditAction.TASK_STATUS_CHANGED,
        performedBy: userId,
        targetTask: task._id,
        targetUser: task.assignedTo,
        details: changes,
      });
    }

    if (assignedTo !== undefined && assignedTo !== task.assignedTo.toString()) {
      if (req.user!.role === UserRole.EMPLOYEE) {
        return res.status(403).json({ message: 'Employees cannot reassign tasks' });
      }

      const newAssignee = await User.findById(assignedTo);
      if (!newAssignee || !newAssignee.isActive) {
        return res.status(400).json({ message: 'New assignee not found or inactive' });
      }

      await logAudit({
        action: AuditAction.TASK_REASSIGNED,
        performedBy: userId,
        targetTask: task._id,
        targetUser: assignedTo,
        details: {
          oldAssignee: task.assignedTo.toString(),
          newAssignee: assignedTo,
        },
      });

      task.assignedTo = assignedTo;
      task.assigner = userId as any;
    }

    await task.save();

    if (Object.keys(changes).length > 0 && !changes.oldStatus && !changes.oldAssignee) {
      await logAudit({
        action: AuditAction.TASK_UPDATED,
        performedBy: userId,
        targetTask: task._id,
        details: changes,
      });
    }

    const updated = await Task.findById(taskId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assigner', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('team', 'name')
      .populate('statusHistory.changedBy', 'firstName lastName email');

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = req.user!.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await logAudit({
      action: AuditAction.TASK_DELETED,
      performedBy: userId,
      targetTask: task._id,
      targetUser: task.assignedTo,
      details: { title: task.title },
    });

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({
      author: userId as any,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    await logAudit({
      action: AuditAction.TASK_COMMENT_ADDED,
      performedBy: userId,
      targetTask: task._id,
      details: { commentPreview: text.substring(0, 100) },
    });

    const updated = await Task.findById(taskId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assigner', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('team', 'name')
      .populate('comments.author', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName email');

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};
