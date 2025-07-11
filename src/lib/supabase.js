import { createClient } from '@supabase/supabase-js'

// Project credentials - UPDATED with your actual project info
const SUPABASE_URL = 'https://hutelyzhvuppjgggeugb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dGVseXpodnVwcGpnZ2dldWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjY2MTksImV4cCI6MjA2NzQ0MjYxOX0.dnEtb-s9o6CUITm-yVEqTQQStXjNIGuEDGWYn-zMY5w'

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration')
  throw new Error('Missing Supabase configuration')
}

// Create Supabase client with error handling
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {'x-my-custom-header': 'neet-predictor'}
  },
  realtime: {
    params: {eventsPerSecond: 2}
  }
})

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('student_predictions')
      .select('count')
      .limit(1)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}

export default supabase