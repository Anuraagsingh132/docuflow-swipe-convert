
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://krqckyxqapldzifrcpap.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycWNreXhxYXBsZHppZnJjcGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTA3MTYsImV4cCI6MjA2NDU4NjcxNn0.9eKY2G9a7jC5VTDoS7ca8Bim26K9zAUbeX_onarFPfI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
