import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { payrollApi } from '../../services/payrollApi';
import type { OrgPayrollSummary } from '../../services/payrollApi';
import toast from 'react-hot-toast';
import { IndianRupee, Users } from 'lucide-react';

export const CeoPayrollDashboard: React.FC = () => {
  const [summary, setSummary] = useState<OrgPayrollSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const data = await payrollApi.getOrgPayrollSummary();
      setSummary(data);
    } catch (error) {
      toast.error('Failed to load organization payroll summary');
    } finally {
      setIsLoading(false);
    }
  };

  const totalMonthlyPayroll = summary.reduce((acc, curr) => acc + (curr.currentSalary?.grossSalary || 0), 0);
  const totalEmployeesWithSalary = summary.filter(s => s.currentSalary !== null).length;
  const totalEmployees = summary.length;

  const columns: Column<OrgPayrollSummary>[] = [
    { key: 'employee', header: 'Employee', render: (item) => (
      <div className="font-medium text-gray-900">
        {item.employee.firstName} {item.employee.lastName}
        <div className="text-xs text-gray-500 font-normal">{item.employee.jobTitle || 'No Title'}</div>
      </div>
    ) },
    { key: 'status', header: 'Status', render: (item) => (
      item.currentSalary 
        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Configured</span>
        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Missing</span>
    ) },
    { key: 'gross', header: 'Gross Monthly', render: (item) => (
      item.currentSalary ? `₹${item.currentSalary.grossSalary.toLocaleString()}` : '-'
    ) },
    { key: 'net', header: 'Net Monthly', render: (item) => (
      item.currentSalary ? <span className="font-medium text-gray-900">₹{item.currentSalary.netSalary.toLocaleString()}</span> : '-'
    ) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Payroll Summary" 
      />
      <p className="text-gray-500 mt-[-1rem] mb-4">High-level view of active salary configurations across the organization.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card padding="md" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-lg flex items-center p-6">
          <div className="bg-white/20 p-4 rounded-full mr-6">
            <IndianRupee size={32} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Total Monthly Org Payroll (Gross)</h3>
            <p className="text-4xl font-bold">₹{totalMonthlyPayroll.toLocaleString()}</p>
          </div>
        </Card>
        <Card padding="md" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg flex items-center p-6">
          <div className="bg-white/20 p-4 rounded-full mr-6">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-emerald-100 mb-1">Payroll Coverage</h3>
            <p className="text-4xl font-bold">{totalEmployeesWithSalary} / {totalEmployees}</p>
            <p className="text-sm text-emerald-100 mt-1">employees configured</p>
          </div>
        </Card>
      </div>

      <Card title="Employee Payroll Breakdown" padding="none">
        <Table<OrgPayrollSummary>
          data={summary}
          columns={columns}
          keyExtractor={(item) => item.employee._id || item.employee.id}
          isLoading={isLoading}
          emptyStateDescription="No employees found in the organization."
        />
      </Card>
    </div>
  );
};
