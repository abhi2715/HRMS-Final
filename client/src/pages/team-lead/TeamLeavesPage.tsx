import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { leaveApi } from '../../services/leaveApi';
import type { LeaveRequest } from '../../services/leaveApi';
import { LeaveStatus } from '../../types/enums';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export const TeamLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user?.team) return;
    try {
      setIsLoading(true);
      const res = await leaveApi.getTeamRequests(user.team);
      setRequests(res);
    } catch (error) {
      toast.error('Failed to load team leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleProcess = async (id: string, status: LeaveStatus, reason?: string) => {
    try {
      await leaveApi.processRequest(id, status, reason);
      toast.success(`Leave request ${status}`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Employee',
      key: 'req', render: (req) => `${req.employee?.firstName} ${req.employee?.lastName}`,
    },
    {
      header: 'Type',
      key: 'req', render: (req) => req.leaveType?.name || 'Unknown',
    },
    {
      header: 'Dates',
      key: 'req', render: (req) => `${format(new Date(req.startDate), 'MMM d')} - ${format(new Date(req.endDate), 'MMM d, yyyy')}`,
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleProcess(req._id, LeaveStatus.APPROVED)}>
            <Check size={16} className="text-green-600" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const reason = window.prompt('Rejection reason:');
            if (reason) handleProcess(req._id, LeaveStatus.REJECTED, reason);
          }}>
            <X size={16} className="text-red-600" />
          </Button>
        </div>
      ) : null,
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Leave Requests" 
        
      />
      <Card padding="md">
        <Table<LeaveRequest>
          data={requests}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          emptyStateDescription="No leave requests from your team."
        />
      </Card>
    </div>
  );
};
