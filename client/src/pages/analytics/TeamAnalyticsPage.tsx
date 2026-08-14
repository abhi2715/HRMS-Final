import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { analyticsApi } from '../../services/analyticsApi';
import type { TeamAnalytics } from '../../services/analyticsApi';
import { teamsApi } from '../../services/teamsApi';
import type { Team } from '../../services/teamsApi';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

export const TeamAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      // Ensure we have the team ID
      let currentTeamId = myTeam?._id;
      if (!currentTeamId) {
        const teams = await teamsApi.getTeams();
        const firstTeam = teams[0]; // In real prod, this matches the logged-in user's led team
        if (firstTeam) {
          setMyTeam(firstTeam);
          currentTeamId = firstTeam._id;
        } else {
          toast.error("You are not assigned to any team.");
          setIsLoading(false);
          return;
        }
      }

      if (currentTeamId) {
        const data = await analyticsApi.getTeamAnalytics(currentTeamId, startDate, endDate);
        setAnalytics(data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load team analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading team analytics...</div>;
  }

  const columns: Column<TeamAnalytics['memberContribution'][0]>[] = [
    {
      key: 'name',
      header: 'Team Member',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </div>
          <span className="font-medium">{item.firstName} {item.lastName}</span>
        </div>
      )
    },
    {
      key: 'completedCount',
      header: 'Tasks Completed',
      render: (item) => (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
          {item.completedCount}
        </span>
      )
    },
    {
      key: 'contribution',
      header: '% of Team Total',
      render: (item) => {
        const pct = analytics && analytics.tasks.completed > 0 
          ? Math.round((item.completedCount / analytics.tasks.completed) * 100) 
          : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="text-xs font-medium text-gray-600">{pct}%</span>
          </div>
        )
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <PageHeader 
          title={myTeam ? `Team Analytics: ${myTeam.name}` : "Team Analytics"} 
          
        />
        
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3 bg-white p-3 rounded-lg border shadow-sm">
          <Input 
            label="Start Date" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
          <Input 
            label="End Date" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
          <Button type="submit">Apply Filter</Button>
        </form>
      </div>

      {!analytics ? (
        <Card padding="lg"><div className="text-center text-gray-500">No data available.</div></Card>
      ) : (
        <>
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card padding="lg" className="flex items-center gap-4 border-l-4 border-l-indigo-500">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Team Tasks</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.totalActive}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Completed</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.completed}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-l-4 border-l-amber-500">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Pending</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.pending}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-l-4 border-l-red-500">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Overdue</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.overdue}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card title="Member Contributions" padding="none">
              <div className="p-4 border-b bg-gray-50 text-sm text-gray-600">
                Displays the number of tasks successfully completed by each member during the selected date range.
              </div>
              {analytics.memberContribution.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No tasks were completed by team members during this period.</p>
                </div>
              ) : (
                <Table<TeamAnalytics['memberContribution'][0]>
                  data={analytics.memberContribution}
                  columns={columns}
                  keyExtractor={(item) => item._id}
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
