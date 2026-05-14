const SUPABASE_URL = "https://bjbfqwdjfqspzwlbpckj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYmZxd2RqZnFzcHp3bGJwY2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTIyOTgsImV4cCI6MjA5NDI4ODI5OH0.5CIdOtI6RQnnYDOpG1_pu26NaxZ-MC2XOdKug5QCMNk";

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
