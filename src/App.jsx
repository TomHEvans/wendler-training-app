import { useState, useCallback } from 'react';
import { EXERCISES, calcTrainingMax, getRoundIncrement, roundWeight } from './utils/wendler';
import { load, save } from './utils/storage';
import Setup from './components/Setup';
import CyclePlan from './components/CyclePlan';
import WorkoutLog from './components/WorkoutLog';
import NewCycle from './components/NewCycle';
import History from './components/History';
import './App.css';

function createCycle(number, trainingMaxes) {
  return {
    number,
    trainingMaxes,
    logs: {},
    createdAt: new Date().toISOString(),
  };
}

export default function App() {
  const [data, setData] = useState(() => load());
  const [view, setView] = useState(data ? 'dashboard' : 'setup');
  const [workoutTarget, setWorkoutTarget] = useState(null);

  const persist = useCallback((newData) => {
    setData(newData);
    save(newData);
  }, []);

  const handleSetup = ({ unit, tmPct, estimated1RMs }) => {
    const ri = getRoundIncrement(unit);
    const trainingMaxes = {};
    EXERCISES.forEach(ex => {
      trainingMaxes[ex.id] = roundWeight(calcTrainingMax(estimated1RMs[ex.id], tmPct), ri);
    });
    const newData = {
      settings: { unit, tmPct },
      cycles: [createCycle(1, trainingMaxes)],
    };
    persist(newData);
    setView('dashboard');
  };

  const handleLogWorkout = (exerciseId, weekIndex) => {
    setWorkoutTarget({ exerciseId, weekIndex });
    setView('workout');
  };

  const handleSaveWorkout = (logEntry) => {
    const newData = { ...data };
    const cycle = { ...newData.cycles[newData.cycles.length - 1] };
    cycle.logs = {
      ...cycle.logs,
      [`${logEntry.exerciseId}-${logEntry.weekIndex}`]: logEntry,
    };
    newData.cycles = [...newData.cycles.slice(0, -1), cycle];
    persist(newData);
    setView('dashboard');
    setWorkoutTarget(null);
  };

  const handleNewCycle = (newTMs) => {
    const currentCycle = data.cycles[data.cycles.length - 1];
    const newData = {
      ...data,
      cycles: [...data.cycles, createCycle(currentCycle.number + 1, newTMs)],
    };
    persist(newData);
    setView('dashboard');
  };

  const handleReset = () => {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      save(null);
      setData(null);
      setView('setup');
    }
  };

  if (view === 'setup' || !data) {
    return (
      <div className="app">
        <Setup onComplete={handleSetup} />
      </div>
    );
  }

  const currentCycle = data.cycles[data.cycles.length - 1];

  return (
    <div className="app">
      {view === 'dashboard' && (
        <CyclePlan
          cycle={currentCycle}
          settings={data.settings}
          onLog={handleLogWorkout}
          onNewCycle={() => setView('newCycle')}
          onHistory={() => setView('history')}
          onReset={handleReset}
        />
      )}
      {view === 'workout' && workoutTarget && (
        <WorkoutLog
          cycle={currentCycle}
          exerciseId={workoutTarget.exerciseId}
          weekIndex={workoutTarget.weekIndex}
          settings={data.settings}
          onSave={handleSaveWorkout}
          onCancel={() => { setView('dashboard'); setWorkoutTarget(null); }}
        />
      )}
      {view === 'newCycle' && (
        <NewCycle
          currentCycle={currentCycle}
          settings={data.settings}
          onComplete={handleNewCycle}
          onCancel={() => setView('dashboard')}
        />
      )}
      {view === 'history' && (
        <History
          cycles={data.cycles}
          settings={data.settings}
          onBack={() => setView('dashboard')}
        />
      )}
    </div>
  );
}
