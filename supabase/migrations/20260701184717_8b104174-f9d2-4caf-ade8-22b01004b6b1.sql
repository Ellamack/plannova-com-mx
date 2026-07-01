DO $$
DECLARE
  v_new_id bigint;
  v_direct boolean;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    '{"sub":"8ea2a47a-5765-4bf8-a76b-48ecd9082e45","role":"authenticated"}', true);

  -- Test 1: direct call of has_role as authenticated (should now be blocked if desired,
  -- but we mainly care about the RLS path below).
  BEGIN
    SELECT public.has_role(auth.uid(), 'admin'::app_role) INTO v_direct;
    RAISE NOTICE 'DIRECT has_role call succeeded: %', v_direct;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'DIRECT has_role call BLOCKED (permission denied)';
  END;

  -- Test 2: RLS WITH CHECK path via INSERT into galeria (policy uses has_role).
  BEGIN
    INSERT INTO public.galeria (titulo, descripcion, imagen_url, orden)
    VALUES ('__rls_test__', 'temp', NULL, 99999)
    RETURNING id INTO v_new_id;
    RAISE NOTICE 'RLS INSERT via has_role policy SUCCEEDED (id=%)', v_new_id;
    DELETE FROM public.galeria WHERE id = v_new_id;
    RAISE NOTICE 'cleanup done';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'RLS INSERT BLOCKED by permission denied on function (RLS BROKEN)';
    WHEN others THEN
      RAISE NOTICE 'RLS INSERT other error: % / %', SQLSTATE, SQLERRM;
  END;

  RESET ROLE;
END $$;