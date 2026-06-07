create table if not exists photo_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  layout text not null,
  customization_json jsonb not null default '{}'::jsonb,
  cloudinary_assets_json jsonb not null default '[]'::jsonb,
  source_photo_assets_json jsonb not null default '[]'::jsonb,
  final_asset_url text not null,
  final_asset_public_id text not null,
  gif_asset_url text,
  gif_asset_public_id text,
  email text,
  email_status text not null default 'idle',
  email_sent_at timestamptz,
  last_email_error text
);

create index if not exists photo_sessions_token_idx on photo_sessions (token);
create index if not exists photo_sessions_expires_at_idx on photo_sessions (expires_at);
