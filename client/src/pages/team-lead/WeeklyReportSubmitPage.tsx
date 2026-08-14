import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { weeklyReportApi } from '../../services/weeklyReportApi';
import type { WeeklyReportMetrics } from '../../services/weeklyReportApi';
import toast from 'react-hot-toast';
import { ROUTES } from '../../utils/constants';
import { RefreshCw } from 'lucide-react';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

export const WeeklyReportSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const teamId = location.state?.teamId;

  // Form State
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [achievements, setAchievements] = useState('');
  const [completedWork, setCompletedWork] = useState('');
  const [incompleteWork, setIncompleteWork] = useState('');
  const [blockers, setBlockers] = useState('');
  const [employeeContributions, setEmployeeContributions] = useState('');
  const [goals, setGoals] = useState('');
  const [missedGoals, setMissedGoals] = useState('');
  const [nextWeekPriorities, setNextWeekPriorities] = useState('');
  const [risks, setRisks] = useState('');
  
  
  const [metrics, setMetrics] = useState<WeeklyReportMetrics | null>(null);
  const [isDerivingMetrics, setIsDerivingMetrics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) {
      toast.error('Team ID not found. Please navigate from the Team Reports page.');
      navigate(ROUTES.WEEKLY_REPORTS);
      return;
    }
    
    // Default to last week
    const lastWeek = subWeeks(new Date(), 1);
    const start = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(lastWeek, { weekStartsOn: 1 }); // Sunday
    
    setWeekStartDate(format(start, 'yyyy-MM-dd'));
    setWeekEndDate(format(end, 'yyyy-MM-dd'));
  }, [teamId, navigate]);

  const handleDeriveMetrics = async () => {
    if (!weekStartDate || !weekEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setIsDerivingMetrics(true);
      const data = await weeklyReportApi.getReportMetrics(teamId, weekStartDate, weekEndDate);
      setMetrics(data);
      toast.success('Metrics successfully derived from database');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to derive metrics');
    } finally {
      setIsDerivingMetrics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metrics) {
      toast.error('Please derive metrics before submitting the report');
      return;
    }

    try {
      setIsSubmitting(true);
      await weeklyReportApi.createWeeklyReport({
        teamId,
        weekStartDate,
        weekEndDate,
        achievements,
        completedWork,
        incompleteWork,
        blockers,
        employeeContributions,
        goals,
        missedGoals,
        nextWeekPriorities,
        risks,
        
        metrics,
      } as any);
      
      toast.success('Weekly report submitted successfully!');
      navigate(ROUTES.WEEKLY_REPORTS);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Submit Weekly Report" 
        
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Report Period" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Week Start Date" 
              type="date" 
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              required
            />
            <Input 
              label="Week End Date" 
              type="date" 
              value={weekEndDate}
              onChange={(e) => setWeekEndDate(e.target.value)}
              required
            />
          </div>
        </Card>

        <Card title="Auto-Derived Metrics Snapshot" padding="lg">
          <div className="mb-4 text-sm text-gray-500">
            Metrics are automatically calculated from the Task system for the selected date range. They cannot be fabricated.
          </div>
          
          {metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="text-indigo-900 text-sm font-medium">Tasks Completed</div>
                <div className="text-2xl font-bold text-indigo-700">{metrics.tasksCompleted}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="text-amber-900 text-sm font-medium">Tasks Pending</div>
                <div className="text-2xl font-bold text-amber-700">{metrics.tasksPending}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="text-red-900 text-sm font-medium">Overdue Tasks</div>
                <div className="text-2xl font-bold text-red-700">{metrics.overdueTasks}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <div className="text-emerald-900 text-sm font-medium">Completion Rate</div>
                <div className="text-2xl font-bold text-emerald-700">{metrics.completionRate}%</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 mb-4">
              Click the button below to fetch metrics from the database.
            </div>
          )}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDeriveMetrics}
            isLoading={isDerivingMetrics}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            {metrics ? 'Recalculate Metrics' : 'Derive Metrics from System'}
          </Button>
        </Card>

        <Card title="Narrative & Context" padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                required
                placeholder="What were the biggest wins this week?"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completed Work</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={completedWork}
                  onChange={(e) => setCompletedWork(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incomplete Work</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  value={incompleteWork}
                  onChange={(e) => setIncompleteWork(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blockers & Impediments</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={2}
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Contributions</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                rows={2}
                value={employeeContributions}
                onChange={(e) => setEmployeeContributions(e.target.value)}
                required
                placeholder="Highlight specific team member efforts..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals Met</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals Missed</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  value={missedGoals}
                  onChange={(e) => setMissedGoals(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Priorities</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  value={nextWeekPriorities}
                  onChange={(e) => setNextWeekPriorities(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risks</label>
                <textarea 
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.WEEKLY_REPORTS)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!metrics}>
            Submit Weekly Report
          </Button>
        </div>
      </form>
    </div>
  );
};
