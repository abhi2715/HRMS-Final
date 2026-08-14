import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { payrollApi } from '../../services/payrollApi';
import type { OrgPayrollSummary, SalaryRecord } from '../../services/payrollApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { User } from '../../types/auth.types';

export const AdminPayrollPage: React.FC = () => {
  const [summary, setSummary] = useState<OrgPayrollSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employeeHistory, setEmployeeHistory] = useState<SalaryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    effectiveDate: new Date().toISOString().split('T')[0],
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    bonus: 0,
    notes: ''
  });

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

  const loadEmployeeHistory = async (employee: User) => {
    setSelectedEmployee(employee);
    setIsFormOpen(false);
    try {
      setIsHistoryLoading(true);
      const data = await payrollApi.getEmployeeSalaryHistory(employee._id || employee.id);
      setEmployeeHistory(data.records);
    } catch (error) {
      toast.error('Failed to load employee salary history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    try {
      await payrollApi.createSalaryRecord(selectedEmployee._id || selectedEmployee.id, {
        effectiveDate: formData.effectiveDate,
        baseSalary: Number(formData.baseSalary),
        allowances: Number(formData.allowances),
        deductions: Number(formData.deductions),
        bonus: Number(formData.bonus),
        notes: formData.notes
      });
      toast.success('Salary record created successfully');
      setIsFormOpen(false);
      setFormData({
        effectiveDate: new Date().toISOString().split('T')[0],
        baseSalary: 0,
        allowances: 0,
        deductions: 0,
        bonus: 0,
        notes: ''
      });
      loadEmployeeHistory(selectedEmployee);
      fetchSummary(); // refresh main list to show configured status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create salary record');
    }
  };

  const summaryColumns: Column<OrgPayrollSummary>[] = [
    { key: 'employee', header: 'Employee', render: (item) => (
      <div className="font-medium text-gray-900">
        {item.employee.firstName} {item.employee.lastName}
      </div>
    ) },
    { key: 'status', header: 'Status', render: (item) => (
      item.currentSalary 
        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Configured</span>
        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Missing</span>
    ) },
    { key: 'net', header: 'Current Net', render: (item) => (
      item.currentSalary ? `₹${item.currentSalary.netSalary.toLocaleString()}` : '-'
    ) },
    { key: 'actions', header: '', render: (item) => (
      <Button variant="ghost" size="sm" onClick={() => loadEmployeeHistory(item.employee)}>
        Manage
      </Button>
    ) }
  ];

  const historyColumns: Column<SalaryRecord>[] = [
    { key: 'date', header: 'Effective Date', render: (item) => format(new Date(item.effectiveDate), 'MMM dd, yyyy') },
    { key: 'base', header: 'Base', render: (item) => `₹${item.baseSalary.toLocaleString()}` },
    { key: 'gross', header: 'Gross', render: (item) => `₹${item.grossSalary.toLocaleString()}` },
    { key: 'net', header: 'Net', render: (item) => <span className="font-medium">₹{item.netSalary.toLocaleString()}</span> },
    { key: 'notes', header: 'Notes', render: (item) => <span className="text-xs text-gray-500">{item.notes || '-'}</span> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payroll Management" 
        
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Employees" padding="none">
            <div className="max-h-[800px] overflow-y-auto">
              <Table<OrgPayrollSummary>
                data={summary}
                columns={summaryColumns}
                keyExtractor={(item) => item.employee._id || item.employee.id}
                isLoading={isLoading}
                onRowClick={(item) => loadEmployeeHistory(item.employee)}
              />
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {!selectedEmployee ? (
            <Card padding="lg">
              <div className="text-center py-12 text-gray-500">
                Select an employee from the list to view or manage their salary history.
              </div>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                  <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                </div>
                <Button onClick={() => setIsFormOpen(!isFormOpen)}>
                  {isFormOpen ? 'Cancel' : 'Add New Salary Record'}
                </Button>
              </div>

              {isFormOpen && (
                <Card title="New Salary Record" padding="md">
                  <form onSubmit={handleCreateRecord} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Effective Date" 
                        type="date" 
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                        required 
                      />
                      <Input 
                        label="Base Salary (Yearly/Monthly based on your convention)" 
                        type="number" 
                        min="0"
                        value={formData.baseSalary}
                        onChange={(e) => setFormData({...formData, baseSalary: Number(e.target.value)})}
                        required 
                      />
                      <Input 
                        label="Allowances" 
                        type="number" 
                        min="0"
                        value={formData.allowances}
                        onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})}
                      />
                      <Input 
                        label="Deductions" 
                        type="number" 
                        min="0"
                        value={formData.deductions}
                        onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
                      />
                      <Input 
                        label="Bonus" 
                        type="number" 
                        min="0"
                        value={formData.bonus}
                        onChange={(e) => setFormData({...formData, bonus: Number(e.target.value)})}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 mt-4">
                      <label className="text-sm font-medium text-gray-700">Notes (Reason for change)</label>
                      <textarea 
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit">Save Salary Record</Button>
                    </div>
                  </form>
                </Card>
              )}

              <Card title="Salary History" padding="none">
                <Table<SalaryRecord>
                  data={employeeHistory}
                  columns={historyColumns}
                  keyExtractor={(item) => item._id}
                  isLoading={isHistoryLoading}
                  emptyStateDescription="No salary history found for this employee."
                />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
