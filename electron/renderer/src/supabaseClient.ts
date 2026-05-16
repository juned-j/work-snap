import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eoddrstjsszixbucxvhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZGRyc3Rqc3N6aXhidWN4dmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDgwMzIsImV4cCI6MjA5MDA4NDAzMn0.DMbRhLKX88ZEU3PuGm7s3YWkN3sNr5a7Zqu_TLCt40k' 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: 'auth_token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})