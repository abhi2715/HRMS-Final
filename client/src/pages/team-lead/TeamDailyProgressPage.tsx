import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Tabs } from '../../components/ui/Tabs/Tabs';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { dailyProgressApi } from '../../services/dailyProgressApi';
import type { DailyProgressRecord } from '../../services/dailyProgressApi';
import { DailyProgressStatus } from '../../../../shared/types/enums';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function TeamDailyProgressPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<DailyProgressRecord[]>([]);
  const [missed, setMissed] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<DailyProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState<string | null>(null);

  useEffect(() => {
    if (user?.team) {
      fetchData();
    }
  }, [date, user?.team]);

  const fetchData = async () => {
    if (!user?.team) return;
    
    try {
      setLoading(true);
      const [allRes, missedRes, blockedRes] = await Promise.all([
        dailyProgressApi.getTeamProgress(user.team, { startDate: date, endDate: date }),
        dailyProgressApi.getTeamMissed(user.team, date),
        dailyProgressApi.getTeamBlocked(user.team, { startDate: date, endDate: date }),
      ]);
      
      setRecords(allRes);
      setMissed(missedRes);
      setBlocked(blockedRes);
    } catch (error) {
      toast.error('Failed to load team progress');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      setLocking(id);
      await dailyProgressApi.lockProgress(id);
      toast.success('Record locked successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to lock record');
    } finally {
      setLocking(null);
    }
  };

  const statusColors: Record<string, 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    draft: 'secondary',
    submitted: 'success',
    locked: 'error',
  };

  const allColumns: Column<DailyProgressRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (record: DailyProgressRecord) => `${(record.employee as any).firstName} ${(record.employee as any).lastName}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (record: DailyProgressRecord) => <StatusPill status={statusColors[record.status] || 'secondary'}>{record.status.toUpperCase()}</StatusPill>
    },
    {
      key: 'workCompleted',
      header: 'Work Completed',
      render: (record: DailyProgressRecord) => <span className="truncate max-w-xs block" title={record.workCompleted}>{record.workCompleted || '-'}</span>
    },
    {
      key: 'blockers',
      header: 'Blockers',
      render: (record: DailyProgressRecord) => record.blockers ? <StatusPill status="error">Blocked</StatusPill> : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (record: DailyProgressRecord) => (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => handleLock(record._id)}
          disabled={record.status === DailyProgressStatus.LOCKED || locking === record._id}
          isLoading={locking === record._id}
        >
          {record.status === DailyProgressStatus.LOCKED ? 'Locked' : 'Lock'}
        </Button>
      )
    }
  ];

  const missedColumns: Column<any>[] = [
    {
      key: 'firstName',
      header: 'First Name',
    },
    {
      key: 'lastName',
      header: 'Last Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
  ];

  const blockedColumns: Column<DailyProgressRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (record: DailyProgressRecord) => `${(record.employee as any).firstName} ${(record.employee as any).lastName}`
    },
    {
      key: 'blockers',
      header: 'Blockers',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (record: DailyProgressRecord) => (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => handleLock(record._id)}
          disabled={record.status === DailyProgressStatus.LOCKED || locking === record._id}
          isLoading={locking === record._id}
        >
          {record.status === DailyProgressStatus.LOCKED ? 'Locked' : 'Lock'}
        </Button>
      )
    }
  ];

  if (!user?.team) {
    return <h4 className="text-xl font-bold">You are not assigned to a team.</h4>;
  }

  const allUpdatesContent = records.length > 0 ? (
    <Table columns={allColumns} data={records} keyExtractor={(item) => item._id} isLoading={loading} />
  ) : (
    <EmptyState
      title="No daily progress updates for this period."
      description={`No updates found for ${format(new Date(date), 'MMM dd, yyyy')}.`}
    />
  );

  const missedUpdatesContent = missed.length > 0 ? (
    <Table columns={missedColumns} data={missed} keyExtractor={(item) => item._id} isLoading={loading} />
  ) : (
    <EmptyState
      title="No missed updates."
      description={`All team members have submitted progress for ${format(new Date(date), 'MMM dd, yyyy')}.`}
    />
  );

  const blockedUpdatesContent = blocked.length > 0 ? (
    <Table columns={blockedColumns} data={blocked} keyExtractor={(item) => item._id} isLoading={loading} />
  ) : (
    <EmptyState
      title="No blocked members."
      description={`No team members are currently blocked on ${format(new Date(date), 'MMM dd, yyyy')}.`}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Progress</h2>
        <div className="w-48">
          <Input
            type="date"
            value={date}
            onChange={(e: any) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 text-center py-6">
            <h4 className="text-xl font-bold text-indigo-600 mb-1">{records.filter(r => r.status !== 'draft').length}</h4>
            <p className="text-gray-500">Submitted Updates</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center py-6">
            <h4 className="text-xl font-bold text-red-500 mb-1">{missed.length}</h4>
            <p className="text-gray-500">Missed Updates</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center py-6">
            <h4 className="text-xl font-bold text-orange-500 mb-1">{blocked.length}</h4>
            <p className="text-gray-500">Blocked Members</p>
          </div>
        </Card>
      </div>

      <Card>
        <Tabs
          tabs={[
            { id: 'all', label: 'All Updates', content: allUpdatesContent },
            { id: 'missed', label: `Missed (${missed.length})`, content: missedUpdatesContent },
            { id: 'blocked', label: `Blocked (${blocked.length})`, content: blockedUpdatesContent },
          ]}
          defaultTabId={activeTab}
          onChange={setActiveTab}
        />
      </Card>
    </div>
  );
}
