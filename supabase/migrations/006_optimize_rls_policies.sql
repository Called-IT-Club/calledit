-- Optimize public.profiles policy "Users can insert their own profile"
-- Replacing auth.uid() with (select auth.uid()) for performance to avoid re-evaluation

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  (select auth.uid()) = id
);

-- Optimize public.predictions policy "Users can create their own predictions"
-- Replacing auth.uid() with (select auth.uid())

DROP POLICY IF EXISTS "Users can create their own predictions" ON public.predictions;

CREATE POLICY "Users can create their own predictions"
ON public.predictions
FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) = user_id
);

-- Optimize "Public predictions are viewable by everyone"
DROP POLICY IF EXISTS "Public predictions are viewable by everyone" ON public.predictions;

CREATE POLICY "Public predictions are viewable by everyone"
ON public.predictions
FOR SELECT
USING (
  is_private = false 
  OR 
  ((select auth.uid()) = user_id)
);

-- Optimize "Users can update their own predictions"
DROP POLICY IF EXISTS "Users can update their own predictions" ON public.predictions;

CREATE POLICY "Users can update their own predictions"
ON public.predictions
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id);

-- Optimize "Users can delete their own predictions"
DROP POLICY IF EXISTS "Users can delete their own predictions" ON public.predictions;

CREATE POLICY "Users can delete their own predictions"
ON public.predictions
FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);
