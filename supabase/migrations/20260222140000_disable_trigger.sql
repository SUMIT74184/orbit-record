-- Disable the trigger function by replacing it with an empty function
CREATE OR REPLACE FUNCTION public.update_daily_activity_log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NULL;
END;
$$;
