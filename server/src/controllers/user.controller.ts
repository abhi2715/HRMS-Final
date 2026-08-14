import { Request, Response } from 'express';
import User from '../models/User.model';
import Team from '../models/Team.model';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/AuditLog.model';
import { UserRole } from '../../../shared/types/enums';

// List users with pagination and filtering
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const team = req.query.team as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (team) query.team = team;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens')
        .populate('team', 'name manager')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Create a new employee
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, jobTitle, team } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // hashed in pre-save hook
      role: role || UserRole.EMPLOYEE,
      jobTitle,
      team: team || undefined,
    });

    const userObj = newUser.toJSON();
    delete (userObj as any).password;

    await logAudit({
      action: AuditAction.USER_CREATED,
      performedBy: req.user!._id,
      targetUser: newUser._id,
      details: { role: newUser.role, email: newUser.email },
    });

    res.status(201).json(userObj);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Get single user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens')
      .populate('team', 'name manager');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user details & role
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, jobTitle, role, isActive, team } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updates: Record<string, any> = {};
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    
    if (role && role !== user.role) {
      updates.oldRole = user.role;
      updates.newRole = role;
      user.role = role;
      
      await logAudit({
        action: AuditAction.ROLE_CHANGED,
        performedBy: req.user!._id,
        targetUser: user._id,
        details: updates,
      });
    }

    if (isActive !== undefined && isActive !== user.isActive) {
      user.isActive = isActive;
      await logAudit({
        action: isActive ? AuditAction.USER_ACTIVATED : AuditAction.USER_DEACTIVATED,
        performedBy: req.user!._id,
        targetUser: user._id,
      });
    }

    if (team !== undefined && String(team) !== String(user.team)) {
      user.team = team || undefined; // If empty string passed, unset team
      await logAudit({
        action: team ? AuditAction.EMPLOYEE_ASSIGNED_TO_TEAM : AuditAction.EMPLOYEE_REMOVED_FROM_TEAM,
        performedBy: req.user!._id,
        targetUser: user._id,
        targetTeam: team || undefined,
      });
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .select('-password -refreshTokens')
      .populate('team', 'name manager');

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};
