create table public.daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;

insert into public.daycares (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Guardería Sala Soles');
