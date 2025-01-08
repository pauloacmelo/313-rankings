import { createClient } from '@supabase/supabase-js';
import { Athlete, Workout, NewAthlete, NewWorkout, Score, NewScore } from './types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Athletes API
export const fetchAthletes = async () => {
  const { data, error } = await supabase
    .from('athletes')
    .select('*');
  
  if (error) {
    console.error('Error fetching athletes:', error);
    return [];
  }
  
  return data as Athlete[];
};

export const addAthlete = async (newAthlete: NewAthlete) => {
  const { data, error } = await supabase
    .from('athletes')
    .insert([newAthlete])
    .select();
  
  if (error) {
    console.error('Error adding athlete:', error);
    return null;
  }
  
  return data[0] as Athlete;
};

// Workouts API
export const fetchWorkouts = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
  
  return data as Workout[];
};

export const addWorkout = async (workout: NewWorkout): Promise<Workout | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .insert([workout])
    .select()
    .single();

  if (error) {
    console.error('Error adding workout:', error);
    return null;
  }

  return data;
};

export const updateWorkout = async (workout: Workout): Promise<Workout | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .update({
      name: workout.name,
      description: workout.description,
      scoretype: workout.scoretype
    })
    .eq('id', workout.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating workout:', error);
    return null;
  }

  return data;
};

// Scores API
export const fetchScores = async () => {
  const { data, error } = await supabase
    .from('scores')
    .select('*');
  
  if (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
  
  return data as Score[];
};

export const fetchScoresByWorkout = async (workoutId: number) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('workout_id', workoutId);
  
  if (error) {
    console.error('Error fetching scores for workout:', error);
    return [];
  }
  
  return data as Score[];
};

export const fetchScoresByAthlete = async (athleteId: number) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('athlete_id', athleteId);
  
  if (error) {
    console.error('Error fetching scores for athlete:', error);
    return [];
  }
  
  return data as Score[];
};

export const addScore = async (newScore: NewScore): Promise<Score | null> => {
  const { data, error } = await supabase
    .from('scores')
    .insert([newScore])
    .select()
    .single();

  if (error) {
    console.error('Error adding score:', error);
    return null;
  }

  return data;
};

export const updateScore = async (score: Score): Promise<Score | null> => {
  const { data, error } = await supabase
    .from('scores')
    .update({
      score: score.score
    })
    .eq('id', score.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating score:', error);
    return null;
  }

  return data;
};

export const deleteScore = async (scoreId: number): Promise<boolean> => {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId);

  if (error) {
    console.error('Error deleting score:', error);
    return false;
  }

  return true;
};

// Subscribe to real-time updates
export const subscribeToAthletes = (callback: (payload: any) => void) => {
  return supabase
    .channel('athletes-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'athletes'
    }, callback)
    .subscribe();
};

export const subscribeToWorkouts = (callback: (payload: any) => void) => {
  return supabase
    .channel('workouts-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'workouts'
    }, callback)
    .subscribe();
};

export const subscribeToScores = (callback: (payload: any) => void) => {
  return supabase
    .channel('scores-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'scores'
    }, callback)
    .subscribe();
}; 