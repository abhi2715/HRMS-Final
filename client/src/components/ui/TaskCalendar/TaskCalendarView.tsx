import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { Task } from '../../../services/tasksApi';
import { TaskStatus } from '../../../services/tasksApi';
import './TaskCalendarView.css';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskCalendarView({ tasks, onTaskClick }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Group tasks by date string YYYY-MM-DD
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const d = new Date(task.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const renderCells = () => {
    const cells = [];
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    // Empty cells before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasksByDate.get(dateKey) || [];
      const isToday = dateKey === todayStr;

      cells.push(
        <div key={d} className={`calendar-cell ${isToday ? 'today' : ''}`}>
          <div className="calendar-cell-header">
            <span className="calendar-date-num">{d}</span>
          </div>
          <div className="calendar-cell-tasks">
            {dayTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED;
              return (
                <div 
                  key={task._id} 
                  className={`calendar-task-item priority-${task.priority} status-${task.status}`}
                  onClick={() => onTaskClick(task)}
                  title={task.title}
                >
                  <span className="calendar-task-title">{task.title}</span>
                  {isOverdue && <AlertCircle size={12} className="overdue-icon" />}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="task-calendar-view">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={prevMonth} className="calendar-nav-btn"><ChevronLeft size={20} /></button>
          <button onClick={today} className="calendar-today-btn">Today</button>
          <button onClick={nextMonth} className="calendar-nav-btn"><ChevronRight size={20} /></button>
        </div>
        <h2 className="calendar-title">{monthName} {year}</h2>
        <div style={{ width: '100px' }}></div> {/* Spacer for flex balance */}
      </div>
      
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {renderCells()}
      </div>
    </div>
  );
}
