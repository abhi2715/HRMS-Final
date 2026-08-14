import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MetricCard } from '../../components/ui/Card/MetricCard';
import { Users, LayoutGrid, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import { ceoApi } from '../../services/ceoApi';
import type { CeoDashboardStats } from '../../services/ceoApi';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';

export default function CeoDashboardPage() {
  const [stats, setStats] = useState<CeoDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await ceoApi.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch CEO stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const teamComparisonColumns: Column<any>[] = [
    {
      header: 'Team Name',
      key: 'teamName',
      render: (row: any) => <span style={{ fontWeight: 500 }}>{row.teamName}</span>,
    },
    {
      header: 'Total Tasks',
      key: 'totalTasks',
      render: (row: any) => row.totalTasks,
    },
    {
      header: 'Completed',
      key: 'completed',
      render: (row: any) => row.completed,
    },
    {
      header: 'Overdue',
      key: 'overdue',
      render: (row: any) => (
        <span style={{ color: row.overdue > 0 ? 'var(--color-error)' : 'inherit' }}>
          {row.overdue}
        </span>
      ),
    },
    {
      header: 'Avg Progress',
      key: 'avgProgress',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${row.avgProgress}%`, height: '100%', backgroundColor: row.avgProgress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', width: '32px', textAlign: 'right' }}>{row.avgProgress}%</span>
        </div>
      ),
    },
  ];

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
      key: 'targetUser',
      render: (row: any) => {
        if (row.targetUser) return `${row.targetUser.firstName} ${row.targetUser.lastName}`;
        if (row.targetTeam) return row.targetTeam.name;
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
      <PageHeader title="CEO Dashboard" />

      {/* Alerts Section */}
      {!loading && stats?.alerts && stats.alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--space-8)' }}>
          {stats.alerts.map((alert, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #F87171', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Organization Overview */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>Organization Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="Total Employees"
          value={stats?.orgOverview.totalEmployees || 0}
          icon={<Users size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Active Teams"
          value={stats?.orgOverview.totalTeams || 0}
          icon={<LayoutGrid size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Total Tasks"
          value={stats?.orgOverview.totalTasks || 0}
          icon={<Activity size={20} />}
          isLoading={loading}
        />
      </div>

      {/* Task Overview */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>Task Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="To Do"
          value={stats?.taskOverview.byStatus.todo || 0}
          icon={<Clock size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="In Progress"
          value={stats?.taskOverview.byStatus.in_progress || 0}
          icon={<Activity size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Done"
          value={stats?.taskOverview.byStatus.done || 0}
          icon={<CheckCircle size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats?.taskOverview.overdue || 0}
          icon={<AlertTriangle size={20} color="var(--color-error)" />}
          isLoading={loading}
        />
      </div>

      {/* Team Comparison & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>
            Team Performance Comparison
          </h2>
          <Table
            data={stats?.teamComparison || []}
            columns={teamComparisonColumns}
            keyExtractor={(item: any) => item.teamId}
            isLoading={loading}
          />
        </div>

        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>
            Recent Organization Activity
          </h2>
          <Table
            data={stats?.recentActivity || []}
            columns={recentActivityColumns}
            keyExtractor={(item: any) => item._id}
            isLoading={loading}
          />
        </div>

      </div>
    </div>
  );
}
