import { createClient } from '@supabase/supabase-js';
import { Athlete, Workout, Score } from './types';

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

export const addAthlete = async (newAthlete: Omit<Athlete, 'id'>) => {
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
    .select('*');
  
  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
  
  return data as Workout[];
};

export const addWorkout = async (newWorkout: Omit<Workout, 'id' | 'scores'>) => {
  const workoutData = {
    ...newWorkout,
    scores: {}
  };
  
  const { data, error } = await supabase
    .from('workouts')
    .insert([workoutData])
    .select();
  
  if (error) {
    console.error('Error adding workout:', error);
    return null;
  }
  
  return data[0] as Workout;
};

// Scores API
export const updateScore = async (workoutId: number, athleteId: number, score: Score) => {
  // First get the current workout to access its scores
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .select('scores')
    .eq('id', workoutId)
    .single();
  
  if (workoutError) {
    console.error('Error fetching workout for score update:', workoutError);
    return null;
  }
  
  // Update the scores object
  const updatedScores = {
    ...workoutData.scores,
    [athleteId]: score
  };
  
  // Update the workout with new scores
  const { data, error } = await supabase
    .from('workouts')
    .update({ scores: updatedScores })
    .eq('id', workoutId)
    .select();
  
  if (error) {
    console.error('Error updating score:', error);
    return null;
  }
  
  return data[0] as Workout;
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