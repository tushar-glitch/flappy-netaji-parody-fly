-- Fix search path for the get_top_scores function
DROP FUNCTION IF EXISTS public.get_top_scores(integer);

CREATE OR REPLACE FUNCTION public.get_top_scores(limit_count integer DEFAULT 10)
RETURNS TABLE (
  username text,
  avatar text,
  high_score integer,
  score_date timestamptz
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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