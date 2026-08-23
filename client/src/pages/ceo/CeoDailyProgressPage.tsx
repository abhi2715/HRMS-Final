import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { MetricCard } from '../../components/ui/MetricCard/MetricCard';
import { Input } from '../../components/ui/Input/Input';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { dailyProgressApi } from '../../services/dailyProgressApi';
import type { OrgSummary } from '../../services/dailyProgressApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function CeoDailyProgressPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [summary, setSummary] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dailyProgressApi.getOrganizationSummary(date);
      setSummary(data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load organization progress summary');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const teamColumns: Column<any>[] = [
    {
      key: 'teamName',
      header: 'Team',
      render: (record: any) => <span className="font-medium text-gray-900">{record.teamName}</span>
    },
    {
      key: 'submitted',
      header: 'Submitted / Total',
      render: (record: any) => `${record.submitted} / ${record.total}`
    },
    {
      key: 'rate',
      header: 'Submission Rate',
      render: (record: any) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${record.rate}%` }}></div>
          </div>
          <span>{Math.round(record.rate)}%</span>
        </div>
      )
    },
    {
      key: 'blocked',
      header: 'Blocked',
      render: (record: any) => record.blocked > 0 ? <span className="text-red-600 font-medium">{record.blocked}</span> : '0'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Analytics</h2>
          <p className="text-gray-500 mt-1">
            Organization-wide daily progress overview
          </p>
        </div>
        <div className="w-48">
          <Input
            type="date"
            value={date}
            onChange={(e: any) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Submission Rate"
          value={`${summary ? Math.round(summary.rate) : 0}%`}
          trend={summary?.rate === 100 ? { value: 0, label: 'Perfect' } : undefined}
          isLoading={loading}
        />
        <MetricCard
          title="Total Submitted"
          value={summary?.submittedCount || 0}
          trend={{ value: 0, label: `Out of ${summary?.totalEmployees || 0} employees` }}
          isLoading={loading}
        />
        <MetricCard
          title="Total Missed"
          value={summary?.missedCount || 0}
          trend={summary && summary.missedCount > 0 ? { value: -summary.missedCount, label: 'requires attention' } : undefined}
          isLoading={loading}
        />
        <MetricCard
          title="Total Blocked"
          value={summary?.blockedCount || 0}
          trend={summary && summary.blockedCount > 0 ? { value: -summary.blockedCount, label: 'blocked issues' } : undefined}
          isLoading={loading}
        />
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Team Comparison</h3>
        </div>
        <div className="p-4">
          {!loading && (!summary?.teamStats || summary.teamStats.length === 0) ? (
            <EmptyState
              title="No daily progress updates for this period."
              description={`No data available for ${format(new Date(date), 'MMM dd, yyyy')}.`}
            />
          ) : (
            <Table 
              columns={teamColumns} 
              data={summary?.teamStats || []} 
              keyExtractor={(item) => item.teamId}
              isLoading={loading} 
            />
          )}
        </div>
      </Card>
    </div>
  );
}
