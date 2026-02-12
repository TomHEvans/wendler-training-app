import { useState } from 'react';
import { EXERCISES } from '../utils/wendler';

export default function Setup({ onComplete }) {
  const [unit, setUnit] = useState('kg');
  const [tmPct, setTmPct] = useState(90);
  const [maxes, setMaxes] = useState({
    squat: '',
    deadlift: '',
    benchPress: '',
    shoulderPress: '',
  });

  const setMax = (id, val) => setMaxes(m => ({ ...m, [id]: val }));

  const valid = EXERCISES.every(e => Number(maxes[e.id]) > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const parsed = {};
    EXERCISES.forEach(ex => { parsed[ex.id] = Number(maxes[ex.id]); });
    onComplete({ unit, tmPct: tmPct / 100, estimated1RMs: parsed });
  };

  return (
    <div className="setup">
      <h1>Wendler 5/3/1</h1>
      <p className="subtitle">
        Enter your estimated one-rep max for each lift to generate your first training cycle.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Unit</label>
          <div className="toggle-group">
            <button type="button" className={unit === 'kg' ? 'active' : ''} onClick={() => setUnit('kg')}>kg</button>
            <button type="button" className={unit === 'lbs' ? 'active' : ''} onClick={() => setUnit('lbs')}>lbs</button>
          </div>
        </div>

        <div className="form-group">
          <label>Training Max %</label>
          <div className="input-row">
            <input
              type="number"
              min="80"
              max="100"
              value={tmPct}
              onChange={e => setTmPct(e.target.value)}
            />
            <span className="input-suffix">%</span>
          </div>
          <span className="hint">Typically 85-90% of your 1RM</span>
        </div>

        <h2>Estimated 1RM</h2>

        {EXERCISES.map(ex => (
          <div className="form-group" key={ex.id}>
            <label>{ex.name}</label>
            <div className="input-row">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={maxes[ex.id]}
                onChange={e => setMax(ex.id, e.target.value)}
              />
              <span className="input-suffix">{unit}</span>
            </div>
          </div>
        ))}

        <button type="submit" className="btn primary full-width" disabled={!valid}>
          Start First Cycle
        </button>
      </form>
    </div>
  );
}
