-- Drop the old function and triggers if they exist
DROP TRIGGER IF EXISTS on_todo_created_log_activity ON public.todos;
DROP TRIGGER IF EXISTS on_project_created_log_activity ON public.projects;
DROP FUNCTION IF EXISTS public.log_activity();

-- Modify the activity_log table
ALTER TABLE public.activity_log DROP COLUMN IF EXISTS activity_type;
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_pkey;
ALTER TABLE public.activity_log DROP COLUMN IF EXISTS id;
ALTER TABLE public.activity_log ADD UNIQUE (user_id, activity_date);


-- Function to upsert daily activity counts
CREATE OR REPLACE FUNCTION public.update_daily_activity_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_date DATE;
  target_user_id UUID;
  total_count INT;
BEGIN
  -- Determine the user_id and date from the changed row
  IF (TG_OP = 'DELETE') THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;
  activity_date := CURRENT_DATE;

  -- Calculate the total count for the specific day
  SELECT
    (SELECT count(*) FROM todos WHERE todos.user_id = target_user_id AND date(created_at) = activity_date) +
    (SELECT count(*) FROM todos WHERE todos.user_id = target_user_id AND completed = true AND date(updated_at) = activity_date) +
    (SELECT count(*) FROM projects WHERE projects.user_id = target_user_id AND date(created_at) = activity_date)
  INTO total_count;

  -- Upsert the aggregated count into the activity_log
  INSERT INTO public.activity_log (user_id, activity_date, count)
  VALUES (target_user_id, activity_date, total_count)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET count = total_count;

  RETURN NULL; -- Result is ignored since this is an AFTER trigger
END;
$$;


-- Create new triggers for todos and projects
CREATE TRIGGER on_todo_change_update_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_activity_log();

CREATE TRIGGER on_project_change_update_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_activity_log();