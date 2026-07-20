import type { AppData, ScheduleSettings } from '../types';
import { ROOMS, TASK_TEMPLATES } from '../seedData';
import { generateWeekSchedule, getMonday, toDateKey } from '../scheduler';
import { getGithubConfig, getFile, putFile } from './github';

export class NotConnectedError extends Error {
  constructor() {
    super('Not connected to GitHub yet.');
  }
}

function requireConfig() {
  const cfg = getGithubConfig();
  if (!cfg) throw new NotConnectedError();
  return cfg;
}

function defaultAppData(): AppData {
  return {
    rooms: ROOMS,
    taskTemplates: TASK_TEMPLATES,
    settings: {
      activeDaysPerWeek: 5,
      excludedWeekdays: [0, 6],
    },
    scheduledTasks: [],
    rotationState: {},
    weekStart: '',
  };
}

function isCurrentWeek(weekStart: string): boolean {
  return weekStart === toDateKey(getMonday(new Date()));
}

export async function fetchData(): Promise<AppData> {
  const cfg = requireConfig();
  let data = await getFile(cfg);
  if (!data) {
    data = generateWeekSchedule(defaultAppData());
    await putFile(cfg, data, 'Create initial Iris Tidy Organiser data');
    return data;
  }
  if (!isCurrentWeek(data.weekStart)) {
    data = generateWeekSchedule(data);
    await putFile(cfg, data, 'Roll over to new week');
  }
  return data;
}

export async function saveData(data: AppData): Promise<AppData> {
  const cfg = requireConfig();
  await putFile(cfg, data, 'Update schedule');
  return data;
}

export async function regenerate(settings?: ScheduleSettings): Promise<AppData> {
  const cfg = requireConfig();
  let data = await getFile(cfg);
  if (!data) data = defaultAppData();
  if (settings) data.settings = settings;
  const updated = generateWeekSchedule(data, new Date());
  await putFile(cfg, updated, 'Regenerate schedule');
  return updated;
}
