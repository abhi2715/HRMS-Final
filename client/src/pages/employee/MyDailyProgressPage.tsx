import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { dailyProgressApi } from '../../services/dailyProgressApi';
import type { DailyProgressRecord, SubmitProgressPayload } from '../../services/dailyProgressApi';
import { tasksApi, TaskStatus } from '../../services/tasksApi';
import type { Task } from '../../services/tasksApi';
import { DailyProgressStatus } from '../../../../shared/types/enums';
import { toast } from 'react-hot-toast';
import { format, isAfter, startOfDay } from 'date-fns';

export default function MyDailyProgressPage() {
  const [history, setHistory] = useState<DailyProgressRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SubmitProgressPayload>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    tasksWorkedOn: [],
    workCompleted: '',
    progress: '',
    blockers: '',
    notes: '',
    status: DailyProgressStatus.DRAFT,
  });

  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    fetchData();
    fetchTasks();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await dailyProgressApi.getMyProgress();
      setHistory(data);
      
      const todayRecord = data.find(r => format(new Date(r.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
      if (todayRecord) {
        setFormData({
          date: format(new Date(todayRecord.date), 'yyyy-MM-dd'),
          tasksWorkedOn: todayRecord.tasksWorkedOn.map(t => t._id),
          workCompleted: todayRecord.workCompleted || '',
          progress: todayRecord.progress || '',
          blockers: todayRecord.blockers || '',
          notes: todayRecord.notes || '',
          status: todayRecord.status,
        });
        setEditMode(todayRecord.status !== DailyProgressStatus.LOCKED);
      } else {
        setEditMode(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load progress history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getTasks({ status: TaskStatus.IN_PROGRESS });
      setTasks(data.data);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const handleSubmit = async (status: DailyProgressStatus) => {
    try {
      if (isAfter(new Date(formData.date!), startOfDay(new Date()))) {
        toast.error('Cannot submit progress for a future date');
        return;
      }
      
      setSubmitting(true);
      await dailyProgressApi.submitProgress({
        ...formData as SubmitProgressPayload,
        status
      });
      toast.success(status === DailyProgressStatus.SUBMITTED ? 'Progress submitted successfully' : 'Draft saved');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = (record: DailyProgressRecord) => {
    setFormData({
      date: format(new Date(record.date), 'yyyy-MM-dd'),
      tasksWorkedOn: record.tasksWorkedOn.map(t => t._id),
      workCompleted: record.workCompleted || '',
      progress: record.progress || '',
      blockers: record.blockers || '',
      notes: record.notes || '',
      status: record.status,
    });
    setEditMode(record.status !== DailyProgressStatus.LOCKED);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusColors: Record<string, 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    draft: 'secondary',
    submitted: 'success',
    locked: 'error',
  };

  const columns: Column<DailyProgressRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (record: DailyProgressRecord) => format(new Date(record.date), 'MMM dd, yyyy')
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
          onClick={() => handleEditRecord(record)}
          disabled={record.status === DailyProgressStatus.LOCKED}
        >
          {record.status === DailyProgressStatus.LOCKED ? 'Locked' : 'Edit'}
        </Button>
      )
    }
  ];

  const taskOptions = tasks.map(t => ({ value: t._id, label: t.title }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Daily Progress</h2>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{editMode ? 'Update Progress' : 'View Progress'}</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={formData.date || ''}
              onChange={(e: any) => setFormData({ ...formData, date: e.target.value })}
              disabled={!editMode || formData.status !== DailyProgressStatus.DRAFT}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            
            <Select
              label="Tasks Worked On (Optional)"
              multiple
              value={formData.tasksWorkedOn || []}
              onChange={(e: any) => {
                const options = Array.from(e.target.selectedOptions, (option: any) => option.value);
                setFormData({ ...formData, tasksWorkedOn: options });
              }}
              disabled={!editMode}
              options={taskOptions}
            />
          </div>

          <div className="input-group input-group--full-width">
            <label className="input-group__label">Work Completed</label>
            <div className="input-wrapper">
              <textarea 
                className="input" 
                value={formData.workCompleted || ''}
                onChange={(e: any) => setFormData({ ...formData, workCompleted: e.target.value })}
                placeholder="What did you accomplish today?"
                disabled={!editMode}
                rows={3}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group input-group--full-width">
              <label className="input-group__label">Progress / Status</label>
              <div className="input-wrapper">
                <textarea 
                  className="input" 
                  value={formData.progress || ''}
                  onChange={(e: any) => setFormData({ ...formData, progress: e.target.value })}
                  placeholder="e.g. 80% done with feature X"
                  disabled={!editMode}
                  rows={2}
                />
              </div>
            </div>
            
            <div className="input-group input-group--full-width">
              <label className="input-group__label">Blockers / Impediments</label>
              <div className="input-wrapper">
                <textarea 
                  className="input" 
                  value={formData.blockers || ''}
                  onChange={(e: any) => setFormData({ ...formData, blockers: e.target.value })}
                  placeholder="Any issues blocking your work?"
                  disabled={!editMode}
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          <div className="input-group input-group--full-width">
            <label className="input-group__label">Additional Notes</label>
            <div className="input-wrapper">
              <textarea 
                className="input" 
                value={formData.notes || ''}
                onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                disabled={!editMode}
                rows={2}
              />
            </div>
          </div>
        </div>
        {editMode && (
          <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => handleSubmit(DailyProgressStatus.DRAFT)}
              isLoading={submitting}
            >
              Save Draft
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleSubmit(DailyProgressStatus.SUBMITTED)}
              isLoading={submitting}
            >
              Submit Final
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Submission History</h3>
        </div>
        <div className="p-4">
          {history.length > 0 ? (
            <Table columns={columns} data={history} keyExtractor={(item) => item._id} isLoading={loading} />
          ) : (
            <EmptyState
              title="No daily progress updates for this period."
              description="You haven't submitted any daily progress updates yet."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
