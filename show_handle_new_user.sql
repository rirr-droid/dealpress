-- Show the full source code of handle_new_user function
SELECT prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
