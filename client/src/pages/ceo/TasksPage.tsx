import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/ui/Table/Table';
import type { Column } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { IconButton } from '../../components/ui/Button/IconButton';
import { StatusPill } from '../../components/ui/StatusPill/StatusPill';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import { Modal } from '../../components/ui/Modal/Modal';
import { Drawer } from '../../components/ui/Drawer/Drawer';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { useToast } from '../../components/ui/Toast/Toast';
import { Plus, MoreVertical, Edit2, MessageSquare, CheckCircle, AlertCircle, Link as LinkIcon, Tag, History } from 'lucide-react';
import { KanbanBoard } from '../../components/ui/Kanban/KanbanBoard';
import { TaskCalendarView } from '../../components/ui/TaskCalendar/TaskCalendarView';
import { tasksApi } from '../../services/tasksApi';
import { usersApi } from '../../services/usersApi';
import type { Task, CreateTaskPayload } from '../../services/tasksApi';
import { TaskStatus, TaskPriority } from '../../services/tasksApi';
import type { User } from '../../types/auth.types';
import { UserRole } from '../../types/auth.types';
import { useAuth } from '../../hooks/useAuth';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Views & Filters
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Data
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<CreateTaskPayload & { tagsStr: string, attachmentsStr: string, statusReason?: string }>({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.BACKLOG,
    assignedTo: '',
    progress: 0,
    dueDate: '',
    tagsStr: '',
    attachmentsStr: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { addToast } = useToast();

  const fetchAssignees = useCallback(async () => {
    try {
      if (user?.role === UserRole.CEO) {
        const res = await usersApi.getUsers({ role: UserRole.TEAM_LEAD, limit: 100 });
        setTeamLeads(res.data);
      } else if (user?.role === UserRole.TEAM_LEAD) {
        if (user.team) {
           const teamId = typeof user.team === 'string' ? user.team : user.team._id;
           const res = await usersApi.getUsers({ team: teamId, limit: 100 });
           setTeamMembers(res.data);
        }
      }
    } catch (e) {
      console.error('Failed to load assignees');
    }
  }, [user]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getTasks({ 
        limit: 100,
        search: searchQuery || undefined,
        tags: tagFilter || undefined
      });
      setTasks(res.data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load tasks' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, tagFilter, addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchAssignees();
  }, [fetchAssignees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const parseTags = (str: string) => str.split(',').map(t => t.trim()).filter(Boolean);
  const parseAttachments = (str: string) => str.split(',').map(t => t.trim()).filter(Boolean);

  const handleCreateSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: CreateTaskPayload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        progress: formData.progress,
        dueDate: formData.dueDate,
        tags: parseTags(formData.tagsStr),
        attachments: parseAttachments(formData.attachmentsStr),
        ...(formData.parentTask ? { parentTask: formData.parentTask } : {})
      };
      
      await tasksApi.createTask(payload);
      addToast({ type: 'success', title: 'Task created successfully' });
      setIsCreateModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to create task' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      const payload: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        progress: formData.progress,
        dueDate: formData.dueDate,
        tags: parseTags(formData.tagsStr),
        attachments: parseAttachments(formData.attachmentsStr),
      };

      if (formData.statusReason) {
        payload.statusReason = formData.statusReason;
      }

      await tasksApi.updateTask(selectedTask._id, payload);
      addToast({ type: 'success', title: 'Task updated successfully' });
      setIsEditModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      addToast({ type: 'error', title: error.response?.data?.message || 'Failed to update task' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    try {
      const updatedTask = await tasksApi.addComment(selectedTask._id, commentText);
      setSelectedTask(updatedTask);
      setCommentText('');
      fetchTasks();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to add comment' });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTask(taskId, { status: newStatus });
      fetchTasks();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
      addToast({ type: 'success', title: 'Task status updated' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to update status' });
    }
  };

  const openCreateModal = (parentTaskId?: string) => {
    setFormData({ 
      title: '', 
      description: '', 
      priority: TaskPriority.MEDIUM, 
      status: TaskStatus.BACKLOG, 
      assignedTo: '', 
      progress: 0, 
      dueDate: '',
      tagsStr: '',
      attachmentsStr: '',
      ...(parentTaskId ? { parentTask: parentTaskId } as any : {})
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo._id,
      progress: task.progress,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tagsStr: task.tags ? task.tags.join(', ') : '',
      attachmentsStr: task.attachments ? task.attachments.join(', ') : '',
      statusReason: '',
    });
    setIsEditModalOpen(true);
  };

  const openDrawer = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const statusLabelMap: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    blocked: 'Blocked',
    review: 'Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusColorMap: Record<TaskStatus, 'secondary' | 'primary' | 'warning' | 'success' | 'error' | 'info'> = {
    backlog: 'secondary',
    assigned: 'info',
    in_progress: 'primary',
    blocked: 'error',
    review: 'warning',
    completed: 'success',
    cancelled: 'secondary',
  };

  const columns: Column<Task>[] = [
    {
      header: 'Task',
      key: 'title',
      render: (row: any) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--color-primary)' }} onClick={() => openDrawer(row)}>
            {row.title}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Assigned to: {row.assignedTo.firstName} {row.assignedTo.lastName}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => (
        <StatusPill status={statusColorMap[row.status as TaskStatus]}>
          {statusLabelMap[row.status as TaskStatus]}
        </StatusPill>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row: any) => (
        <span style={{ textTransform: 'capitalize', color: row.priority === 'urgent' ? 'var(--color-error)' : 'inherit', fontWeight: row.priority === 'urgent' ? 600 : 400 }}>
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (row: any) => {
        if (!row.dueDate) return '-';
        const isOverdue = new Date(row.dueDate) < new Date() && row.status !== TaskStatus.COMPLETED && row.status !== TaskStatus.CANCELLED;
        return (
          <span style={{ color: isOverdue ? 'var(--color-error)' : 'inherit', fontWeight: isOverdue ? 500 : 400 }}>
            {new Date(row.dueDate).toLocaleDateString()} {isOverdue && <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/>}
          </span>
        );
      },
    },
    {
      header: 'Progress',
      key: 'progress',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
            <div style={{ width: `${row.progress}%`, height: '100%', backgroundColor: row.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', width: '32px', textAlign: 'right' }}>{row.progress}%</span>
        </div>
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
              id: 'view',
              label: 'View Details',
              icon: <CheckCircle size={16} />,
              onClick: () => openDrawer(row)
            },
            {
              id: 'edit',
              label: 'Edit Task',
              icon: <Edit2 size={16} />,
              onClick: () => openEditModal(row)
            },
            ...(user?.role === UserRole.TEAM_LEAD ? [{
              id: 'create-subtask',
              label: 'Create Sub-task',
              icon: <Plus size={16} />,
              onClick: () => openCreateModal(row._id)
            }] : [])
          ]}
        />
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Tasks"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input 
              placeholder="Filter by tag..." 
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />

            <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button 
                onClick={() => setViewMode('kanban')}
                style={{ padding: '6px 12px', border: 'none', background: viewMode === 'kanban' ? 'var(--color-surface)' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === 'kanban' ? 500 : 400 }}
              >Kanban</button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '6px 12px', border: 'none', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === 'list' ? 500 : 400 }}
              >List</button>
              <button 
                onClick={() => setViewMode('calendar')}
                style={{ padding: '6px 12px', border: 'none', background: viewMode === 'calendar' ? 'var(--color-surface)' : 'transparent', borderRadius: '4px', cursor: 'pointer', boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', fontWeight: viewMode === 'calendar' ? 500 : 400 }}
              >Calendar</button>
            </div>
            {user?.role !== UserRole.EMPLOYEE && (
              <Button onClick={() => openCreateModal()} leftIcon={<Plus size={16} />}>
                Create Task
              </Button>
            )}
          </div>
        }
      />

      {viewMode === 'list' ? (
        <Table
          data={tasks}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={loading}
        />
      ) : viewMode === 'calendar' ? (
        <TaskCalendarView 
          tasks={tasks}
          onTaskClick={openDrawer}
        />
      ) : (
        <KanbanBoard 
          tasks={tasks}
          onTaskClick={openDrawer}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Task Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedTask?.title || 'Task Details'}
      >
        {selectedTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Description</h4>
              <p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{selectedTask.description || 'No description provided.'}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Status</h4>
                <StatusPill status={statusColorMap[selectedTask.status]}>{statusLabelMap[selectedTask.status]}</StatusPill>
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Priority</h4>
                <span style={{ textTransform: 'capitalize' }}>{selectedTask.priority}</span>
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Assigned To</h4>
                <span>{selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}</span>
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Assigner</h4>
                <span>{selectedTask.assigner?.firstName} {selectedTask.assigner?.lastName}</span>
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Due Date</h4>
                <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
              </div>
            </div>

            {selectedTask.tags && selectedTask.tags.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14}/> Tags
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedTask.tags.map(t => (
                    <span key={t} style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--text-xs)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LinkIcon size={14}/> Attachments
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedTask.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Status History */}
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} /> Status History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid var(--color-border)', marginLeft: '8px', paddingLeft: '16px' }}>
                {selectedTask.statusHistory?.map((h, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)' }}>
                      Changed to <strong>{statusLabelMap[h.status]}</strong> by {h.changedBy?.firstName} {h.changedBy?.lastName}
                    </div>
                    {h.reason && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                        "{h.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} /> Comments
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                {selectedTask.comments.length === 0 ? (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>No comments yet.</span>
                ) : (
                  selectedTask.comments.map(c => (
                    <div key={c._id} style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, fontSize: 'var(--text-xs)' }}>{c.author.firstName} {c.author.lastName}</span>
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-xs)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Input 
                  fullWidth 
                  placeholder="Add a comment..." 
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                />
                <Button onClick={handleAddComment} disabled={!commentText.trim()}>Post</Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Task"
        footer={<><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreateSubmit} isLoading={submitting}>Create</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <Input label="Title" name="title" value={formData.title} onChange={handleInputChange} />
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange as any}
              style={{ width: '100%', minHeight: '80px', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Priority" 
              name="priority" 
              value={formData.priority} 
              onChange={handleInputChange}
              options={[
                { label: 'Low', value: TaskPriority.LOW },
                { label: 'Medium', value: TaskPriority.MEDIUM },
                { label: 'High', value: TaskPriority.HIGH },
                { label: 'Urgent', value: TaskPriority.URGENT },
              ]}
            />
            <Select 
              label="Assign To" 
              name="assignedTo" 
              value={formData.assignedTo} 
              onChange={handleInputChange}
              options={[
                { label: 'Select Assignee', value: '' },
                ...(user?.role === UserRole.CEO 
                  ? teamLeads.map(u => ({ label: `${u.firstName} ${u.lastName} (Team Lead)`, value: u._id }))
                  : teamMembers.map(u => ({ label: `${u.firstName} ${u.lastName} (${u.role.replace('_', ' ')})`, value: u._id }))
                )
              ]}
            />
          </div>
          
          <Input label="Tags (comma separated)" name="tagsStr" value={formData.tagsStr} onChange={handleInputChange} placeholder="frontend, urgent" />
          <Input label="Attachment URLs (comma separated)" name="attachmentsStr" value={formData.attachmentsStr} onChange={handleInputChange} placeholder="https://drive.google.com/..." />
          <Input label="Due Date" type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
        footer={<><Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleEditSubmit} isLoading={submitting}>Save Changes</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <Input 
            label="Title" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            disabled={user?.role === UserRole.EMPLOYEE} 
          />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea 
              name="description" 
              rows={4} 
              value={formData.description} 
              onChange={handleInputChange as any} 
              style={{ width: '100%', padding: '8px 12px', resize: 'vertical', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              disabled={user?.role === UserRole.EMPLOYEE}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Priority" 
              name="priority" 
              value={formData.priority} 
              onChange={handleInputChange}
              options={Object.values(TaskPriority).map(p => ({ label: p.toUpperCase(), value: p }))}
              disabled={user?.role === UserRole.EMPLOYEE}
            />
            <Select 
              label="Status" 
              name="status" 
              value={formData.status} 
              onChange={handleInputChange}
              options={Object.values(TaskStatus).map(s => ({ label: s.replace('_', ' ').toUpperCase(), value: s }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Assign To" 
              name="assignedTo" 
              value={formData.assignedTo} 
              onChange={handleInputChange}
              disabled={user?.role === UserRole.EMPLOYEE}
              options={[
                { label: 'Select Assignee', value: '' },
                ...(user?.role === UserRole.CEO 
                  ? teamLeads.map(u => ({ label: `${u.firstName} ${u.lastName} (Team Lead)`, value: u._id }))
                  : teamMembers.map(u => ({ label: `${u.firstName} ${u.lastName} (${u.role.replace('_', ' ')})`, value: u._id }))
                )
              ]}
            />
            <Input 
              label="Due Date" 
              type="date" 
              name="dueDate" 
              value={formData.dueDate} 
              onChange={handleInputChange} 
              disabled={user?.role === UserRole.EMPLOYEE}
            />
          </div>
          
          <Input label="Tags (comma separated)" name="tagsStr" value={formData.tagsStr} onChange={handleInputChange} disabled={user?.role === UserRole.EMPLOYEE} />
          <Input label="Attachment URLs (comma separated)" name="attachmentsStr" value={formData.attachmentsStr} onChange={handleInputChange} disabled={user?.role === UserRole.EMPLOYEE} />

          {selectedTask && formData.status !== selectedTask.status && (
            <Input label="Reason for Status Change" name="statusReason" value={formData.statusReason} onChange={handleInputChange} />
          )}

          <Input 
            label={`Progress (${formData.progress}%)`} 
            type="range" 
            name="progress" 
            min="0" max="100" 
            value={formData.progress} 
            onChange={handleInputChange} 
          />
        </div>
      </Modal>

    </div>
  );
}
