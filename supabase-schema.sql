-- Create athletes table
CREATE TABLE IF NOT EXISTS public.athletes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table without scores field
CREATE TABLE IF NOT EXISTS public.workouts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  scoretype TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create new scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES public.workouts(id),
  athlete_id INTEGER NOT NULL REFERENCES public.athletes(id),
  score TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workout_id, athlete_id)
);

-- Enable realtime for all tables
ALTER TABLE public.athletes REPLICA IDENTITY FULL;
ALTER TABLE public.workouts REPLICA IDENTITY FULL;
ALTER TABLE public.scores REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.athletes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;

-- Sample data for testing
INSERT INTO public.athletes (name, division, gender)
VALUES 
  ('John Smith', 'RX', 'M'),
  ('Sarah Johnson', 'RX', 'F'),
  ('Mike Wilson', 'Scaled', 'M'),
  ('Emily Chen', 'Scaled', 'F'),
  ('Robert James', 'Masters', 'M');

INSERT INTO public.workouts (name, description, scoretype)
VALUES 
  (
    'Open 25.1', 
    '21-15-9 of Thrusters and Pull-ups', 
    'time'
  ),
  (
    'Open 25.2', 
    'AMRAP 12: 5 Deadlifts, 10 Box Jumps, 15 Wall Balls', 
    'reps'
  );

-- Insert scores data
INSERT INTO public.scores (workout_id, athlete_id, score)
VALUES
  -- Scores for Open 25.1
  (1, 1, '7:32'),
  (1, 2, '8:15'),
  (1, 3, '9:45'),
  (1, 4, '10:12'),
  (1, 5, '11:30'),
  
  -- Scores for Open 25.2
  (2, 1, '345'),
  (2, 2, '326'),
  (2, 3, '287'),
  (2, 4, '273'),
  (2, 5, '265');

-- Create row level security policies
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to tables
CREATE POLICY "Allow anonymous read access to athletes" 
  ON public.athletes FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to workouts" 
  ON public.workouts FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to scores" 
  ON public.scores FOR SELECT 
  TO anon
  USING (true);

-- For simplicity, allow anonymous write access too
-- In a production environment, you'd limit this to authenticated users
-- CREATE POLICY "Allow anonymous write access to athletes" 
--   ON public.athletes FOR INSERT 
--   TO anon
--   WITH CHECK (true);

-- CREATE POLICY "Allow anonymous update access to athletes" 
--   ON public.athletes FOR UPDATE 
--   TO anon
--   USING (true);

-- CREATE POLICY "Allow anonymous write access to workouts" 
--   ON public.workouts FOR INSERT 
--   TO anon
--   WITH CHECK (true);

-- CREATE POLICY "Allow anonymous update access to workouts" 
--   ON public.workouts FOR UPDATE 
--   TO anon
--   USING (true); 

-- CREATE POLICY "Allow anonymous write access to scores" 
--   ON public.scores FOR INSERT 
--   TO anon
--   WITH CHECK (true);

-- CREATE POLICY "Allow anonymous update access to scores" 
--   ON public.scores FOR UPDATE 
--   TO anon
--   USING (true); 