import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLock, FiEye, FiEyeOff, FiShield, FiAlertTriangle, FiWifi, FiCheck } = FiIcons;

const AdminLogin = ({ onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Only test connection, don't show connection issues during login
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      const response = await Promise.race([
        fetch('https://nhjpwqpdhcutindyegnn.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanB3cXBkaGN1dGluZHllZ25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MDAyNjIsImV4cCI6MjA2NjQ3NjI2Mn0.TR3t5i3PAvqJFsXBvs0d4lcsE8ByIs_Idd6BS7b0tpA'
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        )
      ]);

      if (response.ok || response.status === 401) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('limited');
      }
    } catch (error) {
      console.warn('Connection test failed:', error);
      setConnectionStatus('limited');
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!credentials.email || !credentials.password) {
      setLocalError('Please enter both email and password');
      return;
    }

    if (!credentials.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Call parent login handler
    try {
      await onLogin(credentials);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleQuickLogin = () => {
    setCredentials({
      email: 'admin@neetpredictor.com',
      password: 'AdminNEET2024!'
    });
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShield} className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">NEET Predictor Dashboard</p>
        </div>

        {/* Connection Status - Only show if there are issues */}
        {connectionStatus === 'limited' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiWifi} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Limited connectivity detected - Login still works
              </span>
              <button
                onClick={testConnection}
                className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                disabled={isLoading}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Connection Success - Show briefly */}
        {connectionStatus === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCheck} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Server Connected - Ready to login
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start space-x-2"
          >
            <SafeIcon icon={FiAlertTriangle} className="mt-0.5" />
            <span className="text-sm font-medium">{localError}</span>
          </motion.div>
        )}

        {/* Quick Setup */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-blue-800 font-medium mb-3">Quick Access</p>
            <button
              onClick={handleQuickLogin}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              Use Demo Admin Account
            </button>
            <p className="text-xs text-blue-600 mt-2">
              For testing purposes
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiUser} className="text-blue-600" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter admin email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiLock} className="text-blue-600" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !credentials.email || !credentials.password}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Protected admin area</p>
          <p className="mt-1">© 2024 NEET Predictor</p>
          <div className="mt-4">
            <a
              href="#/admin/setup"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Need to create admin account? →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;