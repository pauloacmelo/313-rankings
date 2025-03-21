import { useState, useEffect } from 'react';
import {
  Athlete,
  Workout,
  NewAthlete,
  NewWorkout,
  DivisionFilter,
  GenderFilter,
  AthleteWithScore,
  Score,
} from './types';
import {
  fetchAthletes,
  fetchWorkouts,
  fetchScores,
  addAthlete,
  addWorkout,
  addScore,
  updateScore,
  subscribeToAthletes,
  subscribeToWorkouts,
  subscribeToScores,
  updateWorkout
} from './supabaseClient';

const CrossfitLeaderboardApp = () => {
  // State management
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<number | null | 'all'>(null);
  const [division, setDivision] = useState<DivisionFilter>('All');
  const [gender, setGender] = useState<GenderFilter>('All');
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showEditWorkout, setShowEditWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newAthlete, setNewAthlete] = useState<NewAthlete>({ name: '', division: 'RX', gender: 'M' });
  const [newWorkout, setNewWorkout] = useState<NewWorkout>({ name: '', description: '', scoretype: 'time' });
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch athletes, workouts, and scores
        const athletesData = await fetchAthletes();
        const workoutsData = await fetchWorkouts();
        const scoresData = await fetchScores();

        setAthletes(athletesData);
        setWorkouts(workoutsData);
        setScores(scoresData);

        // Set active workout to the first one if available
        if (workoutsData.length > 0 && !activeWorkout) {
          setActiveWorkout(workoutsData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up realtime subscriptions
    const athletesSubscription = subscribeToAthletes((payload) => {
      if (payload.eventType === 'INSERT') {
        setAthletes(prevAthletes => [...prevAthletes, payload.new as Athlete]);
      } else if (payload.eventType === 'UPDATE') {
        setAthletes(prevAthletes =>
          prevAthletes.map(athlete =>
            athlete.id === payload.new.id ? payload.new as Athlete : athlete
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setAthletes(prevAthletes =>
          prevAthletes.filter(athlete => athlete.id !== payload.old.id)
        );
      }
    });

    const workoutsSubscription = subscribeToWorkouts((payload) => {
      if (payload.eventType === 'INSERT') {
        setWorkouts(prevWorkouts => [...prevWorkouts, payload.new as Workout]);
        // Set as active workout if it's the first one
        if (!activeWorkout) {
          setActiveWorkout(payload.new.id);
        }
      } else if (payload.eventType === 'UPDATE') {
        setWorkouts(prevWorkouts =>
          prevWorkouts.map(workout =>
            workout.id === payload.new.id ? payload.new as Workout : workout
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setWorkouts(prevWorkouts =>
          prevWorkouts.filter(workout => workout.id !== payload.old.id)
        );
        // If active workout was deleted, set first available as active
        if (activeWorkout === payload.old.id) {
          const remainingWorkouts = workouts.filter(w => w.id !== payload.old.id);
          setActiveWorkout(remainingWorkouts.length > 0 ? remainingWorkouts[0].id : null);
        }
      }
    });

    const scoresSubscription = subscribeToScores((payload) => {
      if (payload.eventType === 'INSERT') {
        setScores(prevScores => [...prevScores, payload.new as Score]);
      } else if (payload.eventType === 'UPDATE') {
        setScores(prevScores =>
          prevScores.map(score =>
            score.id === payload.new.id ? payload.new as Score : score
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setScores(prevScores =>
          prevScores.filter(score => score.id !== payload.old.id)
        );
      }
    });

    // Clean up subscriptions
    return () => {
      athletesSubscription.unsubscribe();
      workoutsSubscription.unsubscribe();
      scoresSubscription.unsubscribe();
    };
  }, []);

  // Handle adding a new athlete
  const handleAddAthlete = async () => {
    try {
      const result = await addAthlete(newAthlete);
      if (result) {
        // Realtime subscription will handle adding to the state
        setNewAthlete({ name: '', division: 'RX', gender: 'M' });
        setShowAddAthlete(false);
      }
    } catch (error) {
      console.error('Error adding athlete:', error);
    }
  };

  // Handle adding a new workout
  const handleAddWorkout = async () => {
    try {
      const result = await addWorkout(newWorkout);
      if (result) {
        // Realtime subscription will handle adding to the state
        setNewWorkout({ name: '', description: '', scoretype: 'time' });
        setShowAddWorkout(false);
        setActiveWorkout(result.id);
      }
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  // Handle editing a workout
  const handleEditWorkout = async () => {
    if (!editingWorkout) return;

    try {
      const result = await updateWorkout(editingWorkout);
      if (result) {
        // Realtime subscription will handle updating the state
        setShowEditWorkout(false);
        setEditingWorkout(null);
      }
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  // Handle starting workout edit
  const startWorkoutEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowEditWorkout(true);
  };

  // Handle adding or updating a score
  const handleScoreSubmit = async (athleteId: number, workoutId: number, scoreValue: string) => {
    try {
      // Check if a score already exists for this athlete and workout
      const existingScore = scores.find(
        s => s.athlete_id === athleteId && s.workout_id === workoutId
      );

      if (existingScore) {
        // Update existing score
        await updateScore({
          ...existingScore,
          score: scoreValue
        });
      } else {
        // Add new score
        await addScore({
          workout_id: workoutId,
          athlete_id: athleteId,
          score: scoreValue
        });
      }
      // Realtime subscription will handle updating the state
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  // Calculate rankings for the current workout
  const calculateRankings = (): AthleteWithScore[] | AthleteWithScore[][] => {
    // If "all" is selected, we'll create an array of rankings for each workout
    if (activeWorkout === 'all') {
      // Apply both division and gender filters
      const filteredAthletes = athletes.filter(a => {
        const divisionMatch = division === 'All' || a.division === division;
        const genderMatch = gender === 'All' || a.gender === gender;
        return divisionMatch && genderMatch;
      });

      // Create a map to hold combined scores for each athlete
      const athleteMap = new Map<number, any>();

      // Initialize athlete map with base athlete info
      filteredAthletes.forEach(athlete => {
        athleteMap.set(athlete.id, {
          ...athlete,
          workoutScores: {},
          totalRanking: 0
        });
      });

      // For each workout, calculate scores and rankings
      workouts.forEach(workout => {
        // For each athlete, get their score for this workout
        filteredAthletes.forEach(athlete => {
          const athleteScore = scores.find(
            s => s.athlete_id === athlete.id && s.workout_id === workout.id
          );
          
          const athleteData = athleteMap.get(athlete.id);

          if (athleteData) {
            athleteData.workoutScores[workout.id] = {
              score: athleteScore?.score || null,
              workoutName: workout.name,
              scoretype: workout.scoretype
            };
          }
        });
      });

      // Convert map back to array
      return Array.from(athleteMap.values()).map(athlete => ({
        ...athlete,
        scores: athlete.workoutScores
      }));
    }

    // Handle single workout view (original functionality)
    if (!activeWorkout || typeof activeWorkout !== 'number') return [];

    const currentWorkout = workouts.find(w => w.id === activeWorkout);
    if (!currentWorkout) return [];

    // Apply both division and gender filters
    const filteredAthletes = athletes.filter(a => {
      const divisionMatch = division === 'All' || a.division === division;
      const genderMatch = gender === 'All' || a.gender === gender;
      return divisionMatch && genderMatch;
    });

    return filteredAthletes.map(athlete => {
      const athleteScore = scores.find(
        s => s.athlete_id === athlete.id && s.workout_id === activeWorkout
      );
      
      return {
        ...athlete,
        score: athleteScore?.score || null
      };
    }).sort((a, b) => {
      if (!a.score) return 1;
      if (!b.score) return -1;

      if (currentWorkout.scoretype === 'time') {
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

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

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
                value={newWorkout.scoretype}
                onChange={(e) => setNewWorkout({...newWorkout, scoretype: e.target.value as 'time' | 'reps' | 'weight'})}
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
              disabled={!newWorkout.name}
            >
              Save Workout
            </button>
          </div>
        )}

        <div className="flex overflow-x-auto space-x-2 pb-2">
          <button
            onClick={() => setActiveWorkout('all')}
            className={`px-4 py-2 rounded whitespace-nowrap ${activeWorkout === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
              }`}
          >
            All Workouts
          </button>
          {workouts.map(workout => (
            <div key={workout.id} className="flex items-center space-x-2">
              <button
                onClick={() => setActiveWorkout(workout.id)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  activeWorkout === workout.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                {workout.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current workout details */}
      {activeWorkout && activeWorkout !== 'all' && !editingWorkout && (
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {workouts.find(w => w.id === activeWorkout)?.name}
            <button
              onClick={() => {
                const workout = workouts.find(w => w.id === activeWorkout);
                if (workout) {
                  startWorkoutEdit(workout);
                }
              }}
              className="p-2 text-gray-600 hover:text-blue-500"
              title="Edit workout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </h2>
          <p className="mb-2 whitespace-pre-wrap">
            {workouts.find(w => w.id === activeWorkout)?.description}
          </p>
          <p className="text-sm text-gray-600">
            Score type: {workouts.find(w => w.id === activeWorkout)?.scoretype === 'time'
              ? 'Time (lower is better)'
              : workouts.find(w => w.id === activeWorkout)?.scoretype === 'reps'
                ? 'Repetitions (higher is better)'
                : 'Weight (higher is better)'}
          </p>
        </div>
      )}

      {/* All Workouts view */}
      {activeWorkout === 'all' && (
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">All Workouts Overview</h2>
          <p className="mb-2">
            Viewing scores across all workouts for {gender === 'All' ? 'all' : gender === 'M' ? 'male' : 'female'} athletes 
            in {division === 'All' ? 'all divisions' : `the ${division} division`}.
          </p>
        </div>
      )}

      {showEditWorkout && editingWorkout && (
        <div className="bg-gray-100 p-4 rounded mb-4 mt-4">
          <h3 className="font-semibold mb-2">Edit Workout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Workout Name"
              value={editingWorkout.name}
              onChange={(e) => setEditingWorkout({...editingWorkout, name: e.target.value})}
              className="p-2 border rounded"
            />
            <select
              value={editingWorkout.scoretype}
              onChange={(e) => setEditingWorkout({...editingWorkout, scoretype: e.target.value as 'time' | 'reps' | 'weight'})}
              className="p-2 border rounded"
            >
              <option value="time">Time (lower is better)</option>
              <option value="reps">Reps (higher is better)</option>
              <option value="weight">Weight (higher is better)</option>
            </select>
          </div>
          <textarea
            placeholder="Workout Description"
            value={editingWorkout.description}
            onChange={(e) => setEditingWorkout({...editingWorkout, description: e.target.value})}
            className="p-2 border rounded w-full mb-4"
            rows={3}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleEditWorkout}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={!editingWorkout.name}
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setShowEditWorkout(false);
                setEditingWorkout(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Division filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
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
              disabled={!newAthlete.name}
            >
              Save Athlete
            </button>
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-medium mb-2">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label htmlFor="division-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Division
              </label>
              <select
                id="division-filter"
                value={division}
                onChange={(e) => setDivision(e.target.value as DivisionFilter)}
                className="p-2 border rounded w-full"
              >
                <option value="All">All Divisions</option>
                <option value="RX">RX</option>
                <option value="Scaled">Scaled</option>
                <option value="Masters">Masters</option>
                <option value="Teens">Teens</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender-filter"
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderFilter)}
                className="p-2 border rounded w-full"
              >
                <option value="All">All Genders</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            {`Showing ${gender === 'All' ? 'all' : gender === 'M' ? 'male' : 'female'} athletes 
            in ${division === 'All' ? 'all divisions' : `the ${division} division`}`}
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-6">
        {rankings.length > 0 ? (
          <div className="overflow-x-auto">
            {activeWorkout !== 'all' ? (
              // Single workout view
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
                  {(rankings as AthleteWithScore[]).map((athlete, index) => (
                    <tr key={athlete.id}>
                      <td className="px-4 py-2 border text-center">{index + 1}</td>
                      <td className="px-4 py-2 border">
                        {athlete.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({athlete.gender})
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">{athlete.division}</td>
                      <td className="px-4 py-2 border text-center font-semibold">{athlete.score || '-'}</td>
                      <td className="px-4 py-2 border">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              const promptText = athlete.score ? 'Update' : 'Enter';
                              const newScore = window.prompt(`${promptText} score for ${athlete.name}:`);
                              if (newScore) {
                                handleScoreSubmit(athlete.id, activeWorkout as number, newScore);
                              }
                            }}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            {athlete.score ? 'Update' : 'Add Score'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // All workouts view
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border text-left">Athlete</th>
                    <th className="px-4 py-2 border">Division</th>
                    {workouts.map(workout => (
                      <th key={workout.id} className="px-4 py-2 border">{workout.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(rankings as any[]).map((athlete) => (
                    <tr key={athlete.id} className={workouts.map(w => athlete.scores[w.id]?.score).every(Boolean) ? '' : 'bg-yellow-50'}>
                      <td className="px-4 py-2 border">
                        {athlete.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({athlete.gender})
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">{athlete.division}</td>
                      {workouts.map(workout => {
                        const workoutScore = athlete.scores[workout.id] || { score: null };
                        return (
                          <td
                            key={workout.id}
                            className={`px-4 py-2 border text-center`}
                          >
                            <div className="font-semibold">
                              {workoutScore.score || '-'}
                            </div>
                            <div className="flex justify-center space-x-2 mt-1">
                              <button
                                onClick={() => {
                                  const promptText = workoutScore.score ? 'Update' : 'Enter';
                                  const newScore = window.prompt(`${promptText} score for ${athlete.name} in ${workout.name}:`);
                                  if (newScore) {
                                    handleScoreSubmit(athlete.id, workout.id, newScore);
                                  }
                                }}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              >
                                {workoutScore.score ? 'Edit' : 'Add'}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded text-center">
            {activeWorkout ? 'No athletes found for the selected division.' : 'No workout selected.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossfitLeaderboardApp; 