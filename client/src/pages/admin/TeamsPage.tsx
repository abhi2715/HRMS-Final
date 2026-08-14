import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { IconButton } from '../../components/ui/Button/IconButton';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { Plus, MoreVertical, Edit2 } from 'lucide-react';
import { teamsApi } from '../../services/teamsApi';
import { usersApi } from '../../services/usersApi';
import type { Team } from '../../services/teamsApi';
import type { User } from '../../types/auth.types';
import { useToast } from '../../components/ui/Toast/Toast';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [managers, setManagers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const fetchManagers = useCallback(async () => {
    try {
      const res = await usersApi.getUsers({ role: 'TEAM_LEAD', limit: 100 });
      setManagers(res.data);
    } catch (e) {
      console.error('Failed to load managers');
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getTeams();
      setTeams(data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load teams' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTeams();
    fetchManagers();
  }, [fetchTeams, fetchManagers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async () => {
    try {
      setSubmitting(true);
      await teamsApi.createTeam(formData);
      addToast({ type: 'success', title: 'Team created successfully' });
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', managerId: '' });
      fetchTeams();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to create team' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTeam) return;
    try {
      setSubmitting(true);
      const updateData = { ...formData };
      if (!updateData.managerId) delete (updateData as any).managerId;
      await teamsApi.updateTeam(selectedTeam._id, updateData);
      addToast({ type: 'success', title: 'Team updated successfully' });
      setIsEditModalOpen(false);
      fetchTeams();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to update team' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', managerId: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      managerId: (team.manager as any)?._id || ''
    });
    setIsEditModalOpen(true);
  };

  const columns: Column<Team>[] = [
    {
      header: 'Team Name',
      key: 'name',
      render: (row: any) => <span style={{ fontWeight: 500 }}>{row.name}</span>,
    },
    {
      header: 'Manager',
      key: 'manager',
      render: (row: any) => row.manager ? `${row.manager.firstName} ${row.manager.lastName}` : <span style={{ color: 'var(--color-text-tertiary)' }}>Unassigned</span>,
    },
    {
      header: 'Members',
      key: 'memberCount',
      render: (row: any) => row.memberCount || 0,
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (row: any) => (
        <StatusPill status={row.isActive ? 'success' : 'error'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusPill>
      ),
    },
    {
      header: '',
      key: '_id',
      render: (row: any) => (
        <Dropdown
          align="right"
          trigger={<IconButton icon={<MoreVertical size={16} />} aria-label="Actions" variant="ghost" />}
          items={[
            {
              id: 'edit',
              label: 'Edit Team',
              icon: <Edit2 size={16} />,
              onClick: () => openEditModal(row)
            }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Teams"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />}>
            Create Team
          </Button>
        }
      />

      <Table
        data={teams}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Team"
        footer={<><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreateSubmit} isLoading={submitting}>Create</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <Input label="Team Name" name="name" value={formData.name} onChange={handleInputChange} />
          <Input label="Description" name="description" value={formData.description} onChange={handleInputChange} />
          <Select 
            label="Assign Manager (Optional)" 
            name="managerId" 
            value={formData.managerId} 
            onChange={handleInputChange}
            options={[
              { label: 'None', value: '' },
              ...managers.map(m => ({ label: `${m.firstName} ${m.lastName}`, value: m._id }))
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Team"
        footer={<><Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleEditSubmit} isLoading={submitting}>Save Changes</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <Input label="Team Name" name="name" value={formData.name} onChange={handleInputChange} />
          <Input label="Description" name="description" value={formData.description} onChange={handleInputChange} />
          <Select 
            label="Assign Manager (Optional)" 
            name="managerId" 
            value={formData.managerId} 
            onChange={handleInputChange}
            options={[
              { label: 'None', value: '' },
              ...managers.map(m => ({ label: `${m.firstName} ${m.lastName}`, value: m._id }))
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
