import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The client is optional during local setup so the app can still render without credentials.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const HARDCODED_USER_ID = import.meta.env.VITE_HARDCODED_USER_ID || 'HARDCODED_USER_ID'
