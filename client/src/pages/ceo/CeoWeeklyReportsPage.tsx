import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card/Card';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { weeklyReportApi } from '../../services/weeklyReportApi';
import type { WeeklyReport } from '../../services/weeklyReportApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Team } from '../../services/teamsApi';
import type { User } from '../../types/auth.types';

export const CeoWeeklyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await weeklyReportApi.getAllReports();
      setReports(data);
    } catch (error) {
      toast.error('Failed to load weekly reports');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<WeeklyReport>[] = [
    { 
      key: 'team', 
      header: 'Team', 
      render: (item) => (item.team as Team).name
    },
    { 
      key: 'lead', 
      header: 'Team Lead', 
      render: (item) => `${(item.teamLead as User).firstName} ${(item.teamLead as User).lastName}`
    },
    { 
      key: 'week', 
      header: 'Week', 
      render: (item) => `${format(new Date(item.weekStartDate), 'MMM dd')} - ${format(new Date(item.weekEndDate), 'MMM dd, yy')}` 
    },
    { 
      key: 'completion', 
      header: 'Completion %', 
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${item.metrics.completionRate >= 80 ? 'bg-green-500' : item.metrics.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              style={{ width: `${item.metrics.completionRate}%` }}
            ></div>
          </div>
          <span className="text-xs">{item.metrics.completionRate}%</span>
        </div>
      )
    },
    { 
      key: 'actions', 
      header: '', 
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedReport(item)}>
          View Details
        </Button>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Weekly Reports" 
      />
      
      {!selectedReport ? (
        <Card padding="none">
          <Table<WeeklyReport>
            data={reports}
            columns={columns}
            keyExtractor={(item) => item._id}
            isLoading={isLoading}
            emptyStateDescription="No weekly reports have been submitted yet."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedReport(null)}>
            &larr; Back to all reports
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title={`Report: ${(selectedReport.team as Team).name}`} padding="lg">
                <div className="text-sm text-gray-500 mb-6 pb-4 border-b">
                  Submitted by {(selectedReport.teamLead as User).firstName} {(selectedReport.teamLead as User).lastName} • {format(new Date(selectedReport.weekStartDate), 'MMM dd')} to {format(new Date(selectedReport.weekEndDate), 'MMM dd, yyyy')}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Achievements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.achievements}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Completed Work</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.completedWork}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Incomplete Work</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.incompleteWork}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Blockers</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-red-50 p-3 rounded-md text-red-900">{selectedReport.blockers}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Employee Contributions</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.employeeContributions}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Next Priorities</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.nextWeekPriorities}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Risks</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.risks}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card title="Metrics Snapshot" padding="lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Tasks Completed</span>
                    <span className="font-semibold">{selectedReport.metrics.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Tasks Pending</span>
                    <span className="font-semibold">{selectedReport.metrics.tasksPending}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Overdue Tasks</span>
                    <span className="font-semibold text-red-600">{selectedReport.metrics.overdueTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-indigo-600">{selectedReport.metrics.completionRate}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
