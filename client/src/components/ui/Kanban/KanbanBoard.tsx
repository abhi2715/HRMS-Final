import React from 'react';
import type { Task } from '../../../services/tasksApi';
import { TaskStatus } from '../../../services/tasksApi';
import { Clock, AlertCircle } from 'lucide-react';
import './KanbanBoard.css';

export interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const columns: { id: TaskStatus; title: string }[] = [
    { id: TaskStatus.BACKLOG, title: 'Backlog' },
    { id: TaskStatus.ASSIGNED, title: 'Assigned' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
    { id: TaskStatus.BLOCKED, title: 'Blocked' },
    { id: TaskStatus.REVIEW, title: 'Review' },
    { id: TaskStatus.COMPLETED, title: 'Completed' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">{column.title}</h3>
              <span className="kanban-column-count">{columnTasks.length}</span>
            </div>
            <div className="kanban-column-content">
              {columnTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED;
                return (
                  <div
                    key={task._id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="kanban-card-header">
                      <span className={`kanban-card-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.parentTask && (
                        <span className="kanban-card-child-indicator" title="Child Task">
                          Sub-task
                        </span>
                      )}
                    </div>
                    <h4 className="kanban-card-title">{task.title}</h4>
                    <div className="kanban-card-assignee">
                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                    </div>
                    <div className="kanban-card-footer">
                      <div className="kanban-card-progress">
                        <div className="kanban-progress-bar">
                          <div
                            className="kanban-progress-fill"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="kanban-progress-text">{task.progress}%</span>
                      </div>
                      {task.dueDate && (
                        <div className={`kanban-card-date ${isOverdue ? 'overdue' : ''}`}>
                          {isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
