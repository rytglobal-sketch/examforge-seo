alter table users
  add column if not exists paystack_customer_code text,
  add column if not exists paystack_subscription_code text,
  add column if not exists paystack_plan_code text,
  add column if not exists paystack_reference text,
  add column if not exists paystack_email_token text;

create index if not exists users_paystack_customer_code_idx
  on users (paystack_customer_code);

create index if not exists users_paystack_subscription_code_idx
  on users (paystack_subscription_code);

create index if not exists users_paystack_reference_idx
  on users (paystack_reference);
