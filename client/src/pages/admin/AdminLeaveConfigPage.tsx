import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { leaveApi } from '../../services/leaveApi';
import type { LeaveType, LeaveBalance } from '../../services/leaveApi';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export const AdminLeaveConfigPage: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'types' | 'balances'>('types');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [typRes, balRes] = await Promise.all([
        leaveApi.getLeaveTypes(),
        leaveApi.adminGetBalances()
      ]);
      setTypes(typRes);
      setBalances(balRes);
    } catch (error) {
      toast.error('Failed to load leave config data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await leaveApi.adminCreateType({
        name: fd.get('name') as string,
        description: fd.get('description') as string,
        defaultAllocation: parseInt(fd.get('allocation') as string),
        color: fd.get('color') as string,
      });
      toast.success('Leave Type Created');
      (e.target as HTMLFormElement).reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create leave type');
    }
  };

  const typeColumns: Column<LeaveType>[] = [
    { header: 'Name', key: 'name', render: (item) => item.name },
    { header: 'Allocation', key: 'alloc', render: (item) => item.defaultAllocation },
    { header: 'Color', key: 'type', render: (type) => (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
        {type.color}
      </div>
    ) },
    { header: 'Status', key: 'type', render: (type) => type.isActive ? 'Active' : 'Inactive' },
  ];

  const balanceColumns: Column<LeaveBalance>[] = [
    { header: 'Employee', key: 'bal', render: (bal) => `${bal.employee?.firstName} ${bal.employee?.lastName}` },
    { header: 'Type', key: 'bal', render: (bal) => bal.leaveType?.name },
    { header: 'Allocation', key: 'alloc', render: (item) => item.allocation },
    { header: 'Used', key: 'used', render: (item) => item.used },
    { header: 'Available', key: 'available', render: (item) => item.available },
    { header: 'Actions', key: 'bal', render: (bal) => (
      <Button variant="ghost" size="sm" onClick={() => {
        const newAlloc = window.prompt('Enter new allocation:', bal.allocation.toString());
        if (newAlloc !== null && !isNaN(parseInt(newAlloc))) {
          leaveApi.adminUpdateBalance(bal._id, { allocation: parseInt(newAlloc) }).then(() => {
            toast.success('Balance updated');
            fetchData();
          });
        }
      }}>Edit</Button>
    ) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leave Configuration" 
        
      />
      
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          className={`py-2 px-4 ${activeTab === 'types' ? 'border-b-2 border-indigo-600 font-medium text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('types')}
        >
          Leave Types
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'balances' ? 'border-b-2 border-indigo-600 font-medium text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('balances')}
        >
          Employee Balances
        </button>
      </div>

      {activeTab === 'types' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card title="New Leave Type" padding="md">
              <form onSubmit={handleCreateType} className="space-y-4">
                <Input name="name" label="Type Name" placeholder="e.g. Casual Leave" required />
                <Input name="description" label="Description" placeholder="Description of the leave" />
                <Input name="allocation" label="Default Yearly Allocation (Days)" type="number" required />
                <Input name="color" label="Color Code (Hex)" type="color" defaultValue="#4F46E5" required />
                <Button type="submit" className="w-full">
                  <Plus className="mr-2" size={16} /> Create Type
                </Button>
              </form>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card title="Existing Leave Types" padding="md">
              <Table<LeaveType>
                data={types}
                columns={typeColumns}
                keyExtractor={(item) => item._id}
                isLoading={isLoading}
              />
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <Card title="Employee Leave Balances" padding="md">
          <Table<LeaveBalance>
            data={balances}
            columns={balanceColumns}
            keyExtractor={(item) => item._id}
            isLoading={isLoading}
          />
        </Card>
      )}
    </div>
  );
};
