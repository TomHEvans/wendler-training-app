import { useState } from 'react';
import { EXERCISES, WEEK_SCHEMES, buildWorkoutPlan } from '../utils/wendler';

export default function CyclePlan({ cycle, settings, onLog, onNewCycle, onHistory, onReset }) {
  const [activeWeek, setActiveWeek] = useState(0);

  return (
    <div className="cycle-plan">
      <div className="cycle-header">
        <div>
          <h1>Cycle {cycle.number}</h1>
          <div className="tm-summary">
            {EXERCISES.map(e => (
              <span key={e.id} className="tm-tag">
                {e.name}: {cycle.trainingMaxes[e.id]} {settings.unit}
              </span>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={onHistory}>History</button>
          <button className="btn primary" onClick={onNewCycle}>New Cycle</button>
        </div>
      </div>

      <div className="tabs">
        {WEEK_SCHEMES.map((w, i) => (
          <button
            key={i}
            className={`tab ${activeWeek === i ? 'active' : ''}`}
            onClick={() => setActiveWeek(i)}
          >
            Wk {w.week}
          </button>
        ))}
      </div>

      <p className="week-label">{WEEK_SCHEMES[activeWeek].label}</p>

      <div className="workout-list">
        {EXERCISES.map(ex => {
          const key = `${ex.id}-${activeWeek}`;
          const logged = cycle.logs[key];
          const sets = buildWorkoutPlan(cycle.trainingMaxes[ex.id], activeWeek, settings.unit);

          return (
            <div
              key={ex.id}
              className={`workout-card ${logged ? 'completed' : ''}`}
              onClick={() => onLog(ex.id, activeWeek)}
            >
              <div className="workout-card-header">
                <h3>{ex.name}</h3>
                {logged && <span className="badge done">Logged</span>}
              </div>
              <div className="sets-preview">
                {sets.map((s, i) => (
                  <span key={i} className="set-chip">
                    {s.weight} x {logged ? logged.sets[i].reps : s.targetReps}
                    {s.amrap && !logged ? '+' : ''}
                  </span>
                ))}
              </div>
              {logged && logged.estimated1RM > 0 && (
                <div className="e1rm-note">
                  Est. 1RM: {logged.estimated1RM} {settings.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="app-footer">
        <button className="btn ghost danger" onClick={onReset}>Reset All Data</button>
      </div>
    </div>
  );
}
