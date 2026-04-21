import { createClient } from '@supabase/supabase-js'

// Ye verify karne ke liye ki Vite file read kar raha hai ya nahi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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