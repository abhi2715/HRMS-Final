import { Request, Response } from 'express';
import User from '../models/User.model';
import Team from '../models/Team.model';
import AuditLog from '../models/AuditLog.model';
import { UserRole } from '../../../shared/types/enums';

export const getOrganizationStats = async (req: Request, res: Response) => {
  try {
    const [
      totalEmployees,
      totalTeams,
      activeUsers,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      User.countDocuments({ isActive: true }),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'firstName lastName')
        .populate('targetUser', 'firstName lastName')
        .populate('targetTeam', 'name'),
    ]);

    res.json({
      totalEmployees,
      totalTeams,
      activeUsers,
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching organization stats', error: error.message });
  }
};

export const getOrganizationHierarchy = async (req: Request, res: Response) => {
  try {
    // 1. Get CEO (assuming one CEO at the top)
    const ceos = await User.find({ role: UserRole.CEO, isActive: true })
      .select('firstName lastName email jobTitle role');
    
    // 2. Get all active teams with managers
    const teams = await Team.find({ isActive: true })
      .populate('manager', 'firstName lastName email jobTitle role');
      
    // 3. Get all active employees (excluding CEOs to prevent duplication if they are somehow tied to a team)
    const employees = await User.find({ role: { $ne: UserRole.CEO }, isActive: true })
      .select('firstName lastName email jobTitle role team');

    // Build the tree
    const hierarchy = {
      type: 'root',
      ceos: ceos,
      teams: teams.map(team => {
        // Find members of this team
        const teamMembers = employees.filter(emp => emp.team && emp.team.toString() === team._id.toString());
        
        // Exclude the manager from the members list if they are in there
        const managerId = (team.manager as any)?._id?.toString();
        const regularMembers = teamMembers.filter(emp => emp._id.toString() !== managerId);

        return {
          _id: team._id,
          name: team.name,
          manager: team.manager,
          members: regularMembers,
        };
      })
    };

    res.json(hierarchy);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching organization hierarchy', error: error.message });
  }
};
