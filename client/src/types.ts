export type Frequency = 'weekly' | 'fortnightly' | 'monthly';
export type Robot = 'qrevo-downstairs' | 'qrevo-upstairs' | null;

export interface Room {
  id: string;
  name: string;
}

export interface TaskTemplate {
  id: string;
  roomId: string;
  name: string;
  estimatedMinutes: number;
  frequency: Frequency;
  robot: Robot;
}

export interface ScheduleSettings {
  activeDaysPerWeek: number;
  excludedWeekdays: number[];
  maxMinutesPerDay?: number;
}

export interface ScheduledTask {
  id: string;
  templateId: string;
  date: string;
  roomId: string;
  name: string;
  estimatedMinutes: number;
  robot: Robot;
  completed: boolean;
  completedAt?: string;
  pinned: boolean;
}

export interface AppData {
  rooms: Room[];
  taskTemplates: TaskTemplate[];
  settings: ScheduleSettings;
  scheduledTasks: ScheduledTask[];
  rotationState: Record<string, number>;
  weekStart: string;
}
