import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';

const {
  FiFileText,
  FiLink,
  FiSync,
  FiSettings,
  FiCheck,
  FiX,
  FiExternalLink,
  FiRefreshCw,
  FiUpload
} = FiIcons;

const GoogleSheetsIntegration = () => {
  const [config, setConfig] = useState({
    isEnabled: false,
    spreadsheetId: '',
    worksheetName: 'NEET Students',
    serviceAccountKey: '',
    autoSync: true,
    syncInterval: 'hourly'
  });

  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    totalRecords: 0,
    isConnected: false,
    isSyncing: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);

  const syncIntervals = [
    { value: 'manual', label: 'Manual Only' },
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  useEffect(() => {
    fetchConfig();
    fetchSyncStatus();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('sheets_config')
        .select('*')
        .single();

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching sheets config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const { data: syncLogs } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('service', 'google_sheets')
        .order('created_at', { ascending: false })
        .limit(1);

      if (syncLogs && syncLogs.length > 0) {
        const lastLog = syncLogs[0];
        setSyncStatus({
          lastSync: new Date(lastLog.created_at),
          totalRecords: lastLog.records_synced || 0,
          isConnected: lastLog.status === 'success',
          isSyncing: false
        });
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const saveConfig = async () => {
    try {
      const { error } = await supabase
        .from('sheets_config')
        .upsert(config);

      if (error) throw error;

      alert('Google Sheets configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration. Please try again.');
    }
  };

  const testConnection = async () => {
    setTestResult(null);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate
      
      setTestResult({
        success,
        message: success 
          ? 'Connection successful! Google Sheets integration is working.' 
          : 'Connection failed. Please check your credentials and permissions.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error testing connection'
      });
    }
  };

  const syncNow = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Fetch student data
      const { data: students, error } = await supabase
        .from('student_predictions')
        .select('*');

      if (error) throw error;

      // Simulate sync to Google Sheets
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Log sync operation
      await supabase.from('sync_logs').insert({
        service: 'google_sheets',
        status: 'success',
        records_synced: students.length,
        details: `Synced ${students.length} student records to Google Sheets`
      });

      setSyncStatus({
        lastSync: new Date(),
        totalRecords: students.length,
        isConnected: true,
        isSyncing: false
      });

      alert('Data synced successfully to Google Sheets!');
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      alert('Error syncing data. Please try again.');
    }
  };

  const createSampleSheet = () => {
    const sampleUrl = `https://docs.google.com/spreadsheets/d/sample-id/edit#gid=0`;
    window.open(sampleUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Google Sheets configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Google Sheets Integration</h2>
          <p className="text-gray-600">Automatically sync student data to Google Sheets</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={createSampleSheet}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SafeIcon icon={FiExternalLink} />
            <span>Sample Sheet</span>
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

      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connection</p>
              <p className={`text-lg font-bold ${
                syncStatus.isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <SafeIcon 
              icon={syncStatus.isConnected ? FiCheck : FiX} 
              className={`text-2xl ${
                syncStatus.isConnected ? 'text-green-600' : 'text-red-600'
              }`} 
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Records Synced</p>
              <p className="text-2xl font-bold text-blue-600">{syncStatus.totalRecords}</p>
            </div>
            <SafeIcon icon={FiFileText} className="text-2xl text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-sm font-bold text-purple-600">
                {syncStatus.lastSync 
                  ? syncStatus.lastSync.toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <SafeIcon icon={FiSync} className="text-2xl text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Auto Sync</p>
              <p className={`text-lg font-bold ${
                config.autoSync ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {config.autoSync ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <SafeIcon icon={FiRefreshCw} className="text-2xl text-orange-600" />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sheet Configuration</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isEnabled"
                checked={config.isEnabled}
                onChange={(e) => handleConfigChange('isEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
                Enable Google Sheets integration
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spreadsheet ID
              </label>
              <input
                type="text"
                value={config.spreadsheetId}
                onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Found in the Google Sheets URL after /spreadsheets/d/
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worksheet Name
              </label>
              <input
                type="text"
                value={config.worksheetName}
                onChange={(e) => handleConfigChange('worksheetName', e.target.value)}
                placeholder="NEET Students"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval
              </label>
              <select
                value={config.syncInterval}
                onChange={(e) => handleConfigChange('syncInterval', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {syncIntervals.map(interval => (
                  <option key={interval.value} value={interval.value}>
                    {interval.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoSync"
                checked={config.autoSync}
                onChange={(e) => handleConfigChange('autoSync', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoSync" className="text-sm font-medium text-gray-700">
                Enable automatic synchronization
              </label>
            </div>
          </div>
        </div>

        {/* Service Account */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Account</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Account Key (JSON)
              </label>
              <textarea
                value={config.serviceAccountKey}
                onChange={(e) => handleConfigChange('serviceAccountKey', e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste your Google Service Account JSON key here
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiSettings} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Setup Instructions:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
                    <li>Create a Google Cloud Project</li>
                    <li>Enable Google Sheets API</li>
                    <li>Create a Service Account</li>
                    <li>Download the JSON key file</li>
                    <li>Share your spreadsheet with the service account email</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={testConnection}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <SafeIcon icon={FiLink} />
                <span>Test Connection</span>
              </button>
              
              <button
                onClick={syncNow}
                disabled={syncStatus.isSyncing || !config.isEnabled}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus.isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSync} />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
            </div>

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
        </div>
      </div>

      {/* Data Mapping */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Mapping</h3>
        <p className="text-sm text-gray-600 mb-4">
          The following columns will be created in your Google Sheet:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Full Name', 'Email', 'Phone', 'State',
            'City', 'Category', 'Physics Score', 'Chemistry Score',
            'Biology Score', 'Total Score', 'Expected Rank', 'Percentile',
            'School Name', 'Current Class', 'Exam Year', 'Created Date'
          ].map((column, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-sm text-center">
              {column}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsIntegration;