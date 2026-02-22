-- Fix ambiguous activity_date and re-enable correct trigger logic
CREATE OR REPLACE FUNCTION public.update_daily_activity_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_activity_date DATE;
  target_user_id UUID;
  total_count INT;
  event_timestamp TIMESTAMPTZ; -- New variable to hold the relevant timestamp
BEGIN
  -- Determine the user_id and the relevant timestamp from the changed row
  IF (TG_OP = 'DELETE') THEN
    target_user_id := OLD.user_id;
    event_timestamp := OLD.created_at; -- Assuming created_at is a good proxy for activity date on delete
  ELSE
    target_user_id := NEW.user_id;
    IF (TG_OP = 'INSERT') THEN
      event_timestamp := NEW.created_at;
    ELSIF (TG_OP = 'UPDATE') THEN
      event_timestamp := NEW.updated_at;
    END IF;
  END IF;

  -- Derive the activity date from the event timestamp
  target_activity_date := date(event_timestamp);

  -- Calculate the total count for the specific day
  SELECT
    COALESCE((SELECT count(*) FROM todos WHERE todos.user_id = target_user_id AND date(created_at) = target_activity_date), 0) +
    COALESCE((SELECT count(*) FROM todos WHERE todos.user_id = target_user_id AND completed = true AND date(updated_at) = target_activity_date), 0) +
    COALESCE((SELECT count(*) FROM projects WHERE projects.user_id = target_user_id AND date(created_at) = target_activity_date), 0)
  INTO total_count;

  -- Upsert the aggregated count into the activity_log
  INSERT INTO public.activity_log (user_id, activity_date, count)
  VALUES (target_user_id, target_activity_date, total_count)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET count = total_count;

  RETURN NULL; -- Result is ignored since this is an AFTER trigger
END;
$$;
