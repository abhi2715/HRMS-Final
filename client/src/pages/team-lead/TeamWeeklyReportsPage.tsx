import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { weeklyReportApi } from '../../services/weeklyReportApi';
import type { WeeklyReport } from '../../services/weeklyReportApi';
import { teamsApi } from '../../services/teamsApi';
import type { Team } from '../../services/teamsApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ROUTES } from '../../utils/constants';

export const TeamWeeklyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch the team lead's team first
      const teams = await teamsApi.getTeams();
      // Assumption: team lead is leading the first team in their list (or a specific one).
      // We'll just take the first team they lead.
      const ledTeam = teams.find(() => true); // In a real app, match by user ID
      
      if (ledTeam) {
        setMyTeam(ledTeam);
        const data = await weeklyReportApi.getTeamReports(ledTeam._id);
        setReports(data);
      }
    } catch (error) {
      toast.error('Failed to load weekly reports');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<WeeklyReport>[] = [
    { 
      key: 'week', 
      header: 'Week Range', 
      render: (item) => `${format(new Date(item.weekStartDate), 'MMM dd, yyyy')} - ${format(new Date(item.weekEndDate), 'MMM dd, yyyy')}` 
    },
    { 
      key: 'metrics.tasksCompleted', 
      header: 'Tasks Completed', 
      render: (item) => item.metrics.tasksCompleted 
    },
    { 
      key: 'metrics.completionRate', 
      header: 'Completion Rate', 
      render: (item) => `${item.metrics.completionRate}%` 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {item.status}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: '', 
      render: () => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <PageHeader 
            title="Team Weekly Reports" 
          />
          <p className="text-gray-500 mt-[-1rem] mb-4">View and manage your team's weekly status reports.</p>
        </div>
        {myTeam && (
          <Button onClick={() => navigate(ROUTES.WEEKLY_REPORTS_SUBMIT, { state: { teamId: myTeam._id } })}>
            Submit New Report
          </Button>
        )}
      </div>
      
      <Card title="Past Weekly Reports" padding="none">
        <Table<WeeklyReport>
          data={reports}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          emptyStateDescription="No weekly reports found for your team."
        />
      </Card>
    </div>
  );
};
