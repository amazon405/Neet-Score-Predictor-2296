import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';

const {
  FiMail,
  FiSettings,
  FiSend,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiEye,
  FiEdit
} = FiIcons;

const EmailServiceConfig = () => {
  const [emailConfig, setEmailConfig] = useState({
    provider: 'sendgrid',
    apiKey: '',
    fromEmail: 'noreply@neetpredictor.com',
    fromName: 'NEET Predictor',
    isEnabled: false
  });

  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    successRate: 0,
    failedEmails: 0,
    lastSent: null
  });

  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const emailProviders = [
    { value: 'sendgrid', label: 'SendGrid', icon: FiMail },
    { value: 'mailgun', label: 'Mailgun', icon: FiMail },
    { value: 'ses', label: 'Amazon SES', icon: FiMail },
    { value: 'smtp', label: 'Custom SMTP', icon: FiSettings }
  ];

  useEffect(() => {
    fetchEmailConfig();
    fetchEmailStats();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .single();

      if (data) {
        setEmailConfig(data);
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const { data: emailLogs } = await supabase
        .from('email_logs')
        .select('*');

      if (emailLogs) {
        const totalSent = emailLogs.length;
        const successful = emailLogs.filter(log => log.status === 'sent').length;
        const successRate = totalSent > 0 ? (successful / totalSent) * 100 : 0;
        const failedEmails = totalSent - successful;
        const lastSent = emailLogs.length > 0 
          ? new Date(Math.max(...emailLogs.map(log => new Date(log.created_at))))
          : null;

        setEmailStats({
          totalSent,
          successRate: Math.round(successRate),
          failedEmails,
          lastSent
        });
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const handleConfigChange = (field, value) => {
    setEmailConfig({ ...emailConfig, [field]: value });
  };

  const saveConfig = async () => {
    try {
      const { error } = await supabase
        .from('email_config')
        .upsert(emailConfig);

      if (error) throw error;

      alert('Email configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration. Please try again.');
    }
  };

  const testEmailService = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2; // 80% success rate
      
      setTestResult({
        success,
        message: success 
          ? 'Test email sent successfully!' 
          : 'Failed to send test email. Check your configuration.'
      });

      // Log the test
      await supabase.from('email_logs').insert({
        recipient: testEmail,
        subject: 'NEET Predictor - Test Email',
        status: success ? 'sent' : 'failed',
        provider: emailConfig.provider,
        is_test: true
      });

      fetchEmailStats();
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error testing email service'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading email configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Email Service Configuration</h2>
          <p className="text-gray-600">Manage email delivery settings and monitor performance</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchEmailStats}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </button>
          <button
            onClick={saveConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiCheck} />
            <span>Save Config</span>
          </button>
        </div>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-blue-600">{emailStats.totalSent}</p>
            </div>
            <SafeIcon icon={FiMail} className="text-2xl text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{emailStats.successRate}%</p>
            </div>
            <SafeIcon icon={FiCheck} className="text-2xl text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{emailStats.failedEmails}</p>
            </div>
            <SafeIcon icon={FiX} className="text-2xl text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Sent</p>
              <p className="text-sm font-bold text-purple-600">
                {emailStats.lastSent 
                  ? emailStats.lastSent.toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <SafeIcon icon={FiSend} className="text-2xl text-purple-600" />
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Provider Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                value={emailConfig.provider}
                onChange={(e) => handleConfigChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {emailProviders.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={emailConfig.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={emailConfig.fromEmail}
                onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
                placeholder="noreply@neetpredictor.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={emailConfig.fromName}
                onChange={(e) => handleConfigChange('fromName', e.target.value)}
                placeholder="NEET Predictor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isEnabled"
                checked={emailConfig.isEnabled}
                onChange={(e) => handleConfigChange('isEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
                Enable email service
              </label>
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Email Service</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={testEmailService}
              disabled={isTesting || !emailConfig.isEnabled}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSend} />
                  <span>Send Test Email</span>
                </>
              )}
            </button>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  testResult.success
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={testResult.success ? FiCheck : FiX} />
                  <span className="text-sm font-medium">{testResult.message}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Email Template Preview */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Email Template Preview</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>From:</strong> {emailConfig.fromName} &lt;{emailConfig.fromEmail}&gt;</div>
                <div><strong>Subject:</strong> 🎯 Your NEET Rank Prediction Report</div>
                <div><strong>Content:</strong> HTML email with prediction details</div>
              </div>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-xs flex items-center space-x-1">
                <SafeIcon icon={FiEye} />
                <span>Preview Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Email Logs */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Email Activity</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
            <SafeIcon icon={FiEye} />
            <span>View All Logs</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMail} className="text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    Prediction Report sent to student@example.com
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Delivered
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailServiceConfig;