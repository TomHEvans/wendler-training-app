export const EXERCISES = [
  { id: 'squat', name: 'Squat', type: 'lower' },
  { id: 'deadlift', name: 'Deadlift', type: 'lower' },
  { id: 'benchPress', name: 'Bench Press', type: 'upper' },
  { id: 'shoulderPress', name: 'Shoulder Press', type: 'upper' },
];

export const WEEK_SCHEMES = [
  {
    week: 1,
    label: 'Week 1 — 3×5',
    sets: [
      { pct: 0.65, reps: 5, amrap: false },
      { pct: 0.75, reps: 5, amrap: false },
      { pct: 0.85, reps: 5, amrap: true },
    ],
  },
  {
    week: 2,
    label: 'Week 2 — 3×3',
    sets: [
      { pct: 0.70, reps: 3, amrap: false },
      { pct: 0.80, reps: 3, amrap: false },
      { pct: 0.90, reps: 3, amrap: true },
    ],
  },
  {
    week: 3,
    label: 'Week 3 — 5/3/1',
    sets: [
      { pct: 0.75, reps: 5, amrap: false },
      { pct: 0.85, reps: 3, amrap: false },
      { pct: 0.95, reps: 1, amrap: true },
    ],
  },
  {
    week: 4,
    label: 'Week 4 — Deload',
    sets: [
      { pct: 0.40, reps: 5, amrap: false },
      { pct: 0.50, reps: 5, amrap: false },
      { pct: 0.60, reps: 5, amrap: false },
    ],
  },
];

export function calcTrainingMax(oneRepMax, tmPct = 0.9) {
  return oneRepMax * tmPct;
}

export function roundWeight(weight, increment = 2.5) {
  return Math.round(weight / increment) * increment;
}

export function epley1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function getDefaultIncrement(exerciseType, unit) {
  if (unit === 'kg') {
    return exerciseType === 'upper' ? 2.5 : 5;
  }
  return exerciseType === 'upper' ? 5 : 10;
}

export function getRoundIncrement(unit) {
  return unit === 'kg' ? 2.5 : 5;
}

export function buildWorkoutPlan(trainingMax, weekIndex, unit) {
  const scheme = WEEK_SCHEMES[weekIndex];
  const ri = getRoundIncrement(unit);
  return scheme.sets.map(s => ({
    percentage: s.pct,
    targetReps: s.reps,
    amrap: s.amrap,
    weight: roundWeight(trainingMax * s.pct, ri),
  }));
}
