// Athlete-related types
export interface Athlete {
  id: number;
  name: string;
  division: DivisionType;
  gender: GenderType;
}
export type NewAthlete = Omit<Athlete, 'id'>;

export type GenderType = 'M' | 'F';
export type DivisionType = 'RX' | 'Scaled' | 'Masters' | 'Teens';

// Workout-related types
export interface Workout {
  id: number;
  name: string;
  description: string;
  scoretype: ScoreType;
}
export type NewWorkout = Omit<Workout, 'id'>;

export type ScoreType = 'time' | 'reps' | 'weight';

// Score-related types
export interface Score {
  id: number;
  workout_id: number;
  athlete_id: number;
  score: string;
}
export type NewScore = Omit<Score, 'id'>;

// Rankings type
export interface AthleteWithScore extends Athlete {
  score: string | null;
}

// Filter types
export type DivisionFilter = DivisionType | 'All'; 