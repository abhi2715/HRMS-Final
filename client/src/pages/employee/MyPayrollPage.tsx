import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { payrollApi } from '../../services/payrollApi';
import type { SalaryRecord } from '../../services/payrollApi';
import toast from 'react-hot-toast';
import { IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export const MyPayrollPage: React.FC = () => {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await payrollApi.getMySalaryHistory();
      setRecords(data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load salary history');
    } finally {
      setIsLoading(false);
    }
  };

  const currentSalary = records.length > 0 ? records[0] : null;

  const columns: Column<SalaryRecord>[] = [
    { key: 'effectiveDate', header: 'Effective Date', render: (item) => format(new Date(item.effectiveDate), 'MMM dd, yyyy') },
    { key: 'base', header: 'Base Salary', render: (item) => `₹${item.baseSalary.toLocaleString()}` },
    { key: 'allowances', header: 'Allowances', render: (item) => `₹${item.allowances.toLocaleString()}` },
    { key: 'deductions', header: 'Deductions', render: (item) => `₹${item.deductions.toLocaleString()}` },
    { key: 'bonus', header: 'Bonus', render: (item) => `₹${item.bonus.toLocaleString()}` },
    { key: 'gross', header: 'Gross Salary', render: (item) => <span className="font-medium text-gray-900">₹{item.grossSalary.toLocaleString()}</span> },
    { key: 'net', header: 'Net Salary', render: (item) => <span className="font-bold text-green-600">₹{item.netSalary.toLocaleString()}</span> },
    { key: 'notes', header: 'Notes', render: (item) => item.notes || '-' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Payroll & Salary" 
      />
      <p className="text-gray-500 mt-[-1rem] mb-4">View your current salary configuration and historical changes.</p>
      
      {!currentSalary && !isLoading ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Information</h3>
            <p className="text-gray-500">Your salary information has not been configured yet. Please contact HR or your administrator.</p>
          </div>
        </Card>
      ) : (
        <>
          {currentSalary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card padding="md" className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
                <h3 className="text-sm font-medium text-indigo-100 mb-1">Net Monthly Salary</h3>
                <p className="text-3xl font-bold">₹{currentSalary.netSalary.toLocaleString()}</p>
                <p className="text-xs text-indigo-200 mt-2">Effective since {format(new Date(currentSalary.effectiveDate), 'MMM dd, yyyy')}</p>
              </Card>
              <Card padding="md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Gross Salary</h3>
                <p className="text-2xl font-bold text-gray-900">₹{currentSalary.grossSalary.toLocaleString()}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Base: ₹{currentSalary.baseSalary.toLocaleString()}</span>
                  <span>Allowances: ₹{currentSalary.allowances.toLocaleString()}</span>
                </div>
              </Card>
              <Card padding="md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Deductions</h3>
                <p className="text-2xl font-bold text-red-600">₹{currentSalary.deductions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Will be deducted from gross pay</p>
              </Card>
            </div>
          )}

          <Card title="Salary History" padding="none">
            <Table<SalaryRecord>
              data={records}
              columns={columns}
              keyExtractor={(item) => item._id}
              isLoading={isLoading}
              emptyStateDescription="No salary records found."
            />
          </Card>
        </>
      )}
    </div>
  );
};
