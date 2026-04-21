import { createClient } from '@supabase/supabase-js'

// Ye verify karne ke liye ki Vite file read kar raha hai ya nahi
const supabaseUrl = 'https://eoddrstjsszixbucxvhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZGRyc3Rqc3N6aXhidWN4dmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDgwMzIsImV4cCI6MjA5MDA4NDAzMn0.DMbRhLKX88ZEU3PuGm7s3YWkN3sNr5a7Zqu_TLCt40k' 


// --- LOGS START ---
console.log("%c--- SUPABASE DEBUG START ---", "color: yellow; font-weight: bold;");
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key Length:", supabaseKey ? supabaseKey.length : "0 (MISSING)");
console.log("Is Key starting with 'eyJ'?:", supabaseKey?.startsWith('eyJ'));
console.log("%c--- SUPABASE DEBUG END ---", "color: yellow; font-weight: bold;");
// --- LOGS END ---

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase keys are missing! Check electron/renderer/.env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    storageKey: 'worksnap-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})