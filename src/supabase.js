import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fneukwwstetpisaldpau.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZXVrd3dzdGV0cGlzYWxkcGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzc5MTEsImV4cCI6MjA4ODg1MzkxMX0.EQOzhsD-hYUpzp9s1rb5hNDJZEG7YwbnNGElJqQts4s'

export const supabase = createClient(supabaseUrl, supabaseKey)