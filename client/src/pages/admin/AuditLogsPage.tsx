import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { auditApi } from '../../services/auditApi';
import type { AuditLog } from '../../services/organizationApi';
import { useToast } from '../../components/ui/Toast/Toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  const fetchLogs = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await auditApi.getLogs({ page: pageNum, limit: 50 });
      setLogs(res.data);
      setTotalPages(res.pagination.pages);
      setPage(res.pagination.page);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load audit logs' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Action',
      key: 'action',
      render: (row: any) => <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{row.action.replace(/_/g, ' ')}</span>,
    },
    {
      header: 'Performed By',
      key: 'performedBy',
      render: (row: any) => row.performedBy ? `${row.performedBy.firstName} ${row.performedBy.lastName}` : 'System',
    },
    {
      header: 'Target User',
      key: 'targetUser',
      render: (row: any) => row.targetUser ? `${row.targetUser.firstName} ${row.targetUser.lastName}` : '-',
    },
    {
      header: 'Target Team',
      key: 'targetTeam',
      render: (row: any) => row.targetTeam ? row.targetTeam.name : '-',
    },
    {
      header: 'Date & Time',
      key: 'createdAt',
      render: (row: any) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader title="Audit Logs" />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Immutable record of administrative actions across the organization.
      </p>

      <Table
        data={logs}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
      />

      {/* Pagination controls can be added here if needed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
          Page {page} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' }}
          >
            Previous
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
