import type { Frequency, Robot, Room, TaskTemplate } from '../types';

interface RoomEditorProps {
  room: Room;
  tasks: TaskTemplate[];
  onUpdate: (id: string, patch: Partial<TaskTemplate>) => void;
  onDelete: (id: string) => void;
  onAdd: (roomId: string) => void;
}

const ROBOT_OPTIONS: { value: Robot; label: string }[] = [
  { value: null, label: 'Manual' },
  { value: 'qrevo-downstairs', label: 'Q Revo Master (downstairs)' },
  { value: 'qrevo-upstairs', label: 'Q Revo (upstairs)' },
];

export default function RoomEditor({ room, tasks, onUpdate, onDelete, onAdd }: RoomEditorProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{room.name}</h3>
        <button
          type="button"
          onClick={() => onAdd(room.id)}
          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          + Add task
        </button>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-slate-400">No tasks for this room yet.</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-md p-2"
          >
            <input
              type="text"
              value={task.name}
              onChange={(e) => onUpdate(task.id, { name: e.target.value })}
              className="flex-1 min-w-[140px] rounded border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={1}
              value={task.estimatedMinutes}
              onChange={(e) => onUpdate(task.id, { estimatedMinutes: Number(e.target.value) })}
              className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
            />
            <span className="text-xs text-slate-400">min</span>
            <select
              value={task.frequency}
              onChange={(e) => onUpdate(task.id, { frequency: e.target.value as Frequency })}
              className="rounded border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={task.robot ?? ''}
              onChange={(e) => onUpdate(task.id, { robot: (e.target.value || null) as Robot })}
              className="rounded border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
            >
              {ROBOT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="text-slate-400 hover:text-red-500 text-sm px-1"
              aria-label={`Delete ${task.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
