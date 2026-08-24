import { useEffect, useState, useMemo, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button/Button';
import { attendanceApi } from '../../services/attendanceApi';
import type { AttendanceRecord } from '../../services/attendanceApi';
import { useToast } from '../../components/ui/Toast/Toast';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { LogIn, LogOut, Calendar, AlertCircle } from 'lucide-react';
import { AttendanceStatus } from '../../../../shared/types/enums';

export default function MyAttendancePage() {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { addToast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [historyData, todayData] = await Promise.all([
        attendanceApi.getHistory(selectedMonth, selectedYear),
        attendanceApi.getToday()
      ]);
      setHistory(historyData);
      setTodayRecord(todayData);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      addToast({ type: 'error', title: 'Failed to fetch attendance data' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, addToast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      addToast({ type: 'success', title: 'Successfully checked in!' });
      fetchAttendance();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to check in' });
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      addToast({ type: 'success', title: 'Successfully checked out!' });
      fetchAttendance();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to check out' });
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Date',
      key: 'date',
      render: (row) => new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span style={{ 
          textTransform: 'capitalize', 
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: 
            row.status === AttendanceStatus.PRESENT ? 'rgba(34, 197, 94, 0.1)' :
            row.status === AttendanceStatus.ABSENT ? 'rgba(239, 68, 68, 0.1)' :
            row.status === AttendanceStatus.HALF_DAY ? 'rgba(234, 179, 8, 0.1)' :
            'rgba(107, 114, 128, 0.1)',
          color: 
            row.status === AttendanceStatus.PRESENT ? '#15803d' :
            row.status === AttendanceStatus.ABSENT ? '#b91c1c' :
            row.status === AttendanceStatus.HALF_DAY ? '#a16207' :
            '#374151'
        }}>
          {row.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Check In',
      key: 'checkIn',
      render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      header: 'Check Out',
      key: 'checkOut',
      render: (row) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      header: 'Duration',
      key: 'duration',
      render: (row) => row.duration ? `${Math.floor(row.duration / 60)}h ${row.duration % 60}m` : '-',
    },
    {
      header: 'Notes',
      key: 'notes',
      render: (row) => row.correctedBy ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.85rem' }}>
          <AlertCircle size={14} /> Corrected
        </span>
      ) : (row.notes || '-'),
    },
  ];

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, halfDay: 0, leave: 0 };
    history.forEach(r => {
      if (r.status === AttendanceStatus.PRESENT) counts.present++;
      else if (r.status === AttendanceStatus.ABSENT) counts.absent++;
      else if (r.status === AttendanceStatus.HALF_DAY) counts.halfDay++;
      else if (r.status === AttendanceStatus.ON_LEAVE) counts.leave++;
    });
    return counts;
  }, [history]);

  const hasCheckedIn = !!todayRecord;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const renderStatusMessage = () => {
    if (hasCheckedOut) {
      return "You have checked out for the day. Have a great evening!";
    }
    if (hasCheckedIn && todayRecord?.checkIn) {
      const diffInSeconds = Math.max(0, Math.floor((currentTime.getTime() - new Date(todayRecord.checkIn).getTime()) / 1000));
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      return `You are currently checked in. Duration: ${hours}h ${minutes}m ${seconds}s. Don't forget to check out when you finish work.`;
    }
    return "You haven't checked in yet today.";
  };

  return (
    <div className="page-container">
      <PageHeader title="My Attendance" />

      {/* Action Card */}
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px', fontFamily: 'monospace' }}>
          {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' • '}
          {currentTime.toLocaleTimeString()}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          {renderStatusMessage()}
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Button 
            onClick={handleCheckIn} 
            disabled={hasCheckedIn} 
            leftIcon={<LogIn size={20} />}
            variant={hasCheckedIn ? 'outline' : 'primary'}
            size="lg"
          >
            {hasCheckedIn ? `Checked in at ${new Date(todayRecord.checkIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Check In Now'}
          </Button>

          <Button 
            onClick={handleCheckOut} 
            disabled={!hasCheckedIn || hasCheckedOut} 
            leftIcon={<LogOut size={20} />}
            variant={hasCheckedOut ? 'outline' : (!hasCheckedIn ? 'outline' : 'primary')}
            size="lg"
          >
            {hasCheckedOut ? `Checked out at ${new Date(todayRecord!.checkOut!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Check Out'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
          Attendance History
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Present</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.present}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Absent</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.absent}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Half Day</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.halfDay}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Leave</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.leave}</div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        {history.length === 0 && !loading ? (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <Calendar size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>No attendance data available for this period.</p>
          </div>
        ) : (
          <Table
            data={history}
            columns={columns}
            keyExtractor={(item) => item._id}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}
