import { useState } from 'react';
import { EXERCISES, WEEK_SCHEMES, buildWorkoutPlan, epley1RM } from '../utils/wendler';

export default function WorkoutLog({ cycle, exerciseId, weekIndex, settings, onSave, onCancel }) {
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  const scheme = WEEK_SCHEMES[weekIndex];
  const plan = buildWorkoutPlan(cycle.trainingMaxes[exerciseId], weekIndex, settings.unit);

  const existing = cycle.logs[`${exerciseId}-${weekIndex}`];

  const [sets, setSets] = useState(
    plan.map((s, i) => ({
      weight: existing ? existing.sets[i].weight : s.weight,
      reps: existing ? existing.sets[i].reps : '',
    }))
  );

  const updateSet = (idx, field, value) => {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const amrapIdx = plan.findIndex(s => s.amrap);
  const amrapSet = amrapIdx >= 0 ? sets[amrapIdx] : null;
  const e1rm = amrapSet && Number(amrapSet.weight) > 0 && Number(amrapSet.reps) > 0
    ? epley1RM(Number(amrapSet.weight), Number(amrapSet.reps))
    : null;

  const valid = sets.every(s => Number(s.reps) > 0 && Number(s.weight) > 0);

  const handleSave = () => {
    if (!valid) return;
    onSave({
      exerciseId,
      weekIndex,
      date: new Date().toISOString(),
      sets: sets.map(s => ({ weight: Number(s.weight), reps: Number(s.reps) })),
      estimated1RM: e1rm ? Math.round(e1rm * 10) / 10 : 0,
    });
  };

  return (
    <div className="workout-log">
      <div className="log-header">
        <button className="btn ghost" onClick={onCancel}>&larr; Back</button>
        <h2>{exercise.name}</h2>
        <p className="text-secondary">{scheme.label} &middot; Cycle {cycle.number}</p>
      </div>

      <div className="log-sets">
        {plan.map((s, i) => (
          <div key={i} className="log-set-row">
            <div className="set-label">
              Set {i + 1}
              {s.amrap && <span className="amrap-badge">AMRAP</span>}
            </div>
            <div className="set-target">
              {Math.round(s.percentage * 100)}% &rarr; {s.weight} {settings.unit} x {s.targetReps}{s.amrap ? '+' : ''}
            </div>
            <div className="set-inputs">
              <div className="input-group">
                <label>Weight</label>
                <div className="input-row">
                  <input
                    type="number"
                    step="any"
                    value={sets[i].weight}
                    onChange={e => updateSet(i, 'weight', e.target.value)}
                  />
                  <span className="input-suffix">{settings.unit}</span>
                </div>
              </div>
              <div className="input-group">
                <label>Reps</label>
                <input
                  type="number"
                  min="0"
                  value={sets[i].reps}
                  onChange={e => updateSet(i, 'reps', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {e1rm !== null && (
        <div className="e1rm-display">
          Estimated 1RM: <strong>{e1rm.toFixed(1)} {settings.unit}</strong>
          <span className="hint">Based on AMRAP set (Epley formula)</span>
        </div>
      )}

      <div className="log-actions">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={handleSave} disabled={!valid}>
          Save Workout
        </button>
      </div>
    </div>
  );
}
