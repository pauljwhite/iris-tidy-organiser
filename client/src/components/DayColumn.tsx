import { useState } from 'react';
import type { Room, ScheduledTask } from '../types';
import TaskCard from './TaskCard';
import { formatDayLabel } from '../utils/date';

interface DayColumnProps {
  dateKey: string;
  tasks: ScheduledTask[];
  rooms: Room[];
  isToday: boolean;
  onToggle: (id: string) => void;
  onDropTask: (taskId: string, dateKey: string) => void;
}

export default function DayColumn({
  dateKey,
  tasks,
  rooms,
  isToday,
  onToggle,
  onDropTask,
}: DayColumnProps) {
  const { weekday, date } = formatDayLabel(dateKey);
  const roomName = (roomId: string) => rooms.find((r) => r.id === roomId)?.name ?? roomId;
  const totalMinutes = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const doneCount = tasks.filter((t) => t.completed).length;
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) onDropTask(taskId, dateKey);
      }}
      className={`flex flex-col rounded-lg border min-w-[240px] flex-1 transition-colors ${
        dragOver
          ? 'border-teal-500 bg-teal-50/70 dark:border-teal-500 dark:bg-teal-950/30'
          : isToday
          ? 'border-teal-400 bg-teal-50/40 dark:border-teal-700 dark:bg-teal-950/20'
          : 'border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/30'
      }`}
    >
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-baseline justify-between">
          <p className={`font-semibold text-sm ${isToday ? 'text-teal-700 dark:text-teal-300' : ''}`}>
            {weekday}
            {isToday && <span className="ml-1.5 text-xs font-normal">(today)</span>}
          </p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {doneCount}/{tasks.length} done · {totalMinutes} min
        </p>
      </div>
      <div className="flex-1 p-2 space-y-1.5 min-h-[80px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 px-1 py-2">Nothing scheduled</p>
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} roomName={roomName(t.roomId)} onToggle={onToggle} draggable />
          ))
        )}
      </div>
    </div>
  );
}
