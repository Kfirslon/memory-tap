-- Create memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- In a real app, this would reference auth.users
  full_text text not null,
  summary text,
  category text,
  date timestamp with time zone,
  reminder_needed boolean default false,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reminders table
create table reminders (
  id uuid default gen_random_uuid() primary key,
  memory_id uuid references memories(id) on delete cascade,
  description text not null,
  due_date timestamp with time zone not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table memories enable row level security;
alter table reminders enable row level security;

-- Create policies (for development, allow public access, but in prod restrict to user)
create policy "Public memories access" on memories for all using (true);
create policy "Public reminders access" on reminders for all using (true);
