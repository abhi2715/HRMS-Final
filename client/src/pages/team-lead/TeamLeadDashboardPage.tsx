import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MetricCard } from '../../components/ui/Card/MetricCard';
import { Users, LayoutGrid, CheckCircle, Clock, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { teamLeadApi } from '../../services/teamLeadApi';
import type { TeamLeadDashboardStats } from '../../services/teamLeadApi';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';

export default function TeamLeadDashboardPage() {
  const [stats, setStats] = useState<TeamLeadDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await teamLeadApi.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch Team Lead stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const recentActivityColumns: Column<any>[] = [
    {
      header: 'Action',
      key: 'action',
      render: (row: any) => (
        <span style={{ fontWeight: 500 }}>
          {row.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Performed By',
      key: 'performedBy',
      render: (row: any) => row.performedBy ? `${row.performedBy.firstName} ${row.performedBy.lastName}` : 'System',
    },
    {
      header: 'Target',
      key: 'target',
      render: (row: any) => {
        if (row.targetUser) return `${row.targetUser.firstName} ${row.targetUser.lastName}`;
        if (row.targetTask) return `Task: ${row.targetTask.title}`;
        return '-';
      },
    },
    {
      header: 'Time',
      key: 'createdAt',
      render: (row: any) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader title={stats ? `${stats.teamOverview.name} Dashboard` : 'Team Dashboard'} />

      {/* Team Overview */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>Team Operations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="Team Members"
          value={stats?.teamOverview.totalMembers || 0}
          icon={<Users size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Present Today"
          value={stats?.teamOverview.todayAttendance || 0}
          icon={<CheckCircle size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Pending Leaves"
          value={stats?.teamOverview.pendingLeaves || 0}
          icon={<Calendar size={20} color={stats?.teamOverview.pendingLeaves ? 'var(--color-warning)' : 'inherit'}/>}
          isLoading={loading}
        />
        <MetricCard
          title="CEO Assigned Tasks"
          value={stats?.ceoTasks.total || 0}
          icon={<LayoutGrid size={20} />}
          isLoading={loading}
          trend={stats ? { value: stats.ceoTasks.completed, isPositive: true, label: 'completed' } : undefined}
        />
      </div>

      {/* Task Overview */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>Team Tasks</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="Active Tasks"
          value={stats ? stats.taskOverview.total - stats.taskOverview.completed : 0}
          icon={<Activity size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Avg Progress"
          value={stats ? `${stats.taskOverview.avgProgress}%` : '0%'}
          icon={<Clock size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats?.taskOverview.overdue || 0}
          icon={<AlertTriangle size={20} color="var(--color-error)" />}
          isLoading={loading}
        />
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>
          Recent Team Activity
        </h2>
        <Table
          data={stats?.recentActivity || []}
          columns={recentActivityColumns}
          keyExtractor={(item: any) => item._id}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
