begin;

alter table orders add column if not exists brief text;
alter table orders add column if not exists service_type text not null default 'project_topic';
alter table orders add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded'));
alter table orders add column if not exists updated_at timestamptz not null default now();
alter table orders add column if not exists cancelled_at timestamptz;

create table if not exists project_briefs (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references orders(id) on delete cascade,
  title text not null, objectives text not null default '', scope text not null default '', methodology text not null default '',
  supervisor_notes text not null default '', status text not null default 'draft' check (status in ('draft','submitted','in_review','approved','changes_requested')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists order_events (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade,
  actor_id uuid references users(id) on delete set null, event_type text not null, note text not null default '', created_at timestamptz not null default now()
);
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  service_type text not null, title text not null, description text not null, budget numeric(12,2), status text not null default 'submitted' check(status in ('submitted','reviewing','quoted','accepted','declined','completed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references orders(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade, rating integer not null check(rating between 1 and 5), comment text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_orders_user_created on orders(user_id, created_at desc);
create index if not exists idx_order_events_order_created on order_events(order_id, created_at desc);
create index if not exists idx_service_requests_user_created on service_requests(user_id, created_at desc);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);

commit;
