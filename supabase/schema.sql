-- ============================================================
-- ReceitasApp - Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de perfis (complementa auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: cria perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Tabela de receitas
CREATE TABLE public.recipes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description   TEXT,
  instructions  TEXT NOT NULL,
  photo_url     TEXT,
  prep_time_min INTEGER CHECK (prep_time_min > 0),
  servings      INTEGER CHECK (servings > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at DESC);

-- 3. Tabela de ingredientes
CREATE TABLE public.ingredients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  quantity    TEXT NOT NULL,
  unit        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingredients_recipe_id ON public.ingredients(recipe_id, sort_order);

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: usuario ve apenas o proprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: usuario atualiza apenas o proprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes: select proprio usuario"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recipes: insert proprio usuario"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipes: update proprio usuario"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipes: delete proprio usuario"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ingredients
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredients: select via receita do usuario"
  ON public.ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "ingredients: insert via receita do usuario"
  ON public.ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "ingredients: update via receita do usuario"
  ON public.ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "ingredients: delete via receita do usuario"
  ON public.ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. Storage Bucket para fotos
-- Execute via Dashboard > Storage > New Bucket OU via SQL
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-photos',
  'recipe-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage: upload na propria pasta"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage: fotos publicas para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "storage: delete apenas seus arquivos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
