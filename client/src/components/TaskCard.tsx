import type { ScheduledTask } from '../types';

const ROBOT_LABEL: Record<string, string> = {
  'qrevo-downstairs': 'Q Revo Master',
  'qrevo-upstairs': 'Q Revo',
};

interface TaskCardProps {
  task: ScheduledTask;
  roomName: string;
  onToggle: (id: string) => void;
  draggable?: boolean;
}

export default function TaskCard({ task, roomName, onToggle, draggable }: TaskCardProps) {
  return (
    <label
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2 transition-colors ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${
        task.completed
          ? 'border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/40'
          : 'border-slate-200 bg-white hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-600'
      }`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="mt-0.5 h-4 w-4 accent-teal-600 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium truncate ${
            task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {task.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">{roomName}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{task.estimatedMinutes} min</span>
          {task.robot && (
            <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/40 rounded-full px-2 py-0.5">
              🤖 {ROBOT_LABEL[task.robot]}
            </span>
          )}
          {task.pinned && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
              📌 moved
            </span>
          )}
        </div>
      </div>
    </label>
  );
}
