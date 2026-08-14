import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { attendanceApi } from '../../services/attendanceApi';
import type { AttendanceRecord } from '../../services/attendanceApi';
import { useToast } from '../../components/ui/Toast/Toast';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Calendar, AlertCircle, Edit2 } from 'lucide-react';
import { AttendanceStatus } from '../../../../shared/types/enums';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button/Button';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';

export default function TeamAttendancePage() {
  const { user } = useAuth();
  const teamId = typeof user?.team === 'string' ? user.team : (user?.team as any)?._id;
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Correction Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionForm, setCorrectionForm] = useState({
    checkIn: '',
    checkOut: '',
    status: AttendanceStatus.PRESENT as string,
    notes: '',
    correctionReason: ''
  });
  const [correcting, setCorrecting] = useState(false);
  
  const { addToast } = useToast();

  const fetchAttendance = async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).toISOString();
      const data = await attendanceApi.getTeamAttendance(teamId, startDate, endDate);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch team attendance', error);
      addToast({ type: 'error', title: 'Failed to fetch team attendance' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [teamId, selectedMonth, selectedYear]);

  const openCorrection = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    const toLocalTimeStr = (dateStr?: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    setCorrectionForm({
      checkIn: toLocalTimeStr(record.checkIn),
      checkOut: toLocalTimeStr(record.checkOut),
      status: record.status,
      notes: record.notes || '',
      correctionReason: ''
    });
    setCorrectionModalOpen(true);
  };

  const handleCorrect = async () => {
    if (!selectedRecord) return;
    if (!correctionForm.correctionReason.trim()) {
      addToast({ type: 'error', title: 'Correction reason is required' });
      return;
    }

    try {
      setCorrecting(true);
      const payload = {
        checkIn: correctionForm.checkIn ? new Date(correctionForm.checkIn).toISOString() : null,
        checkOut: correctionForm.checkOut ? new Date(correctionForm.checkOut).toISOString() : null,
        status: correctionForm.status as AttendanceStatus,
        notes: correctionForm.notes,
        correctionReason: correctionForm.correctionReason
      };
      
      await attendanceApi.correctRecord(selectedRecord._id, payload);
      addToast({ type: 'success', title: 'Attendance record corrected' });
      setCorrectionModalOpen(false);
      fetchAttendance();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to correct record' });
    } finally {
      setCorrecting(false);
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee',
      key: 'user',
      render: (row) => {
        const u = row.user as any;
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{u.email}</div>
          </div>
        );
      },
    },
    {
      header: 'Date',
      key: 'date',
      render: (row) => new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
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
      header: 'Details',
      key: 'notes',
      render: (row) => row.correctedBy ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.85rem' }}>
            <AlertCircle size={14} /> Corrected
          </span>
          {row.correctionReason && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>"{row.correctionReason}"</span>}
        </div>
      ) : (row.notes || '-'),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => openCorrection(row)} leftIcon={<Edit2 size={16} />}>
          Correct
        </Button>
      ),
    },
  ];

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, halfDay: 0, leave: 0 };
    records.forEach(r => {
      if (r.status === AttendanceStatus.PRESENT) counts.present++;
      else if (r.status === AttendanceStatus.ABSENT) counts.absent++;
      else if (r.status === AttendanceStatus.HALF_DAY) counts.halfDay++;
      else if (r.status === AttendanceStatus.ON_LEAVE) counts.leave++;
    });
    return counts;
  }, [records]);

  if (!teamId) {
    return (
      <div className="page-container">
        <PageHeader title="Team Attendance" />
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>You are not assigned to manage any team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader title="Team Attendance" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
          {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
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
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Present</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.present}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Absent</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.absent}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Half Day</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.halfDay}</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total On Leave</div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.leave}</div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        {records.length === 0 && !loading ? (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <Calendar size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>No attendance data available for this period.</p>
          </div>
        ) : (
          <Table
            data={records}
            columns={columns}
            keyExtractor={(item) => item._id}
            isLoading={loading}
          />
        )}
      </div>

      <Modal
        isOpen={correctionModalOpen}
        onClose={() => !correcting && setCorrectionModalOpen(false)}
        title="Correct Attendance Record"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Correcting attendance for {(selectedRecord?.user as any)?.firstName} {(selectedRecord?.user as any)?.lastName} on {selectedRecord && new Date(selectedRecord.date).toLocaleDateString()}.
          </p>
          <Select
            label="Status"
            value={correctionForm.status}
            onChange={(e) => setCorrectionForm({ ...correctionForm, status: e.target.value })}
            options={Object.values(AttendanceStatus).map(s => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))}
          />
          <Input
            label="Check In Time"
            type="datetime-local"
            value={correctionForm.checkIn}
            onChange={(e) => setCorrectionForm({ ...correctionForm, checkIn: e.target.value })}
          />
          <Input
            label="Check Out Time"
            type="datetime-local"
            value={correctionForm.checkOut}
            onChange={(e) => setCorrectionForm({ ...correctionForm, checkOut: e.target.value })}
          />
          <Input
            label="Correction Reason (Required)"
            value={correctionForm.correctionReason}
            onChange={(e) => setCorrectionForm({ ...correctionForm, correctionReason: e.target.value })}
            placeholder="Why is this record being corrected?"
            required
          />
          <Input
            label="Notes (Optional)"
            value={correctionForm.notes}
            onChange={(e) => setCorrectionForm({ ...correctionForm, notes: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="ghost" onClick={() => setCorrectionModalOpen(false)} disabled={correcting}>Cancel</Button>
            <Button variant="primary" onClick={handleCorrect} isLoading={correcting} disabled={!correctionForm.correctionReason.trim()}>
              Save Correction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
