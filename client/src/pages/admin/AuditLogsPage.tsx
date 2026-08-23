import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Select } from '../../components/ui/Select/Select';
import { auditApi } from '../../services/auditApi';
import type { AuditLog, AuditPagination } from '../../services/auditApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ShieldAlert, Search, RefreshCw, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<AuditPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await auditApi.getAuditLogs({
        page,
        limit: 20,
        action: action || undefined,
        entity: entity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [page, action, entity, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new filter
    fetchLogs();
  };

  const handleClearFilters = () => {
    setAction('');
    setEntity('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return <span className="text-gray-400 italic">None</span>;
    return (
      <div className="max-w-xs truncate text-xs font-mono bg-gray-50 p-1 rounded text-gray-600" title={JSON.stringify(metadata, null, 2)}>
        {JSON.stringify(metadata)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="System Audit Logs" 
        />
        <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-amber-200">
          <ShieldAlert size={14} />
          Immutable Records
        </div>
      </div>

      <Card padding="md" className="bg-white">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <Select 
            label="Entity Type" 
            value={entity} 
            onChange={(e) => setEntity(e.target.value)}
            options={[
              { value: '', label: 'All Entities' },
              { value: 'User', label: 'User' },
              { value: 'Task', label: 'Task' },
              { value: 'Team', label: 'Team' },
              { value: 'LeaveRequest', label: 'Leave Request' },
              { value: 'Attendance', label: 'Attendance' },
              { value: 'Payroll', label: 'Payroll' },
              { value: 'WeeklyReport', label: 'Weekly Report' },
            ]}
          />
          <Input 
            label="Action (Exact Match)" 
            type="text" 
            placeholder="e.g. USER_CREATED"
            value={action} 
            onChange={(e) => setAction(e.target.value)} 
          />
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2"><Search size={16} />Filter</Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters} title="Clear Filters" className="px-3">
              <RefreshCw size={16} />
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">Metadata / Details</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-500" />
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No audit records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-gray-500 text-xs">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3">
                      {log.actor ? (
                        <div>
                          <div className="font-medium text-gray-900">{log.actor.firstName} {log.actor.lastName}</div>
                          <div className="text-xs text-gray-500">{log.actor.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System / Deleted User</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-800">{log.entity}</div>
                      <div className="text-xs text-gray-400 font-mono" title={log.entityId}>{log.entityId?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-3">
                      {renderMetadata(log.metadata)}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{pagination.page}</span> of <span className="font-medium text-gray-900">{pagination.pages}</span> ({pagination.total} total logs)
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                variant="secondary" 
                disabled={page === pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-2"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
