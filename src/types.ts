// Athlete-related types
export interface Athlete {
  id: number;
  name: string;
  division: DivisionType;
  gender: GenderType;
  age: number | string;
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
  scores: {
    [athleteId: number]: Score;
  };
}
export type NewWorkout = Omit<Workout, 'id'>;

export type ScoreType = 'time' | 'reps' | 'weight';

// Score-related types
export interface Score {
  score: string;
}
export type NewScore = Omit<Score, 'id'>;

// Rankings type
export interface AthleteWithScore extends Athlete {
  score: string;
}

// Filter types
export type DivisionFilter = DivisionType | 'All'; 