export type ExerciseCategory = 'Pull' | 'Core' | string;

export type AssistanceType = 'bodyweight' | 'band';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
}

export interface SetLog {
  id: string;
  reps: number;
  assistance: AssistanceType;
  bandLevel?: string;
  loggedAt: string;
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  startedAt: string;
  finishedAt?: string;
  sets: SetLog[];
}

export interface Settings {
  restSeconds: number;
  bandPresets: string[];
}

export interface AppData {
  version: number;
  exercises: Exercise[];
  sessions: WorkoutSession[];
  settings: Settings;
}

export interface SessionTotals {
  bodyweightReps: number;
  bandReps: number;
  totalReps: number;
  setCount: number;
}

export interface ProgressionPoint {
  date: string;
  label: string;
  bodyweightReps: number;
  bandReps: number;
  totalReps: number;
}
