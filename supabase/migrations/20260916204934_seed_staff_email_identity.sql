insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
values (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object(
    'sub', '22222222-2222-2222-2222-222222222222',
    'email', 'ysrael@google.com',
    'email_verified', true
  ),
  'email',
  '22222222-2222-2222-2222-222222222222',
  now(), now(), now()
);
