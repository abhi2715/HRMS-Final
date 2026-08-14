import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { attendanceApi } from '../../services/attendanceApi';
import type { AttendanceTrend, AttendanceSummary } from '../../services/attendanceApi';
import { useToast } from '../../components/ui/Toast/Toast';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { AttendanceStatus } from '../../../../shared/types/enums';

export default function CeoAttendancePage() {
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);
        
        const [trendsData, summaryData] = await Promise.all([
          attendanceApi.getTrends(days),
          attendanceApi.getSummary(startDate.toISOString(), endDate.toISOString())
        ]);
        
        setTrends(trendsData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        addToast({ type: 'error', title: 'Failed to fetch analytics' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [days]);

  const totalRecords = useMemo(() => {
    if (!summary) return 0;
    return Object.values(summary).reduce((a, b) => a + b, 0);
  }, [summary]);

  const presentRate = useMemo(() => {
    if (!summary || totalRecords === 0) return 0;
    return ((summary[AttendanceStatus.PRESENT] + summary[AttendanceStatus.HALF_DAY] * 0.5) / totalRecords) * 100;
  }, [summary, totalRecords]);

  return (
    <div className="page-container">
      <PageHeader title="Attendance Analytics" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Avg. Attendance Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text)' }}>{presentRate.toFixed(1)}%</div>
          </div>
        </div>
        
        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Total Present</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text)' }}>
              {summary ? summary[AttendanceStatus.PRESENT] : 0}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Total Absent</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text)' }}>
              {summary ? summary[AttendanceStatus.ABSENT] : 0}
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Attendance Trend (Last {days} Days)</h3>
        
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>Loading chart...</div>
        ) : trends.length === 0 ? (
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
            <Calendar size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: '16px' }} />
            <p>No attendance data available for this period.</p>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '32px', position: 'relative' }}>
            {/* Y-axis guidelines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none' }}>
              {[100, 75, 50, 25, 0].map(pct => (
                <div key={pct} style={{ borderTop: '1px dashed var(--color-border)', display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', transform: 'translateY(-50%)', backgroundColor: 'var(--color-surface)', paddingRight: '4px' }}>{pct}%</span>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1, height: '100%' }}>
              {trends.map((t, i) => (
                <div key={i} style={{ flex: 1, margin: '0 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }} title={`${new Date(t.date).toLocaleDateString()}: ${t.rate.toFixed(1)}%`}>
                  <div style={{ 
                    width: '100%', 
                    height: `${t.rate}%`, 
                    backgroundColor: t.rate >= 90 ? '#22c55e' : t.rate >= 75 ? '#eab308' : '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }}></div>
                  {/* X-axis labels (sparse to avoid crowding) */}
                  {i % Math.ceil(trends.length / 7) === 0 && (
                    <div style={{ position: 'absolute', bottom: '-24px', fontSize: '10px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                      {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
