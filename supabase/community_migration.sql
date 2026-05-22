-- =============================================
-- Community feature migration
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add is_public column to recipes
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Index for fast public recipe queries
CREATE INDEX IF NOT EXISTS idx_recipes_is_public
  ON public.recipes(is_public, created_at DESC)
  WHERE is_public = TRUE;

-- 3. Update RLS on recipes: authenticated users can read public recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
CREATE POLICY "Users can view own or public recipes" ON public.recipes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_public = TRUE);

-- 4. Update RLS on ingredients: allow reading ingredients of public recipes
DROP POLICY IF EXISTS "Users can view own recipe ingredients" ON public.ingredients;
CREATE POLICY "Users can view own or public recipe ingredients" ON public.ingredients
  FOR SELECT TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM public.recipes
      WHERE user_id = auth.uid() OR is_public = TRUE
    )
  );

-- 5. Allow searching other users' profiles (by name, for community search)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
