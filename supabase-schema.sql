-- Create athletes table
CREATE TABLE IF NOT EXISTS public.athletes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table with scores stored as JSONB
CREATE TABLE IF NOT EXISTS public.workouts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  scoreType TEXT NOT NULL,
  scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for both tables
ALTER TABLE public.athletes REPLICA IDENTITY FULL;
ALTER TABLE public.workouts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.athletes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workouts;

-- Sample data for testing
INSERT INTO public.athletes (name, division, gender, age)
VALUES 
  ('John Smith', 'RX', 'M', 28),
  ('Sarah Johnson', 'RX', 'F', 32),
  ('Mike Wilson', 'Scaled', 'M', 35),
  ('Emily Chen', 'Scaled', 'F', 29),
  ('Robert James', 'Masters', 'M', 47);

INSERT INTO public.workouts (name, description, scoreType, scores)
VALUES 
  (
    'Open 25.1', 
    '21-15-9 of Thrusters and Pull-ups', 
    'time', 
    '{
      "1": {"score": "7:32", "isValidated": true},
      "2": {"score": "8:15", "isValidated": true},
      "3": {"score": "9:45", "isValidated": true},
      "4": {"score": "10:12", "isValidated": true},
      "5": {"score": "11:30", "isValidated": false}
    }'::jsonb
  ),
  (
    'Open 25.2', 
    'AMRAP 12: 5 Deadlifts, 10 Box Jumps, 15 Wall Balls', 
    'reps', 
    '{
      "1": {"score": "345", "isValidated": true},
      "2": {"score": "326", "isValidated": true},
      "3": {"score": "287", "isValidated": true},
      "4": {"score": "273", "isValidated": true},
      "5": {"score": "265", "isValidated": false}
    }'::jsonb
  );

-- Create row level security policies
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to both tables
CREATE POLICY "Allow anonymous read access to athletes" 
  ON public.athletes FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to workouts" 
  ON public.workouts FOR SELECT 
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