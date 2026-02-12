import { EXERCISES, WEEK_SCHEMES } from '../utils/wendler';

export default function History({ cycles, settings, onBack }) {
  return (
    <div className="history">
      <div className="history-header">
        <button className="btn ghost" onClick={onBack}>&larr; Back</button>
        <h2>History</h2>
      </div>

      {cycles.length === 0 && (
        <p className="text-secondary">No cycles yet.</p>
      )}

      {[...cycles].reverse().map(cycle => (
        <div key={cycle.number} className="card cycle-card">
          <h3>Cycle {cycle.number}</h3>
          <div className="tm-list">
            {EXERCISES.map(ex => (
              <span key={ex.id}>
                {ex.name}: {cycle.trainingMaxes[ex.id]} {settings.unit}
              </span>
            ))}
          </div>

          {Object.keys(cycle.logs).length > 0 ? (
            <div className="history-logs">
              {WEEK_SCHEMES.map((week, wi) => {
                const weekLogs = EXERCISES
                  .map(ex => ({ exercise: ex, log: cycle.logs[`${ex.id}-${wi}`] }))
                  .filter(x => x.log);
                if (weekLogs.length === 0) return null;

                return (
                  <div key={wi} className="history-week">
                    <h4>{week.label}</h4>
                    {weekLogs.map(({ exercise, log }) => (
                      <div key={exercise.id} className="history-entry">
                        <span className="entry-name">{exercise.name}</span>
                        <span className="entry-sets">
                          {log.sets.map((s, i) => `${s.weight}x${s.reps}`).join(', ')}
                        </span>
                        {log.estimated1RM > 0 && (
                          <span className="entry-e1rm">
                            e1RM: {log.estimated1RM}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-secondary">No workouts logged.</p>
          )}
        </div>
      ))}
    </div>
  );
}
