import { Request, Response } from 'express';
import Team from '../models/Team.model';
import User from '../models/User.model';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/AuditLog.model';
import { UserRole } from '../../../shared/types/enums';
import mongoose from 'mongoose';

// Get all teams
export const getTeams = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // We can also aggregate to get member counts, but let's keep it simple or do a lookup
    const teams = await Team.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'team',
          as: 'members'
        }
      },
      {
        $addFields: {
          memberCount: { $size: '$members' }
        }
      },
      {
        $project: {
          members: 0 // don't send all members in the list view
        }
      },
      { $sort: { name: 1 } }
    ]);

    // Populate manager details
    await Team.populate(teams, { path: 'manager', select: 'firstName lastName email role' });

    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// Create a team
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description, manager } = req.body;

    const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Verify manager exists and is a Team Lead or can be one
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) return res.status(400).json({ message: 'Manager not found' });
      // Optional: Auto-promote to team lead if not already?
      if (managerUser.role === UserRole.EMPLOYEE) {
         managerUser.role = UserRole.TEAM_LEAD;
         await managerUser.save();
      }
    }

    const team = await Team.create({ name, description, manager });

    await logAudit({
      action: AuditAction.TEAM_CREATED,
      actor: req.user!._id,
      entity: 'Team',
      entityId: team._id,
      metadata: { name: team.name },
    });

    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

// Get single team
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('manager', 'firstName lastName email role');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const members = await User.find({ team: team._id, isActive: true })
      .select('firstName lastName email jobTitle role');

    res.json({ ...team.toObject(), members });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};

// Update team
export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { name, description, manager, isActive } = req.body;
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: teamId } });
      if (existingTeam) return res.status(400).json({ message: 'Team name already exists' });
      team.name = name;
    }

    if (description !== undefined) team.description = description;

    if (manager !== undefined && String(manager) !== String(team.manager)) {
      team.manager = manager || undefined;
      if (manager) {
        const managerUser = await User.findById(manager);
        if (managerUser) {
          if (managerUser.role === UserRole.EMPLOYEE) {
             managerUser.role = UserRole.TEAM_LEAD;
          }
          // Ensure the manager is actually part of this team
          managerUser.team = team._id as any;
          await managerUser.save();
        }
      }

      await logAudit({
        action: manager ? AuditAction.TEAM_LEAD_ASSIGNED : AuditAction.TEAM_LEAD_REMOVED,
        actor: req.user!._id,
        entity: 'Team',
        entityId: team._id,
        metadata: { manager }
      });
    }

    if (isActive !== undefined && isActive !== team.isActive) {
      if (isActive === false) {
        const activeMembersCount = await User.countDocuments({ team: teamId, isActive: true });
        if (activeMembersCount > 0) {
          return res.status(400).json({ 
            message: `Cannot deactivate team with ${activeMembersCount} active employee(s). Please reassign them first.` 
          });
        }
      }
      
      team.isActive = isActive;
      await logAudit({
        action: isActive ? AuditAction.TEAM_ACTIVATED : AuditAction.TEAM_DEACTIVATED,
        actor: req.user!._id,
        entity: 'Team',
        entityId: team._id,
      });
    }

    await team.save();

    await logAudit({
      action: AuditAction.TEAM_UPDATED,
      actor: req.user!._id,
      entity: 'Team',
      entityId: team._id,
    });

    const updatedTeam = await Team.findById(teamId).populate('manager', 'firstName lastName email role');
    res.json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
};
