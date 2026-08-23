import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { analyticsApi } from '../../services/analyticsApi';
import type { OrgAnalytics } from '../../services/analyticsApi';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { BarChart, Users, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

export const OrgAnalyticsPage: React.FC = React.memo(() => {
  const [analytics, setAnalytics] = useState<OrgAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await analyticsApi.getOrganizationAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load organization analytics');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <PageHeader 
          title="Organization Analytics" 
          
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
            <Card padding="lg" className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Active Employees</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.employees.active}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <BarChart size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Active Teams</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.teams.total}</div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Completion Rate</div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics.tasks.totalActive > 0 ? `${analytics.tasks.completionRate}%` : 'N/A'}
                </div>
              </div>
            </Card>

            <Card padding="lg" className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Overdue Tasks</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.overdue}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Breakdown */}
            <Card title="Task Performance Breakdown" padding="lg">
              {analytics.tasks.totalActive === 0 ? (
                <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                  <Clock className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No active tasks recorded during this period.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                          Completed
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-emerald-600">
                          {analytics.tasks.completed} / {analytics.tasks.totalActive}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
                      <div style={{ width: `${analytics.tasks.completionRate}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                    <div>
                      <div className="text-2xl font-semibold text-gray-700">{analytics.tasks.totalActive}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-amber-600">{analytics.tasks.pending}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-red-600">{analytics.tasks.overdue}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Overdue</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Attendance & Leaves */}
            <Card title="Workforce Availability" padding="lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} /> Attendance Records
                  </h3>
                  {analytics.attendance.length === 0 ? (
                    <div className="text-sm text-gray-500 italic py-2">No attendance logged in this period.</div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.attendance.map(status => (
                        <div key={status._id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                          <span className="capitalize font-medium text-gray-700">{status._id.replace('_', ' ')}</span>
                          <span className="font-semibold bg-white px-3 py-1 rounded shadow-sm text-sm">{status.count} records</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Approved Leaves Taken</h3>
                  {analytics.leaves.length === 0 ? (
                    <div className="text-sm text-gray-500 italic py-2">No approved leaves in this period.</div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.leaves.map(leave => (
                        <div key={leave._id} className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                          <span className="capitalize font-medium text-blue-800">{leave._id}</span>
                          <span className="font-semibold text-blue-900">{leave.totalDays} days</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
});
