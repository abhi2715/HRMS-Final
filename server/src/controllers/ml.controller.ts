import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import Task from '../models/Task.model';
import User from '../models/User.model';
import Leave from '../models/Leave.model';

export const getAttritionRisk = async (req: Request, res: Response) => {
  try {
    // This is a mocked heuristic ML endpoint for demonstration purposes.
    // In a real system, this would call a Python/FastAPI microservice running XGBoost/PyTorch.
    
    const employees = await User.find({ role: 'employee' });
    const risks = [];

    for (const emp of employees) {
      const empId = emp._id;
      
      // Feature 1: Overdue tasks
      const overdueTasks = await Task.countDocuments({ 
        assignedTo: empId, 
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() }
      });

      // Feature 2: High leave frequency
      const recentLeaves = await Leave.countDocuments({
        employee: empId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      // Mock ML calculation
      let riskScore = 0.1; // Base risk
      if (overdueTasks > 2) riskScore += 0.4;
      if (recentLeaves > 3) riskScore += 0.3;
      if (riskScore > 0.95) riskScore = 0.95;

      let riskLevel = 'Low';
      if (riskScore > 0.7) riskLevel = 'High';
      else if (riskScore > 0.4) riskLevel = 'Medium';

      risks.push({
        employeeId: empId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: (emp as any).department || 'Engineering',
        riskScore,
        riskLevel,
        factors: [
          overdueTasks > 2 ? 'High overdue tasks' : '',
          recentLeaves > 3 ? 'Frequent recent leaves' : ''
        ].filter(Boolean)
      });
    }

    return sendSuccess(res, { predictions: risks }, 'Attrition risk predicted successfully');
  } catch (error: any) {
    console.error('Error predicting attrition risk:', error);
    // Return empty array instead of failing so UI doesn't break
    return sendSuccess(res, { predictions: [] }, 'Attrition risk prediction failed (fallback)');
  }
};
