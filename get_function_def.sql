-- Once you find a suspicious function name from check_triggers.sql,
-- replace 'FUNCTION_NAME_HERE' with the actual function name:

SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'FUNCTION_NAME_HERE';
