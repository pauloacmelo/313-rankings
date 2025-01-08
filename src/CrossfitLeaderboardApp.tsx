import { useState, useEffect } from 'react';
import {
  Athlete,
  Workout,
  NewAthlete,
  NewWorkout,
  DivisionFilter,
  AthleteWithScore
} from './types';

const CrossfitLeaderboardApp = () => {
  // State management
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<number | null>(null);
  const [division, setDivision] = useState<DivisionFilter>('All');
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newAthlete, setNewAthlete] = useState<NewAthlete>({ name: '', division: 'RX', age: '', gender: 'M' });
  const [newWorkout, setNewWorkout] = useState<NewWorkout>({ name: '', description: '', scoreType: 'time' });

  // Load sample data
  useEffect(() => {
    // Sample athletes
    const sampleAthletes: Athlete[] = [
      { id: 1, name: 'John Smith', division: 'RX', gender: 'M', age: 28 },
      { id: 2, name: 'Sarah Johnson', division: 'RX', gender: 'F', age: 32 },
      { id: 3, name: 'Mike Wilson', division: 'Scaled', gender: 'M', age: 35 },
      { id: 4, name: 'Emily Chen', division: 'Scaled', gender: 'F', age: 29 },
      { id: 5, name: 'Robert James', division: 'Masters', gender: 'M', age: 47 },
    ];
    
    // Sample workouts
    const sampleWorkouts: Workout[] = [
      { 
        id: 1, 
        name: 'Open 25.1', 
        description: '21-15-9 of Thrusters and Pull-ups', 
        scoreType: 'time',
        scores: {
          1: { score: '7:32', isValidated: true },
          2: { score: '8:15', isValidated: true },
          3: { score: '9:45', isValidated: true },
          4: { score: '10:12', isValidated: true },
          5: { score: '11:30', isValidated: false },
        }
      },
      { 
        id: 2, 
        name: 'Open 25.2', 
        description: 'AMRAP 12: 5 Deadlifts, 10 Box Jumps, 15 Wall Balls', 
        scoreType: 'reps',
        scores: {
          1: { score: '345', isValidated: true },
          2: { score: '326', isValidated: true },
          3: { score: '287', isValidated: true },
          4: { score: '273', isValidated: true },
          5: { score: '265', isValidated: false },
        }
      },
    ];
    
    setAthletes(sampleAthletes);
    setWorkouts(sampleWorkouts);
    setActiveWorkout(1);
  }, []);

  // Handle adding a new athlete
  const handleAddAthlete = () => {
    const newId = athletes.length > 0 ? Math.max(...athletes.map(a => a.id)) + 1 : 1;
    setAthletes([...athletes, { id: newId, ...newAthlete }]);
    setNewAthlete({ name: '', division: 'RX', age: '', gender: 'M' });
    setShowAddAthlete(false);
  };

  // Handle adding a new workout
  const handleAddWorkout = () => {
    const newId = workouts.length > 0 ? Math.max(...workouts.map(w => w.id)) + 1 : 1;
    setWorkouts([...workouts, { id: newId, ...newWorkout, scores: {} }]);
    setNewWorkout({ name: '', description: '', scoreType: 'time' });
    setShowAddWorkout(false);
    setActiveWorkout(newId);
  };

  // Handle adding or updating a score
  const handleScoreSubmit = (athleteId: number, workoutId: number, score: string) => {
    const updatedWorkouts = workouts.map(workout => {
      if (workout.id === workoutId) {
        return {
          ...workout,
          scores: {
            ...workout.scores,
            [athleteId]: { score, isValidated: false }
          }
        };
      }
      return workout;
    });
    setWorkouts(updatedWorkouts);
  };

  // Handle score validation
  const toggleScoreValidation = (athleteId: number, workoutId: number) => {
    const updatedWorkouts = workouts.map(workout => {
      if (workout.id === workoutId && workout.scores[athleteId]) {
        return {
          ...workout,
          scores: {
            ...workout.scores,
            [athleteId]: { 
              ...workout.scores[athleteId],
              isValidated: !workout.scores[athleteId].isValidated 
            }
          }
        };
      }
      return workout;
    });
    setWorkouts(updatedWorkouts);
  };

  // Calculate rankings for the current workout
  const calculateRankings = (): AthleteWithScore[] => {
    if (!activeWorkout) return [];
    
    const currentWorkout = workouts.find(w => w.id === activeWorkout);
    if (!currentWorkout) return [];

    const filteredAthletes = division === 'All' 
      ? athletes 
      : athletes.filter(a => a.division === division);
    
    return filteredAthletes.map(athlete => {
      const athleteScore = currentWorkout.scores[athlete.id] || { score: '-', isValidated: false };
      return {
        ...athlete,
        score: athleteScore.score,
        isValidated: athleteScore.isValidated
      };
    }).sort((a, b) => {
      if (a.score === '-') return 1;
      if (b.score === '-') return -1;
      
      if (currentWorkout.scoreType === 'time') {
        // For time: lower is better
        const timeA = a.score.split(':').reduce((acc: number, val: string) => acc * 60 + parseInt(val), 0);
        const timeB = b.score.split(':').reduce((acc: number, val: string) => acc * 60 + parseInt(val), 0);
        return timeA - timeB;
      } else {
        // For reps/weight: higher is better
        return parseInt(b.score) - parseInt(a.score);
      }
    });
  };

  const rankings = calculateRankings();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">CrossFit Open Leaderboard</h1>
      
      {/* Workout selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Workouts</h2>
          <button 
            onClick={() => setShowAddWorkout(!showAddWorkout)} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showAddWorkout ? 'Cancel' : 'Add Workout'}
          </button>
        </div>
        
        {showAddWorkout && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">New Workout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Workout Name"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                className="p-2 border rounded"
              />
              <select
                value={newWorkout.scoreType}
                onChange={(e) => setNewWorkout({...newWorkout, scoreType: e.target.value as 'time' | 'reps' | 'weight'})}
                className="p-2 border rounded"
              >
                <option value="time">Time (lower is better)</option>
                <option value="reps">Reps (higher is better)</option>
                <option value="weight">Weight (higher is better)</option>
              </select>
            </div>
            <textarea
              placeholder="Workout Description"
              value={newWorkout.description}
              onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
              className="p-2 border rounded w-full mb-4"
              rows={3}
            />
            <button 
              onClick={handleAddWorkout}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Workout
            </button>
          </div>
        )}
        
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {workouts.map(workout => (
            <button
              key={workout.id}
              onClick={() => setActiveWorkout(workout.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                activeWorkout === workout.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {workout.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current workout details */}
      {activeWorkout && (
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {workouts.find(w => w.id === activeWorkout)?.name}
          </h2>
          <p className="mb-2">
            {workouts.find(w => w.id === activeWorkout)?.description}
          </p>
          <p className="text-sm text-gray-600">
            Score type: {workouts.find(w => w.id === activeWorkout)?.scoreType === 'time' 
              ? 'Time (lower is better)' 
              : workouts.find(w => w.id === activeWorkout)?.scoreType === 'reps'
                ? 'Repetitions (higher is better)'
                : 'Weight (higher is better)'}
          </p>
        </div>
      )}
      
      {/* Division filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Athletes</h2>
          <button 
            onClick={() => setShowAddAthlete(!showAddAthlete)} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showAddAthlete ? 'Cancel' : 'Add Athlete'}
          </button>
        </div>
        
        {showAddAthlete && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">New Athlete</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={newAthlete.name}
                onChange={(e) => setNewAthlete({...newAthlete, name: e.target.value})}
                className="p-2 border rounded"
              />
              <select
                value={newAthlete.division}
                onChange={(e) => setNewAthlete({...newAthlete, division: e.target.value as 'RX' | 'Scaled' | 'Masters' | 'Teens'})}
                className="p-2 border rounded"
              >
                <option value="RX">RX</option>
                <option value="Scaled">Scaled</option>
                <option value="Masters">Masters</option>
                <option value="Teens">Teens</option>
              </select>
              <input
                type="number"
                placeholder="Age"
                value={newAthlete.age}
                onChange={(e) => setNewAthlete({...newAthlete, age: e.target.value})}
                className="p-2 border rounded"
              />
              <select
                value={newAthlete.gender}
                onChange={(e) => setNewAthlete({...newAthlete, gender: e.target.value as 'M' | 'F'})}
                className="p-2 border rounded"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <button 
              onClick={handleAddAthlete}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Athlete
            </button>
          </div>
        )}
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setDivision('All')}
            className={`px-4 py-2 rounded ${division === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setDivision('RX')}
            className={`px-4 py-2 rounded ${division === 'RX' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            RX
          </button>
          <button
            onClick={() => setDivision('Scaled')}
            className={`px-4 py-2 rounded ${division === 'Scaled' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Scaled
          </button>
          <button
            onClick={() => setDivision('Masters')}
            className={`px-4 py-2 rounded ${division === 'Masters' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Masters
          </button>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Rank</th>
                <th className="px-4 py-2 border text-left">Athlete</th>
                <th className="px-4 py-2 border">Division</th>
                <th className="px-4 py-2 border">Score</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((athlete, index) => (
                <tr key={athlete.id} className={athlete.isValidated ? '' : 'bg-yellow-50'}>
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border">
                    {athlete.name} 
                    <span className="text-xs text-gray-500 ml-2">
                      ({athlete.gender}, {athlete.age})
                    </span>
                  </td>
                  <td className="px-4 py-2 border text-center">{athlete.division}</td>
                  <td className="px-4 py-2 border text-center font-semibold">{athlete.score}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => {
                          const promptText = athlete.score === '-' ? 'Enter' : 'Update';
                          const newScore = window.prompt(`${promptText} score for ${athlete.name}:`);
                          if (newScore) {
                            handleScoreSubmit(athlete.id, activeWorkout!, newScore);
                          }
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        {athlete.score === '-' ? 'Add Score' : 'Update'}
                      </button>
                      {athlete.score !== '-' && (
                        <button 
                          onClick={() => toggleScoreValidation(athlete.id, activeWorkout!)}
                          className={`px-2 py-1 rounded text-sm ${
                            athlete.isValidated 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}
                        >
                          {athlete.isValidated ? 'Validated' : 'Validate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrossfitLeaderboardApp; 