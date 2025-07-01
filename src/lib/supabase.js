import { createClient } from '@supabase/supabase-js';

// Project credentials
const SUPABASE_URL = 'https://nhjpwqpdhcutindyegnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanB3cXBkaGN1dGluZHllZ25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MDAyNjIsImV4cCI6MjA2NjQ3NjI2Mn0.TR3t5i3PAvqJFsXBvs0d4lcsE8ByIs_Idd6BS7b0tpA';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration');
  throw new Error('Missing Supabase configuration');
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
    headers: {
      'x-my-custom-header': 'neet-predictor'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('student_predictions')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export default supabase;