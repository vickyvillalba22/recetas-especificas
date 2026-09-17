CREATE OR REPLACE FUNCTION public.move_or_swap_weekly_meals(
  p_user_id text,
  p_source_id text,
  p_source_date date,
  p_source_meal_type text,
  p_target_id text,
  p_target_date date,
  p_target_meal_type text
)
RETURNS SETOF public."weekly-menu"
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  source_meal public."weekly-menu"%ROWTYPE;
  target_meal public."weekly-menu"%ROWTYPE;
BEGIN
  SELECT *
  INTO source_meal
  FROM public."weekly-menu"
  WHERE id::text = p_source_id
    AND user_id::text = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La comida origen no existe o no pertenece al usuario.';
  END IF;

  IF source_meal.date IS DISTINCT FROM p_source_date
     OR source_meal.meal_type IS DISTINCT FROM p_source_meal_type THEN
    RAISE EXCEPTION 'La comida origen cambió antes de moverla.';
  END IF;

  IF p_target_id IS NOT NULL AND btrim(p_target_id) <> '' THEN
    SELECT *
    INTO target_meal
    FROM public."weekly-menu"
    WHERE id::text = p_target_id
      AND user_id::text = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'La comida destino no existe o no pertenece al usuario.';
    END IF;

    IF target_meal.date IS DISTINCT FROM p_target_date
       OR target_meal.meal_type IS DISTINCT FROM p_target_meal_type THEN
      RAISE EXCEPTION 'La comida destino cambió antes de moverla.';
    END IF;
  ELSE
    SELECT *
    INTO target_meal
    FROM public."weekly-menu"
    WHERE user_id::text = p_user_id
      AND date = p_target_date
      AND meal_type = p_target_meal_type
      AND id::text <> p_source_id
    FOR UPDATE;
  END IF;

  IF target_meal.id IS NULL THEN
    UPDATE public."weekly-menu"
    SET date = p_target_date,
        meal_type = p_target_meal_type
    WHERE id = source_meal.id;
  ELSE
    UPDATE public."weekly-menu"
    SET date = p_target_date,
        meal_type = p_target_meal_type
    WHERE id = source_meal.id;

    UPDATE public."weekly-menu"
    SET date = p_source_date,
        meal_type = p_source_meal_type
    WHERE id = target_meal.id;
  END IF;

  RETURN QUERY
  SELECT *
  FROM public."weekly-menu"
  WHERE id = source_meal.id
     OR (target_meal.id IS NOT NULL AND id = target_meal.id);
END;
$$;
