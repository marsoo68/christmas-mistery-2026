-- Christmas Mystery v4: ВРЕМЕННА тестова функция за показване на ЛИЧНИЯ получател.
-- Изпълни в Supabase SQL Editor преди тестовете в сайта.
-- Тази функция умишлено е тестова и позволява ранно разкриване.
CREATE OR REPLACE FUNCTION public.get_my_test_receiver()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT receiver.display_name
  FROM public.secret_assignments AS assignment
  JOIN public.participants AS giver ON giver.id = assignment.giver_id
  JOIN public.participants AS receiver ON receiver.id = assignment.receiver_id
  WHERE assignment.giver_id = (SELECT auth.uid())
    AND giver.approved = true
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_my_test_receiver() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_test_receiver() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_test_receiver() TO authenticated;
-- СЛЕД ТЕСТА ИЗПЪЛНИ: DROP FUNCTION IF EXISTS public.get_my_test_receiver();
