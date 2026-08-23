import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { leaveApi } from '../../services/leaveApi';
import type { LeaveType, LeaveBalance, LeaveRequest } from '../../services/leaveApi';
import { LeaveStatus } from '../../types/enums';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyLeavesPage: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [balRes, reqRes, typRes] = await Promise.all([
        leaveApi.getMyBalances(),
        leaveApi.getMyRequests(),
        leaveApi.getLeaveTypes(),
      ]);
      setBalances(balRes);
      setRequests(reqRes);
      setTypes(typRes.filter(t => t.isActive));
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveApi.applyLeave(formData);
      toast.success('Leave applied successfully');
      setIsModalOpen(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      fetchData(); // refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leaveApi.cancelLeave(id);
      toast.success('Leave cancelled');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Type',
      key: 'req', render: (req) => req.leaveType?.name || 'Unknown',
    },
    {
      header: 'Dates',
      key: 'req', render: (req) => `${format(new Date(req.startDate), 'MMM d, yyyy')} - ${format(new Date(req.endDate), 'MMM d, yyyy')}`,
    },
    {
      header: 'Days',
      key: 'days', render: (item) => item.days,
    },
    {
      header: 'Status',
      key: 'req', render: (req) => <StatusPill status={req.status as any} />,
    },
    {
      header: 'Reason',
      key: 'reason', render: (item) => item.reason,
    },
    {
      header: 'Actions',
      key: 'req', render: (req) => req.status === LeaveStatus.PENDING ? (
        <Button variant="ghost" size="sm" onClick={() => handleCancel(req._id)}>Cancel</Button>
      ) : null,
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Leaves" 
        
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2" size={16} />
            Apply Leave
          </Button>
        }
      />

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map(bal => (
          <Card key={bal._id} padding="md" className="flex flex-col border-l-4" style={{ borderColor: bal.leaveType?.color }}>
            <h3 className="font-medium text-gray-700">{bal.leaveType?.name}</h3>
            <div className="mt-2 flex justify-between items-baseline">
              <span className="text-3xl font-bold">{bal.available}</span>
              <span className="text-sm text-gray-500">/ {bal.allocation} available</span>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${(bal.used / bal.allocation) * 100}%`, backgroundColor: bal.leaveType?.color }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-right">{bal.used} used</p>
          </Card>
        ))}
      </div>

      {/* Requests */}
      <Card title="Leave History" padding="md">
        <Table<LeaveRequest>
          data={requests}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          emptyStateDescription="No leave requests found."
        />
      </Card>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md" padding="md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Apply for Leave</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <Select
                label="Leave Type"
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                options={[
                  { value: '', label: 'Select Type' },
                  ...types.map(t => ({ value: t._id, label: t.name }))
                ]}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-gray-700">Reason</label><textarea className="input-field min-h-[80px] p-2 border rounded" rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required /></div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
