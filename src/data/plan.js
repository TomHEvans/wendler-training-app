// Hyrox race date
export const RACE_DATE = '2026-05-01';
export const RACE_NAME = 'Hyrox';

// Physio constraints
export const CONSTRAINTS = [
  'No Olympic lifts',
  'No running or squatting weight without a box',
  'No high-weight explosive knee extension movements',
  'Shoulder prehab circuit MUST come before upper body work',
  'Shoulder prehab + knee rehab 3-4x per week',
];

// Shoulder prehab circuit (done as a circuit, 3-4x/week, always before upper body)
export const SHOULDER_PREHAB = {
  id: 'shoulder-prehab',
  title: 'Shoulder Prehab Circuit',
  category: 'prehab',
  frequency: '3-4x/week, always before upper body',
  exercises: [
    { id: 'sp-ext-rot', name: 'External Rotation Holds', sets: 3, reps: '12s hold', notes: '' },
    { id: 'sp-90-90', name: '90/90 Holds', sets: 3, reps: '12s hold', notes: '' },
    { id: 'sp-wall-slides', name: 'Wall Slides', sets: 3, reps: '8', notes: '' },
    { id: 'sp-egyptian', name: 'Egyptian Stretch', sets: 3, reps: '5 x 5s holds', notes: '' },
  ],
};

// Knee rehab exercises (3-4x/week, order doesn't matter)
export const KNEE_REHAB = {
  id: 'knee-rehab',
  title: 'Knee Rehab',
  category: 'rehab',
  frequency: '3-4x/week',
  exercises: [
    { id: 'kr-knee-ext', name: 'Knee Extension Single Leg (90-40 deg)', sets: 3, reps: '8', weight: '14kg', notes: 'Machine' },
    { id: 'kr-crab-walks', name: 'Resisted Crab Walks V3', sets: 3, reps: '12', notes: '' },
    { id: 'kr-copenhagen', name: 'Copenhagen Hip Adduction', sets: 3, reps: '5', hold: '5s', notes: '' },
    { id: 'kr-star-excursion', name: 'SL Star Excursion (4 points)', sets: 2, reps: '4', notes: '' },
    { id: 'kr-lat-step-down', name: 'Lateral Step Down - Heel Tap', sets: 2, reps: '5', notes: '' },
    { id: 'kr-step-downs', name: 'Step Downs', sets: 2, reps: '5', notes: '' },
  ],
};

// Impact training from physio programme
export const IMPACT_TRAINING = {
  id: 'impact-training',
  title: 'Impact Training',
  category: 'impact',
  exercises: [
    { id: 'it-split-jumps', name: 'Heavy Split Jumps', sets: 3, reps: '3', notes: 'Impact training' },
    { id: 'it-switch-step', name: 'Switch Step at Wall', sets: 1, reps: '10', notes: '' },
    { id: 'it-box-jumps', name: 'Step/Box Jumps', sets: 3, reps: '10', notes: '' },
    { id: 'it-rope-skip', name: 'Rope Skipping', sets: 4, reps: '1 min', notes: '' },
  ],
};

// Physio lower body strength programme
export const PHYSIO_STRENGTH = {
  id: 'physio-strength',
  title: 'Physio Lower Body Strength',
  category: 'strength',
  exercises: [
    { id: 'ps-atg-squat', name: 'ATG Heels Elevated Narrow Squat', sets: 3, reps: '8', notes: '' },
    { id: 'ps-box-squat', name: 'Modified Box Squat with Barbell', sets: 3, reps: '12', notes: '' },
    { id: 'ps-leg-press', name: 'Leg Press', sets: 3, reps: '12', notes: '' },
    { id: 'ps-rdl', name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-12', notes: '' },
    { id: 'ps-lunges', name: 'Lunges Walking', sets: 3, reps: '6', notes: '' },
  ],
};

// Hyrox race stations
export const HYROX_STATIONS = [
  { id: 'hx-skierg', name: 'SkiErg', distance: '1000m', notes: '' },
  { id: 'hx-sled-push', name: 'Sled Push', distance: '50m', notes: '' },
  { id: 'hx-sled-pull', name: 'Sled Pull', distance: '50m', notes: '' },
  { id: 'hx-burpee-bj', name: 'Burpee Broad Jumps', distance: '80m', notes: '' },
  { id: 'hx-row', name: 'Rowing', distance: '1000m', notes: '' },
  { id: 'hx-farmers', name: 'Farmers Carry', distance: '200m', notes: '' },
  { id: 'hx-sandbag', name: 'Sandbag Lunges', distance: '100m', notes: '' },
  { id: 'hx-wall-balls', name: 'Wall Balls', reps: '100', notes: '' },
];

// Session type labels and colours
export const SESSION_TYPES = {
  prehab: { label: 'Prehab', color: '#6c5ce7' },
  rehab: { label: 'Rehab', color: '#00b894' },
  strength: { label: 'Strength', color: '#e17055' },
  hyrox: { label: 'Hyrox', color: '#fdcb6e' },
  running: { label: 'Running', color: '#74b9ff' },
  impact: { label: 'Impact', color: '#ff7675' },
  class: { label: 'Class', color: '#a29bfe' },
  conditioning: { label: 'Conditioning', color: '#55efc4' },
  rest: { label: 'Rest', color: '#636e72' },
};

// Helper to get Monday of a given week
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Format date as YYYY-MM-DD
function fmt(d) {
  return d.toISOString().split('T')[0];
}

// Add days to a date
function addDays(d, n) {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function getWeekId(date) {
  const monday = getMonday(date);
  return `week-${fmt(monday)}`;
}

export function getWeekDates(startDate) {
  const mon = new Date(startDate);
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => ({
    dayName: day,
    date: fmt(addDays(mon, i)),
  }));
}

export function getDaysUntilRace() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const race = new Date(RACE_DATE);
  return Math.ceil((race - now) / (1000 * 60 * 60 * 24));
}

export function getWeeksUntilRace() {
  return Math.ceil(getDaysUntilRace() / 7);
}

// Generate the initial 5-week plan (Mar 30 - May 1)
export function generateInitialPlan() {
  const weeks = [];
  let weekStart = new Date('2026-03-30');

  for (let w = 0; w < 5; w++) {
    const weekId = `week-${fmt(weekStart)}`;
    const dates = getWeekDates(fmt(weekStart));
    const weekNum = w + 1;
    const isTaper = weekNum >= 4;
    const isRaceWeek = weekNum === 5;

    const days = {};
    dates.forEach(({ dayName, date }) => {
      days[date] = buildDay(dayName, date, weekNum, isTaper, isRaceWeek);
    });

    weeks.push({
      id: weekId,
      weekNumber: weekNum,
      startDate: fmt(weekStart),
      label: isRaceWeek ? 'Race Week' : isTaper ? `Week ${weekNum} (Taper)` : `Week ${weekNum}`,
      gymPlanNotes: '',
      physioNotes: '',
      days,
    });

    weekStart = addDays(weekStart, 7);
  }

  return weeks;
}

function buildDay(dayName, date, weekNum, isTaper, isRaceWeek) {
  // Race day
  if (date === '2026-05-01') {
    return {
      date,
      dayName,
      label: 'RACE DAY',
      sessions: [{
        id: `${date}-race`,
        type: 'hyrox',
        title: 'HYROX RACE DAY',
        exercises: HYROX_STATIONS.map(s => ({
          id: `${date}-${s.id}`,
          name: s.name,
          sets: 1,
          reps: s.distance || s.reps,
          notes: 'Race pace',
        })),
      }],
    };
  }

  const sessions = [];

  if (dayName === 'Mon') {
    // Monday: Hyrox Stations + Prehab/Rehab
    sessions.push(makePrehabSession(date));
    sessions.push(makeRehabSession(date));
    sessions.push({
      id: `${date}-hyrox`,
      type: 'hyrox',
      title: 'Hyrox Station Practice',
      exercises: [
        { id: `${date}-skierg`, name: 'SkiErg', sets: 4, reps: isTaper ? '250m' : '500m', notes: 'Intervals' },
        { id: `${date}-wallballs`, name: 'Wall Balls', sets: isTaper ? 3 : 4, reps: '20', notes: '' },
        { id: `${date}-row`, name: 'Rowing', sets: 4, reps: isTaper ? '250m' : '500m', notes: 'Intervals' },
      ],
    });
  } else if (dayName === 'Tue') {
    // Tuesday: Lower Body Strength (Physio Programme)
    sessions.push(makePrehabSession(date));
    sessions.push({
      id: `${date}-strength`,
      type: 'strength',
      title: 'Lower Body Strength (Physio Programme)',
      exercises: PHYSIO_STRENGTH.exercises.map(e => ({
        ...e,
        id: `${date}-${e.id}`,
        sets: isTaper ? Math.max(2, e.sets - 1) : e.sets,
      })),
    });
    sessions.push(makeRehabSession(date));
    if (!isTaper) {
      sessions.push({
        id: `${date}-impact`,
        type: 'impact',
        title: 'Impact Training',
        exercises: IMPACT_TRAINING.exercises.map(e => ({
          ...e,
          id: `${date}-${e.id}`,
        })),
      });
    }
  } else if (dayName === 'Wed') {
    // Wednesday: Hyrox Practice + Running
    sessions.push(makePrehabSession(date));
    sessions.push(makeRehabSession(date));
    sessions.push({
      id: `${date}-hyrox`,
      type: 'hyrox',
      title: 'Hyrox Stations + Sled Work',
      exercises: [
        { id: `${date}-sled-push`, name: 'Sled Push', sets: 4, reps: isTaper ? '15m' : '25m', notes: '' },
        { id: `${date}-sled-pull`, name: 'Sled Pull', sets: 4, reps: isTaper ? '15m' : '25m', notes: '' },
        { id: `${date}-burpee-bj`, name: 'Burpee Broad Jumps', sets: 3, reps: isTaper ? '6' : '10', notes: '' },
        { id: `${date}-farmers`, name: 'Farmers Carry', sets: 4, reps: isTaper ? '25m' : '50m', notes: '' },
      ],
    });
  } else if (dayName === 'Thu') {
    // Thursday: Upper Body + Conditioning (shoulder prehab FIRST)
    sessions.push(makePrehabSession(date));
    sessions.push({
      id: `${date}-upper`,
      type: 'strength',
      title: 'Upper Body + Conditioning',
      exercises: [
        { id: `${date}-bench`, name: 'Bench Press / Push-ups', sets: isTaper ? 3 : 4, reps: '8-12', notes: 'Adjust to gym plan' },
        { id: `${date}-rows`, name: 'Bent Over Rows', sets: isTaper ? 3 : 4, reps: '8-12', notes: '' },
        { id: `${date}-ohp`, name: 'Overhead Press (light)', sets: 3, reps: '10-12', notes: 'Light weight, high reps' },
        { id: `${date}-sandbag`, name: 'Sandbag Lunges', sets: 3, reps: isTaper ? '10' : '20', notes: 'Hyrox practice' },
      ],
    });
    if (!isRaceWeek) {
      sessions.push({
        id: `${date}-conditioning`,
        type: 'conditioning',
        title: 'Conditioning Finisher',
        exercises: [
          { id: `${date}-amrap`, name: 'AMRAP 10min: Wall Balls + Burpees + Row', sets: 1, reps: 'AMRAP', notes: isTaper ? 'Easy pace' : 'Race pace effort' },
        ],
      });
    }
  } else if (dayName === 'Fri') {
    // Friday: Hyrox Simulation or Race Day prep
    if (isRaceWeek) {
      sessions.push({
        id: `${date}-rest`,
        type: 'rest',
        title: 'Rest / Light Mobility',
        exercises: [
          { id: `${date}-mobility`, name: 'Light mobility and stretching', sets: 1, reps: '20 min', notes: 'Race tomorrow - stay loose' },
        ],
      });
    } else {
      sessions.push(makeRehabSession(date));
      sessions.push({
        id: `${date}-sim`,
        type: 'hyrox',
        title: isTaper ? 'Light Hyrox Practice' : 'Hyrox Simulation',
        exercises: isTaper
          ? [
              { id: `${date}-easy-sim`, name: 'Walkthrough: 2 stations at 70% effort', sets: 1, reps: 'Easy', notes: 'Pick 2 weakest stations' },
              { id: `${date}-easy-run`, name: 'Easy run', sets: 1, reps: '3km', notes: 'Conversational pace' },
            ]
          : [
              { id: `${date}-run1`, name: 'Run', sets: 1, reps: '1km', notes: 'Between each station' },
              { id: `${date}-full-sim`, name: 'Full/Partial Hyrox Simulation', sets: 1, reps: 'All stations', notes: 'Race pace - practice transitions' },
            ],
      });
    }
  }

  return {
    date,
    dayName,
    label: getDayLabel(dayName, isRaceWeek),
    sessions,
  };
}

function getDayLabel(dayName, isRaceWeek) {
  if (isRaceWeek) {
    const labels = { Mon: 'Light Stations', Tue: 'Easy Strength', Wed: 'Shakeout', Thu: 'Rest/Prep' };
    return labels[dayName] || dayName;
  }
  const labels = {
    Mon: 'Hyrox Stations + Prehab',
    Tue: 'Lower Body Strength',
    Wed: 'Hyrox + Sled Work',
    Thu: 'Upper Body + Conditioning',
    Fri: 'Hyrox Simulation',
  };
  return labels[dayName] || dayName;
}

function makePrehabSession(date) {
  return {
    id: `${date}-prehab`,
    type: 'prehab',
    title: 'Shoulder Prehab Circuit',
    exercises: SHOULDER_PREHAB.exercises.map(e => ({
      ...e,
      id: `${date}-${e.id}`,
    })),
  };
}

function makeRehabSession(date) {
  return {
    id: `${date}-rehab`,
    type: 'rehab',
    title: 'Knee Rehab',
    exercises: KNEE_REHAB.exercises.map(e => ({
      ...e,
      id: `${date}-${e.id}`,
    })),
  };
}
