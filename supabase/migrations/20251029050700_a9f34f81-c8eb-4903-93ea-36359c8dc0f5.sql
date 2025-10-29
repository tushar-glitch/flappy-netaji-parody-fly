-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  avatar text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies
CREATE POLICY "Leaderboard is viewable by everyone" 
  ON public.leaderboard FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own scores" 
  ON public.leaderboard FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster leaderboard queries
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX idx_leaderboard_user ON public.leaderboard(user_id);

-- Create function to get top scores with user info
CREATE OR REPLACE FUNCTION public.get_top_scores(limit_count integer DEFAULT 10)
RETURNS TABLE (
  username text,
  avatar text,
  high_score integer,
  score_date timestamptz
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.username,
    p.avatar,
    MAX(l.score) as high_score,
    MAX(l.created_at) as score_date
  FROM public.leaderboard l
  JOIN public.profiles p ON p.user_id = l.user_id
  GROUP BY p.username, p.avatar
  ORDER BY high_score DESC
  LIMIT limit_count;
$$;