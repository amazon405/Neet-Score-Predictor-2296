import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { supabase } from '../lib/supabase';

const { FiUserPlus, FiKey, FiShield, FiCheck, FiAlertCircle } = FiIcons;

const AdminSetup = () => {
  const [adminData, setAdminData] = useState({
    email: 'admin@neetpredictor.com',
    password: 'AdminNEET2024!',
    fullName: 'NEET Admin'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);

  const createAdminUser = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password
      });

      if (authError) {
        // If user already exists, try to sign in
        if (authError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminData.email,
            password: adminData.password
          });
          
          if (signInError) throw signInError;
          
          setResult({
            success: true,
            message: 'Admin user already exists and logged in successfully!',
            userId: signInData.user.id
          });
        } else {
          throw authError;
        }
      } else {
        // Step 2: Update admin_users table
        const { error: profileError } = await supabase
          .from('admin_users')
          .upsert({
            email: adminData.email,
            full_name: adminData.fullName,
            role: 'admin'
          });

        if (profileError) throw profileError;

        setResult({
          success: true,
          message: 'Admin user created successfully!',
          userId: authData.user.id
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to create admin user'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShield} className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Setup</h1>
          <p className="text-gray-600 mt-2">Create admin user for NEET Predictor</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={adminData.email}
              onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={adminData.password}
              onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={adminData.fullName}
              onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <motion.button
            onClick={createAdminUser}
            disabled={isCreating}
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Admin...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <SafeIcon icon={FiUserPlus} />
                <span>Create Admin User</span>
              </div>
            )}
          </motion.button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={result.success ? FiCheck : FiAlertCircle} />
                <span className="text-sm font-medium">{result.message}</span>
              </div>
              {result.success && (
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  <p className="text-sm font-medium text-blue-800">Login Credentials:</p>
                  <p className="text-sm text-blue-700">Email: {adminData.email}</p>
                  <p className="text-sm text-blue-700">Password: {adminData.password}</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiKey} className="text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Save these credentials safely</li>
                  <li>You can change the password after first login</li>
                  <li>Admin has full access to all student data</li>
                  <li>Email verification may be required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="#/admin"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Go to Admin Login →
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;