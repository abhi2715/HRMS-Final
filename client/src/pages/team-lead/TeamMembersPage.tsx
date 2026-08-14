import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { teamLeadApi } from '../../services/teamLeadApi';
import type { TeamMember } from '../../services/teamLeadApi';

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await teamLeadApi.getMembers();
        setMembers(data);
      } catch (error) {
        console.error('Failed to fetch Team Members', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const columns: Column<TeamMember>[] = [
    {
      header: 'Name',
      key: 'firstName',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Job Title',
      key: 'jobTitle',
      render: (row) => row.jobTitle || '-',
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (row) => (
        <StatusPill status={row.isActive ? 'success' : 'error'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusPill>
      ),
    },
    {
      header: 'Active Tasks',
      key: 'activeTasks',
      render: (row) => (
        <span style={{ fontWeight: 500, color: row.activeTasks > 0 ? 'var(--color-primary)' : 'inherit' }}>
          {row.activeTasks}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Team Members" />

      <Table
        data={members}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
      />
    </div>
  );
}
