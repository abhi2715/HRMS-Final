import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MetricCard } from '../../components/ui/Card/MetricCard';
import { Users, LayoutGrid, UserCheck, Activity } from 'lucide-react';
import { organizationApi } from '../../services/organizationApi';
import type { OrganizationStats } from '../../services/organizationApi';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await organizationApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch org stats', error);
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
      <PageHeader title="Admin Dashboard" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <MetricCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={<Users size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={<UserCheck size={20} />}
          trend={{ value: 100, isPositive: true, label: 'of total' }}
          isLoading={loading}
        />
        <MetricCard
          title="Total Teams"
          value={stats?.totalTeams || 0}
          icon={<LayoutGrid size={20} />}
          isLoading={loading}
        />
        <MetricCard
          title="Recent Actions"
          value={stats?.recentActivity?.length || 0}
          icon={<Activity size={20} />}
          isLoading={loading}
        />
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
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
  );
}
