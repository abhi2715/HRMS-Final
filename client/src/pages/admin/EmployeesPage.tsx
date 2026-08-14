import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { IconButton } from '../../components/ui/Button/IconButton';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmDialog } from '../../components/ui/Modal/ConfirmDialog';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { useToast } from '../../components/ui/Toast/Toast';
import { Plus, MoreVertical, Edit2, UserX, UserCheck } from 'lucide-react';
import { usersApi } from '../../services/usersApi';
import { teamsApi } from '../../services/teamsApi';
import type { User } from '../../types/auth.types';
import type { Team } from '../../services/teamsApi';

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    jobTitle: '',
    teamId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const fetchTeams = useCallback(async () => {
    try {
      const res = await teamsApi.getTeams();
      setTeams(res);
    } catch (e) {
      console.error('Failed to load teams');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersApi.getUsers({ limit: 100 });
      setUsers(res.data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, [fetchUsers, fetchTeams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async () => {
    try {
      setSubmitting(true);
      await usersApi.createUser(formData as any);
      addToast({ type: 'success', title: 'Employee created successfully' });
      setIsCreateModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'employee', jobTitle: '', teamId: '' });
      fetchUsers();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to create employee' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const updateData = { ...formData };
      if (!updateData.password) delete (updateData as any).password;
      if (!updateData.teamId) delete (updateData as any).teamId;
      await usersApi.updateUser(selectedUser._id, updateData as any);
      addToast({ type: 'success', title: 'Employee updated successfully' });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to update employee' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'employee', jobTitle: '', teamId: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      jobTitle: user.jobTitle || '',
      teamId: (user.team as any)?._id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser || !confirmAction) return;
    try {
      await usersApi.updateUser(selectedUser._id, { isActive: confirmAction === 'activate' });
      addToast({ type: 'success', title: `User ${confirmAction}d successfully` });
      fetchUsers();
    } catch (error) {
      addToast({ type: 'error', title: `Failed to ${confirmAction} user` });
    } finally {
      setIsConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Employee',
      key: 'firstName',
      render: (row: any) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      key: 'role',
      render: (row: any) => <span style={{ textTransform: 'capitalize' }}>{row.role.replace('_', ' ')}</span>,
    },
    {
      header: 'Job Title',
      key: 'jobTitle',
      render: (row: any) => row.jobTitle || '-',
    },
    {
      header: 'Team',
      key: 'team',
      render: (row: any) => (row.team as any)?.name || '-',
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
              label: 'Edit Employee',
              icon: <Edit2 size={16} />,
              onClick: () => openEditModal(row)
            },
            {
              id: 'status',
              label: row.isActive ? 'Deactivate' : 'Activate',
              icon: row.isActive ? <UserX size={16} /> : <UserCheck size={16} />,
              danger: row.isActive,
              onClick: () => {
                setSelectedUser(row);
                setConfirmAction(row.isActive ? 'deactivate' : 'activate');
                setIsConfirmOpen(true);
              }
            }
          ]}
        />
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Employees"
        actions={
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />}>
            Add Employee
          </Button>
        }
      />

      <Table
        data={users}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmAction === 'activate' ? 'Activate User' : 'Deactivate User'}
        message={`Are you sure you want to ${confirmAction} ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
        confirmText={confirmAction === 'activate' ? 'Activate' : 'Deactivate'}
        isDestructive={confirmAction === 'deactivate'}
        onConfirm={handleToggleStatus}
      />

      {/* Note: Modals for Create and Edit are simplified here for brevity but should contain forms using the Form components */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Employee"
        footer={<><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreateSubmit} isLoading={submitting}>Create</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Role" 
              name="role" 
              value={formData.role} 
              onChange={handleInputChange}
              options={[
                { label: 'Employee', value: 'EMPLOYEE' },
                { label: 'Team Lead', value: 'TEAM_LEAD' },
                { label: 'CEO', value: 'CEO' },
                { label: 'Admin', value: 'ADMIN' },
              ]}
            />
            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
          </div>
          <Select 
            label="Assign to Team" 
            name="teamId" 
            value={formData.teamId} 
            onChange={handleInputChange}
            options={[
              { label: 'None', value: '' },
              ...teams.map(t => ({ label: t.name, value: t._id }))
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        footer={<><Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleEditSubmit} isLoading={submitting}>Save Changes</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} />
          <Input label="New Password (leave blank to keep current)" type="password" name="password" value={formData.password} onChange={handleInputChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Role" 
              name="role" 
              value={formData.role} 
              onChange={handleInputChange}
              options={[
                { label: 'Employee', value: 'EMPLOYEE' },
                { label: 'Team Lead', value: 'TEAM_LEAD' },
                { label: 'CEO', value: 'CEO' },
                { label: 'Admin', value: 'ADMIN' },
              ]}
            />
            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
          </div>
          <Select 
            label="Assign to Team" 
            name="teamId" 
            value={formData.teamId} 
            onChange={handleInputChange}
            options={[
              { label: 'None', value: '' },
              ...teams.map(t => ({ label: t.name, value: t._id }))
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
