-- Re-enable the trigger function with a simplified version for debugging
CREATE OR REPLACE FUNCTION public.update_daily_activity_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_date DATE;
  target_user_id UUID;
BEGIN
  -- Determine the user_id and date from the changed row
  IF (TG_OP = 'DELETE') THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;
  activity_date := CURRENT_DATE;

  -- Upsert a hardcoded value for debugging
  INSERT INTO public.activity_log (user_id, activity_date, count)
  VALUES (target_user_id, activity_date, 1)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET count = activity_log.count + 1;

  RETURN NULL; -- Result is ignored since this is an AFTER trigger
END;
$$;
