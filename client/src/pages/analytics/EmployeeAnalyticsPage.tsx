import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { analyticsApi } from '../../services/analyticsApi';
import type { EmployeeAnalytics } from '../../services/analyticsApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { CheckCircle, AlertTriangle, Target, Timer, Calendar } from 'lucide-react';

export const EmployeeAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<EmployeeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        toast.error("Not authenticated.");
        setIsLoading(false);
        return;
      }
      const data = await analyticsApi.getEmployeeAnalytics(user.id, startDate, endDate);
      setAnalytics(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load personal analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading personal analytics...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <PageHeader 
          title="My Analytics" 
        />
        
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3 bg-white p-3 rounded-lg border shadow-sm">
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
          <Button type="submit">Apply Filter</Button>
        </form>
      </div>

      {!analytics ? (
        <Card padding="lg"><div className="text-center text-gray-500">No data available.</div></Card>
      ) : (
        <>
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card padding="lg" className="flex items-center gap-4 border-t-4 border-t-indigo-500">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Target size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Assigned Tasks</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.totalAssigned}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-t-4 border-t-emerald-500">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Completion Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.tasks.totalAssigned > 0 ? `${analytics.tasks.completionRate}%` : 'N/A'}
                </div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-t-4 border-t-red-500">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Overdue</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.overdue}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4 border-t-4 border-t-blue-500">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Timer size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Avg Turnaround</div>
                <div className="text-xl font-bold text-gray-900">
                  {analytics.tasks.avgTurnaroundDays ? `${analytics.tasks.avgTurnaroundDays} Days` : 'N/A'}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Breakdown */}
            <Card title="Task Pipeline" padding="lg">
              {analytics.tasks.totalAssigned === 0 ? (
                <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                  <Target className="w-12 h-12 text-gray-300 mb-3" />
                  <p>You have no tasks assigned within this period.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <span className="font-semibold text-gray-700">Completed</span>
                    <span className="text-xl font-bold text-emerald-600">{analytics.tasks.completed}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <span className="font-semibold text-gray-700">Pending</span>
                    <span className="text-xl font-bold text-amber-600">{analytics.tasks.pending}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                    <span className="font-semibold text-gray-700">Overdue</span>
                    <span className="text-xl font-bold text-red-600">{analytics.tasks.overdue}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Attendance & Leaves */}
            <Card title="My Attendance" padding="lg">
              {analytics.attendance.length === 0 ? (
                <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                  <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No attendance logged in this period.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.attendance.map(status => (
                    <div key={status._id} className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <span className="capitalize font-medium text-indigo-900">{status._id.replace('_', ' ')}</span>
                      <span className="font-semibold bg-white px-3 py-1 rounded shadow-sm text-sm text-indigo-700">{status.count} days</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
