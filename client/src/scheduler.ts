import type { AppData, ScheduledTask, TaskTemplate } from './types';

const ROBOT_ASSIST_MINUTES = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function weekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function weekIndex(monday: Date): number {
  return Math.round(monday.getTime() / MS_PER_DAY / 7);
}

function effectiveMinutes(template: TaskTemplate): number {
  return template.robot ? ROBOT_ASSIST_MINUTES : template.estimatedMinutes;
}

function isDue(
  template: TaskTemplate,
  wIndex: number,
  rotationState: Record<string, number>
): boolean {
  if (template.frequency === 'weekly') return true;
  const interval = template.frequency === 'fortnightly' ? 2 : 4;
  const last = rotationState[template.id];
  if (last === undefined) return true;
  return wIndex - last >= interval;
}

/** Pick N weekday indices (0-6) spread evenly across the eligible list. */
function pickActiveWeekdays(eligible: number[], count: number): number[] {
  const n = Math.min(count, eligible.length);
  if (n <= 0) return [];
  if (n === eligible.length) return eligible;
  if (n === 1) return [eligible[Math.floor((eligible.length - 1) / 2)]];
  const picked = new Set<number>();
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (eligible.length - 1)) / (n - 1));
    picked.add(eligible[idx]);
  }
  return eligible.filter((d) => picked.has(d));
}

export function generateWeekSchedule(data: AppData, now: Date = new Date()): AppData {
  const monday = getMonday(now);
  const wIndex = weekIndex(monday);
  const thisWeekStart = toDateKey(monday);
  const isNewWeek = data.weekStart !== thisWeekStart;

  const rotationState = { ...data.rotationState };
  const templatesById = new Map(data.taskTemplates.map((t) => [t.id, t]));

  // Preserve pinned tasks from the current week's schedule (only meaningful if
  // we're regenerating within the same week, e.g. after a settings change).
  const existingForWeek = isNewWeek
    ? []
    : data.scheduledTasks.filter((t) => t.date >= thisWeekStart);
  const pinned = existingForWeek.filter((t) => t.pinned && templatesById.has(t.templateId));
  const completedByTemplate = new Map(
    existingForWeek.filter((t) => t.completed).map((t) => [t.templateId, t])
  );

  const eligibleWeekdays = [0, 1, 2, 3, 4, 5, 6].filter(
    (d) => !data.settings.excludedWeekdays.includes(d)
  );
  const activeWeekdaySet = new Set(
    pickActiveWeekdays(eligibleWeekdays, data.settings.activeDaysPerWeek)
  );
  const dates = weekDates(monday);
  const activeDates = dates.filter((d) => activeWeekdaySet.has(d.getDay())).map(toDateKey);

  const dayTotals = new Map<string, number>(activeDates.map((d) => [d, 0]));
  const pinnedTemplateIds = new Set(pinned.map((t) => t.templateId));
  for (const p of pinned) {
    if (dayTotals.has(p.date)) {
      dayTotals.set(p.date, (dayTotals.get(p.date) ?? 0) + p.estimatedMinutes);
    } else {
      // Pinned task's day is no longer active; keep it on its original day anyway.
      dayTotals.set(p.date, p.estimatedMinutes);
      activeDates.push(p.date);
    }
  }

  // Determine this week's due templates, update rotation state for newly-due ones.
  // Templates already committed to this week's schedule stay included even if
  // regenerating mid-week (e.g. after a settings change) - only a genuine week
  // rollover should re-evaluate fortnightly/monthly due-ness and advance rotation.
  const committedThisWeek = new Set(existingForWeek.map((t) => t.templateId));
  const duePool: TaskTemplate[] = [];
  for (const template of data.taskTemplates) {
    if (pinnedTemplateIds.has(template.id)) continue;
    const alreadyCommitted = !isNewWeek && committedThisWeek.has(template.id);
    if (alreadyCommitted || isDue(template, wIndex, rotationState)) {
      duePool.push(template);
      if (isNewWeek && template.frequency !== 'weekly') rotationState[template.id] = wIndex;
    }
  }

  // Group remaining (non-pinned) tasks by room, assign whole rooms to the
  // currently-lightest active day so same-room tasks land together.
  const byRoom = new Map<string, TaskTemplate[]>();
  for (const t of duePool) {
    if (!byRoom.has(t.roomId)) byRoom.set(t.roomId, []);
    byRoom.get(t.roomId)!.push(t);
  }
  const roomGroups = Array.from(byRoom.values()).sort(
    (a, b) =>
      b.reduce((s, t) => s + effectiveMinutes(t), 0) -
      a.reduce((s, t) => s + effectiveMinutes(t), 0)
  );

  const maxPerDay = data.settings.maxMinutesPerDay;
  function lightestDay(): string {
    const under = maxPerDay
      ? activeDates.filter((d) => (dayTotals.get(d) ?? 0) < maxPerDay)
      : activeDates;
    const pool = under.length > 0 ? under : activeDates;
    return pool.reduce((min, d) =>
      (dayTotals.get(d) ?? 0) < (dayTotals.get(min) ?? 0) ? d : min
    , pool[0]);
  }

  const newScheduled: ScheduledTask[] = [...pinned];
  for (const group of roomGroups) {
    if (activeDates.length === 0) break;
    const day = lightestDay();
    for (const template of group) {
      const minutes = effectiveMinutes(template);
      const prevCompleted = completedByTemplate.get(template.id);
      newScheduled.push({
        id: `${template.id}-${thisWeekStart}`,
        templateId: template.id,
        date: day,
        roomId: template.roomId,
        name: template.name,
        estimatedMinutes: minutes,
        robot: template.robot,
        completed: prevCompleted?.completed ?? false,
        completedAt: prevCompleted?.completedAt,
        pinned: false,
      });
      dayTotals.set(day, (dayTotals.get(day) ?? 0) + minutes);
    }
  }

  return {
    ...data,
    settings: data.settings,
    scheduledTasks: [
      ...data.scheduledTasks.filter((t) => t.date < thisWeekStart),
      ...newScheduled,
    ],
    rotationState,
    weekStart: thisWeekStart,
  };
}
