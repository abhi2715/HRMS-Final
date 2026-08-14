import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { organizationApi } from '../../services/organizationApi';
import type { OrganizationHierarchy } from '../../services/organizationApi';
import { useToast } from '../../components/ui/Toast/Toast';
import { Card } from '../../components/ui/Card/Card';
import { User, Users, Briefcase } from 'lucide-react';
import './OrganizationPage.css';

export default function OrganizationPage() {
  const [hierarchy, setHierarchy] = useState<OrganizationHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationApi.getHierarchy();
      setHierarchy(data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load organization hierarchy' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  if (loading) {
    return <div className="dashboard-page" style={{ padding: '2rem' }}>Loading hierarchy...</div>;
  }

  return (
    <div className="dashboard-page">
      <PageHeader title="Organization Structure" />

      <div className="org-hierarchy">
        {/* CEO Level */}
        <div className="org-level">
          <h3 className="org-level__title">Executive Leadership</h3>
          <div className="org-cards">
            {hierarchy?.ceos.map((ceo) => (
              <Card key={ceo._id} className="org-card org-card--ceo">
                <div className="org-card__header">
                  <div className="org-card__avatar">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h4 className="org-card__name">{ceo.firstName} {ceo.lastName}</h4>
                    <span className="org-card__role">{ceo.jobTitle || 'CEO'}</span>
                  </div>
                </div>
              </Card>
            ))}
            {hierarchy?.ceos.length === 0 && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>No executive leadership assigned.</p>
            )}
          </div>
        </div>

        {/* Teams Level */}
        <div className="org-level">
          <h3 className="org-level__title">Teams & Departments</h3>
          <div className="org-teams-grid">
            {hierarchy?.teams.map((team) => (
              <Card key={team._id} className="org-team-card">
                <div className="org-team-card__header">
                  <h4 className="org-team-card__name">{team.name}</h4>
                  
                  {team.manager ? (
                    <div className="org-team-card__manager">
                      <div className="org-team-card__manager-avatar">
                        <User size={12} />
                      </div>
                      <div className="org-team-card__manager-info">
                        <span className="org-team-card__manager-name">{team.manager.firstName} {team.manager.lastName}</span>
                        <span className="org-team-card__manager-role">Team Lead</span>
                      </div>
                    </div>
                  ) : (
                    <span className="org-team-card__no-manager">No Team Lead</span>
                  )}
                </div>

                <div className="org-team-card__members">
                  <div className="org-team-card__members-header">
                    <Users size={14} />
                    <span>Members ({team.members?.length || 0})</span>
                  </div>
                  <ul className="org-team-card__members-list">
                    {team.members?.map((member) => (
                      <li key={member._id} className="org-team-card__member">
                        <span className="org-team-card__member-name">{member.firstName} {member.lastName}</span>
                        <span className="org-team-card__member-title">{member.jobTitle || 'Employee'}</span>
                      </li>
                    ))}
                    {(!team.members || team.members.length === 0) && (
                      <li className="org-team-card__member org-team-card__member--empty">No members assigned</li>
                    )}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
