import { useState } from 'react';
import {
  EXERCISES,
  calcTrainingMax,
  getDefaultIncrement,
  getRoundIncrement,
  roundWeight,
} from '../utils/wendler';

export default function NewCycle({ currentCycle, settings, onComplete, onCancel }) {
  const ri = getRoundIncrement(settings.unit);

  const suggestions = {};
  EXERCISES.forEach(ex => {
    const currentTM = currentCycle.trainingMaxes[ex.id];
    const increment = getDefaultIncrement(ex.type, settings.unit);
    const standard = roundWeight(currentTM + increment, ri);

    let bestE1RM = 0;
    Object.entries(currentCycle.logs).forEach(([key, log]) => {
      if (key.startsWith(ex.id) && log.estimated1RM > bestE1RM) {
        bestE1RM = log.estimated1RM;
      }
    });

    const e1rmBased = bestE1RM > 0
      ? roundWeight(calcTrainingMax(bestE1RM, settings.tmPct), ri)
      : null;

    suggestions[ex.id] = { currentTM, standard, bestE1RM, e1rmBased };
  });

  const [newTMs, setNewTMs] = useState(() => {
    const tms = {};
    EXERCISES.forEach(ex => {
      tms[ex.id] = suggestions[ex.id].standard;
    });
    return tms;
  });

  const setTM = (id, val) => setNewTMs(prev => ({ ...prev, [id]: Number(val) }));

  const handleSubmit = () => {
    onComplete(newTMs);
  };

  return (
    <div className="new-cycle">
      <h2>New Cycle</h2>
      <p className="text-secondary">
        Set training maxes for Cycle {currentCycle.number + 1}.
      </p>

      {EXERCISES.map(ex => {
        const s = suggestions[ex.id];
        return (
          <div key={ex.id} className="card tm-card">
            <h3>{ex.name}</h3>
            <div className="tm-info">
              <span>Current TM: {s.currentTM} {settings.unit}</span>
              {s.bestE1RM > 0 && (
                <span>Best est. 1RM this cycle: {s.bestE1RM.toFixed(1)} {settings.unit}</span>
              )}
            </div>
            <div className="tm-suggestions">
              <button
                type="button"
                className={`suggestion ${newTMs[ex.id] === s.standard ? 'active' : ''}`}
                onClick={() => setTM(ex.id, s.standard)}
              >
                Standard: {s.standard}
              </button>
              {s.e1rmBased && (
                <button
                  type="button"
                  className={`suggestion ${newTMs[ex.id] === s.e1rmBased ? 'active' : ''}`}
                  onClick={() => setTM(ex.id, s.e1rmBased)}
                >
                  From e1RM: {s.e1rmBased}
                </button>
              )}
            </div>
            <div className="input-row">
              <input
                type="number"
                step="any"
                value={newTMs[ex.id]}
                onChange={e => setTM(ex.id, e.target.value)}
              />
              <span className="input-suffix">{settings.unit}</span>
            </div>
          </div>
        );
      })}

      <div className="form-actions">
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={handleSubmit}>
          Start Cycle {currentCycle.number + 1}
        </button>
      </div>
    </div>
  );
}
