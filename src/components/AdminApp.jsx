import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../lib/supabase';

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check for existing session on component mount
    checkExistingSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await handleUserSession(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      setLoading(true);
      console.log('Checking for existing session...');
      
      // Get current session with longer timeout for initial load
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 8000)
        )
      ]);

      if (error) {
        console.warn('Session check error:', error);
        setSessionChecked(true);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Found existing session for:', session.user.email);
        await handleUserSession(session.user);
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.warn('Session check failed:', error.message);
      // Don't show error for session check failures
    } finally {
      setSessionChecked(true);
      setLoading(false);
    }
  };

  const handleUserSession = async (user) => {
    try {
      // Create admin profile
      const adminProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Admin User',
        role: 'admin'
      };

      setUser(user);
      setProfile(adminProfile);
      setError(null);

      console.log('Admin session established for:', user.email);

      // Try to save/update profile in background (don't block login)
      try {
        await Promise.race([
          supabase.from('admin_users').upsert({
            email: user.email,
            full_name: adminProfile.full_name,
            role: 'admin',
            last_login: new Date().toISOString()
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile save timeout')), 3000)
          )
        ]);
        console.log('Admin profile updated in database');
      } catch (dbError) {
        console.warn('Could not update admin profile in DB:', dbError.message);
        // Continue anyway - login still works
      }
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login for:', credentials.email);

      const { data, error: authError } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        )
      ]);

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      console.log('Login successful for:', data.user.email);
      // User session will be handled by onAuthStateChange
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('timeout')) {
        setError('Login is taking longer than usual. Please check your internet connection and try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Logging out...');

      // Sign out with timeout
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timeout')), 5000)
        )
      ]);

      console.log('Logout successful');
    } catch (error) {
      console.warn('Logout error (will clear session anyway):', error);
    } finally {
      // Always clear local state
      setUser(null);
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    checkExistingSession();
  };

  // Show loading spinner while checking session
  if (loading && !sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Admin Panel</h3>
            <p className="text-gray-600">Checking your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Connection Issue</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if logged in
  if (user && profile) {
    return (
      <AdminDashboard
        user={user}
        profile={profile}
        onLogout={handleLogout}
        isLoading={loading}
      />
    );
  }

  // Show login form
  return (
    <AdminLogin
      onLogin={handleLogin}
      isLoading={loading}
    />
  );
};

export default AdminApp;