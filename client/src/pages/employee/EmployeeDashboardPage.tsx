import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MetricCard } from '../../components/ui/Card/MetricCard';
import { Activity, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { employeeApi } from '../../services/employeeApi';
import type { EmployeeDashboardStats } from '../../services/employeeApi';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';

export default function EmployeeDashboardPage() {
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await employeeApi.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch employee dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const taskColumns: Column<any>[] = [
    {
      header: 'Title',
      key: 'title',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.title}</span>,
    },
    {
      header: 'Assigned By',
      key: 'createdBy',
      render: (row) => row.createdBy ? `${row.createdBy.firstName} ${row.createdBy.lastName}` : '-',
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <StatusPill status={row.status === 'done' ? 'success' : row.status === 'in_progress' ? 'info' : row.status === 'in_review' ? 'warning' : 'secondary'}>
          {row.status.replace('_', ' ')}
        </StatusPill>
      ),
    },
    {
      header: 'Progress',
      key: 'progress',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${row.progress}%`, backgroundColor: 'var(--color-primary)' }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{row.progress}%</span>
        </div>
      )
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader title="My Dashboard" />

      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>Today's Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="Active Tasks"
          value={stats?.overview.activeTasks || 0}
          icon={<Activity size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats?.overview.overdueTasks || 0}
          icon={<AlertTriangle size={20} color={stats?.overview.overdueTasks ? 'var(--color-error)' : 'inherit'}/>}
          isLoading={loading}
        />
        <MetricCard
          title="Today's Attendance"
          value={stats?.overview.todayAttendanceStatus.replace('_', ' ') || 'Not Checked In'}
          icon={<Clock size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Pending Leaves"
          value={stats?.overview.pendingLeaves || 0}
          icon={<Calendar size={20} />}
          isLoading={loading}
        />
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>
          Recent Tasks
        </h2>
        <Table
          data={stats?.recentTasks || []}
          columns={taskColumns}
          keyExtractor={(item: any) => item._id}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
