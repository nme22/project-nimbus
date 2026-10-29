-- Project Nimbus schema
-- Run in the Supabase SQL editor on a fresh database.
--
-- Model: a household shares one board of projects. Each project has a task
-- checklist and a shopping list of items (from Home Depot, Lowe's, or anywhere).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      text,                -- Clerk user id of the creator (nullable)
  title        text not null,
  description  text,
  room         text not null default 'whole_house'
               check (room in ('kitchen','bathroom','bedroom','living_room','dining_room',
                               'office','laundry','garage','basement','attic',
                               'exterior','yard','whole_house','other')),
  category     text not null default 'general'
               check (category in ('general','plumbing','electrical','painting','carpentry',
                                   'flooring','hvac','roofing','landscaping','cleaning',
                                   'appliances','other')),
  status       text not null default 'planning'
               check (status in ('planning','in_progress','on_hold','completed')),
  priority     text not null default 'medium'
               check (priority in ('low','medium','high')),
  budget       numeric(12,2) check (budget is null or budget >= 0),
  target_date  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks (checklist steps inside a project)
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  done        boolean not null default false,
  due_date    date,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tasks_project_id_idx on tasks(project_id);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- shopping_items (materials for a project, optionally tied to a task)
-- ---------------------------------------------------------------------------
create table if not exists shopping_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  task_id     uuid references tasks(id) on delete set null,
  name        text not null,
  store       text not null default 'other'
              check (store in ('home_depot','lowes','other')),
  product_id  text,                 -- store SKU / item id when known
  model       text,
  url         text,
  image_url   text,
  unit_price  numeric(10,2) check (unit_price is null or unit_price >= 0),
  quantity    integer not null default 1 check (quantity > 0),
  purchased   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists shopping_items_project_id_idx on shopping_items(project_id);
create index if not exists shopping_items_task_id_idx on shopping_items(task_id);

create trigger shopping_items_updated_at
  before update on shopping_items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- TEMPORARY: the app currently talks to Supabase from the browser with the
-- anon/publishable key, and the whole household shares one board. These
-- policies keep that behavior so the app works, but it means anyone holding
-- the anon key can read and write. Replace them with Clerk-backed policies
-- (Supabase third-party auth + auth.jwt()->>'sub' / 'org_id') before sharing
-- the URL beyond your household.
-- ---------------------------------------------------------------------------
alter table projects       enable row level security;
alter table tasks          enable row level security;
alter table shopping_items enable row level security;

create policy "household shared access" on projects
  for all to anon, authenticated using (true) with check (true);
create policy "household shared access" on tasks
  for all to anon, authenticated using (true) with check (true);
create policy "household shared access" on shopping_items
  for all to anon, authenticated using (true) with check (true);
