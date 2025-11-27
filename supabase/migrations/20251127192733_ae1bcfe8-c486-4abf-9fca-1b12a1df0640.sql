-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create memories table
CREATE TABLE public.memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_text text NOT NULL,
  summary text,
  category text DEFAULT 'note',
  date timestamp with time zone,
  reminder_needed boolean DEFAULT false,
  audio_url text,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reminders table
CREATE TABLE public.reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid REFERENCES public.memories(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  due_date timestamp with time zone NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Memories RLS Policies
CREATE POLICY "Users can view their own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- Reminders RLS Policies
CREATE POLICY "Users can view their own reminders"
  ON public.reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = reminders.memory_id
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reminders for their memories"
  ON public.reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = reminders.memory_id
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reminders"
  ON public.reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = reminders.memory_id
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reminders"
  ON public.reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = reminders.memory_id
      AND memories.user_id = auth.uid()
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX memories_user_id_idx ON public.memories(user_id);
CREATE INDEX memories_created_at_idx ON public.memories(created_at DESC);
CREATE INDEX memories_category_idx ON public.memories(category);
CREATE INDEX reminders_memory_id_idx ON public.reminders(memory_id);
CREATE INDEX reminders_due_date_idx ON public.reminders(due_date);