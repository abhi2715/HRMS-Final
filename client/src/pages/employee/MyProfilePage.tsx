import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { employeeApi } from '../../services/employeeApi';
import type { EmployeeProfile } from '../../services/employeeApi';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';

export default function MyProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await employeeApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="page-container">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="page-container">Profile not found.</div>;
  }

  return (
    <div className="page-container">
      <PageHeader title="My Profile" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Personal Details */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: '16px' }}>Personal Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Full Name</span>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>{profile.firstName} {profile.lastName}</span>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Email Address</span>
              <span style={{ fontSize: 'var(--text-md)' }}>{profile.email}</span>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Status</span>
              <div style={{ marginTop: '4px' }}>
                <StatusPill status={profile.isActive ? 'success' : 'error'}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </StatusPill>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: '16px' }}>Employment Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Job Title</span>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>{profile.jobTitle || 'Not Assigned'}</span>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Department / Team</span>
              <span style={{ fontSize: 'var(--text-md)' }}>{profile.team ? (profile.team as any).name : 'Not Assigned'}</span>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Manager (Team Lead)</span>
              <span style={{ fontSize: 'var(--text-md)' }}>
                {profile.teamLead ? `${profile.teamLead.firstName} ${profile.teamLead.lastName}` : 'None'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Joining Date</span>
              <span style={{ fontSize: 'var(--text-md)' }}>
                {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Payroll Details */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: '16px' }}>Payroll Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Current Salary</span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
                {profile.salary ? `$${profile.salary.toLocaleString()}` : 'Not Available'}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
              For detailed payslips and tax documents, please contact HR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
