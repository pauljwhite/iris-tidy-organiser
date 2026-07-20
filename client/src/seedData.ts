import type { Room, TaskTemplate, Frequency, Robot } from './types';

export const ROOMS: Room[] = [
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'dining-room', name: 'Dining Room' },
  { id: 'living-room', name: 'Living Room' },
  { id: 'stairs-hallway', name: 'Stairs/Hallways' },
  { id: 'downstairs-toilet', name: 'Downstairs Toilet' },
  { id: 'landing', name: 'Landing' },
  { id: 'office', name: 'Office' },
  { id: 'main-bathroom', name: 'Main Bathroom' },
  { id: 'master-bedroom', name: 'Master Bedroom' },
  { id: 'en-suite', name: 'En Suite' },
  { id: 'guest-bedroom', name: 'Guest Bedroom' },
];

let counter = 0;
function task(
  roomId: string,
  name: string,
  estimatedMinutes: number,
  frequency: Frequency,
  robot: Robot = null
): TaskTemplate {
  counter += 1;
  return { id: `t${counter}`, roomId, name, estimatedMinutes, frequency, robot };
}

// Robot coverage: Q Revo Master (downstairs) handles hard-floor/carpet vacuuming
// on the ground floor; Q Revo (upstairs) handles the upper floor. Stairs are
// manual - robots can't climb them.
const DOWNSTAIRS: Robot = 'qrevo-downstairs';
const UPSTAIRS: Robot = 'qrevo-upstairs';

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Kitchen
  task('kitchen', 'Wipe down surfaces', 10, 'weekly'),
  task('kitchen', 'Clean hob', 10, 'weekly'),
  task('kitchen', 'Mop floor', 10, 'weekly', DOWNSTAIRS),
  task('kitchen', 'Empty bins', 5, 'weekly'),
  task('kitchen', 'Clean inside microwave', 10, 'fortnightly'),
  task('kitchen', 'Clean oven', 20, 'monthly'),

  // Dining Room
  task('dining-room', 'Wipe table & chairs', 5, 'weekly'),
  task('dining-room', 'Vacuum/mop floor', 5, 'weekly', DOWNSTAIRS),

  // Living Room
  task('living-room', 'Dust surfaces', 10, 'weekly'),
  task('living-room', 'Vacuum', 5, 'weekly', DOWNSTAIRS),
  task('living-room', 'Tidy & declutter', 10, 'weekly'),

  // Stairs/Hallways
  task('stairs-hallway', 'Vacuum stairs', 10, 'weekly'),
  task('stairs-hallway', 'Wipe bannister & skirting boards', 10, 'fortnightly'),

  // Downstairs Toilet
  task('downstairs-toilet', 'Clean toilet & sink', 10, 'weekly'),
  task('downstairs-toilet', 'Mop floor', 5, 'weekly', DOWNSTAIRS),

  // Landing
  task('landing', 'Vacuum', 5, 'weekly', UPSTAIRS),
  task('landing', 'Dust surfaces', 5, 'fortnightly'),

  // Office
  task('office', 'Declutter desk', 10, 'weekly'),
  task('office', 'Vacuum/dust', 10, 'weekly', UPSTAIRS),
  task('office', 'Wipe screens & equipment', 5, 'fortnightly'),

  // Main Bathroom
  task('main-bathroom', 'Clean bath/shower', 15, 'weekly'),
  task('main-bathroom', 'Clean toilet & sink', 10, 'weekly'),
  task('main-bathroom', 'Mop floor', 5, 'weekly'),

  // Master Bedroom
  task('master-bedroom', 'Change sheets', 10, 'weekly'),
  task('master-bedroom', 'Tidy & declutter', 10, 'weekly'),
  task('master-bedroom', 'Vacuum', 5, 'weekly', UPSTAIRS),
  task('master-bedroom', 'Dust surfaces', 5, 'fortnightly'),

  // En Suite
  task('en-suite', 'Clean shower', 10, 'weekly'),
  task('en-suite', 'Clean toilet & sink', 10, 'weekly'),

  // Guest Bedroom
  task('guest-bedroom', 'Tidy & dust', 10, 'fortnightly'),
  task('guest-bedroom', 'Vacuum', 5, 'fortnightly', UPSTAIRS),
  task('guest-bedroom', 'Change sheets', 10, 'monthly'),
];
