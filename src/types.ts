// Athlete-related types
export interface Athlete {
  id: number;
  name: string;
  division: DivisionType;
  gender: GenderType;
  age: number | string;
}

export interface NewAthlete {
  name: string;
  division: DivisionType;
  gender: GenderType;
  age: string;
}

export type GenderType = 'M' | 'F';
export type DivisionType = 'RX' | 'Scaled' | 'Masters' | 'Teens';

// Workout-related types
export interface Workout {
  id: number;
  name: string;
  description: string;
  scoreType: ScoreType;
  scores: {
    [athleteId: number]: Score;
  };
}

export interface NewWorkout {
  name: string;
  description: string;
  scoreType: ScoreType;
}

export type ScoreType = 'time' | 'reps' | 'weight';

// Score-related types
export interface Score {
  score: string;
  isValidated: boolean;
}

export interface NewScore {
  athleteId: string | number;
  workoutId: string | number;
  score: string;
  isValidated: boolean;
}

// Rankings type
export interface AthleteWithScore extends Athlete {
  score: string;
  isValidated: boolean;
}

// Filter types
export type DivisionFilter = DivisionType | 'All'; 