-- Migration to rename PesaPal-specific columns and make pricing currency-agnostic
-- Run this in the Supabase SQL editor to migrate existing databases.

ALTER TABLE public.payments RENAME COLUMN pesapal_tracking_id TO provider_tracking_id;
ALTER TABLE public.payments RENAME COLUMN pesapal_merchant_ref TO provider_ref;
ALTER TABLE public.payments RENAME COLUMN amount_ugx TO amount;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

ALTER TABLE public.credit_transactions RENAME COLUMN amount_ugx TO amount;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Update the add_credits RPC function
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user uuid,
  p_credits integer,
  p_amount integer,
  p_currency text DEFAULT 'USD',
  p_reference text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_balance integer;
BEGIN
  INSERT INTO public.wallets (user_id, balance_credits)
  VALUES (p_user, p_credits)
  ON CONFLICT (user_id)
  DO UPDATE SET balance_credits = public.wallets.balance_credits + p_credits, updated_at = now()
  RETURNING balance_credits INTO new_balance;
  
  INSERT INTO public.credit_transactions (user_id, type, credits, amount, currency, reference)
  VALUES (p_user, 'purchase', p_credits, p_amount, p_currency, p_reference);
  
  RETURN new_balance;
END;
$$;
