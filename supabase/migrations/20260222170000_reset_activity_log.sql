-- Drop everything related to activity logging
DROP TRIGGER IF EXISTS on_todo_change_update_activity ON public.todos;
DROP TRIGGER IF EXISTS on_project_change_update_activity ON public.projects;
DROP FUNCTION IF EXISTS public.update_daily_activity_log();
DROP TABLE IF EXISTS public.activity_log;

-- Re-create the activity_log table
CREATE TABLE public.activity_log (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_date)
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Re-create the RLS policies for activity_log
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity" ON public.activity_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));


-- Re-create the function to upsert daily activity counts
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
BEGIN
  -- Determine the user_id and date from the changed row
  IF (TG_OP = 'DELETE') THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;
  target_activity_date := CURRENT_DATE;

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

-- Re-create the triggers for todos and projects
CREATE TRIGGER on_todo_change_update_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_activity_log();

CREATE TRIGGER on_project_change_update_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_activity_log();
