import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';

const { FiUpload, FiDownload, FiTrash2, FiDatabase, FiCheck, FiX, FiEdit, FiSearch, FiInfo, FiRefreshCw, FiAlertTriangle, FiStar, FiUsers } = FiIcons;

const CollegeDataManager = () => {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterQuota, setFilterQuota] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    government: 0,
    private: 0,
    deemed: 0,
    allIndiaQuota: 0,
    stateQuota: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [tableCreated, setTableCreated] = useState(false);

  useEffect(() => {
    initializeComponent();
  }, []);

  useEffect(() => {
    filterColleges();
  }, [colleges, searchTerm, filterType, filterQuota]);

  const initializeComponent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First test the database connection
      await testDatabaseConnection();
      
      // Then try to create the table if it doesn't exist
      await ensureTableExists();
      
      // Finally fetch the colleges
      await fetchColleges();
    } catch (error) {
      console.error('Failed to initialize College Data Manager:', error);
      setError({
        type: 'initialization',
        message: error.message || 'Failed to initialize the college data system',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      setConnectionStatus('testing');
      
      const { data, error } = await Promise.race([
        supabase.from('student_predictions').select('*').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      
      if (error && !error.message.toLowerCase().includes('does not exist')) {
        throw error;
      }
      
      setConnectionStatus('connected');
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      if (error.message.includes('timeout')) {
        setConnectionStatus('timeout');
        throw new Error('Connection timed out. Please check your internet connection.');
      } else {
        setConnectionStatus('failed');
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
  };

  const ensureTableExists = async () => {
    try {
      console.log('Checking if colleges table exists...');
      
      // Try to query the table first to see if it exists
      const { data, error } = await supabase
        .from('colleges')
        .select('id')
        .limit(1);
      
      if (error) {
        // If table doesn't exist, we'll create it
        if (error.message.toLowerCase().includes('does not exist') || error.code === '42P01') {
          console.log('Colleges table does not exist, creating it now...');
          
          // Create the table with direct SQL including quota column
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS colleges (
              id BIGSERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              location TEXT NOT NULL,
              type TEXT NOT NULL,
              quota TEXT NOT NULL DEFAULT 'All India Quota',
              cutoff_ranks JSONB NOT NULL,
              fees TEXT NOT NULL,
              seats INTEGER NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Enable RLS
            ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for public read access
            CREATE POLICY "Public read access" ON colleges FOR SELECT USING (true);
            
            -- Create policy for authenticated users to insert/update/delete
            CREATE POLICY "Authenticated users full access" ON colleges FOR ALL USING (auth.role() = 'authenticated');
          `;
          
          // Execute the SQL through the REST API
          const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
          
          if (createError) {
            console.error('Error creating table:', createError);
            throw new Error('Failed to create colleges table. Please create it manually in Supabase SQL editor.');
          }
          
          console.log('Colleges table created successfully');
          setTableCreated(true);
        } else {
          throw error;
        }
      } else {
        // Check if quota column exists, if not add it
        try {
          const { data: testQuota, error: quotaError } = await supabase
            .from('colleges')
            .select('quota')
            .limit(1);
          
          if (quotaError && quotaError.message.includes('column "quota" does not exist')) {
            console.log('Adding quota column to existing table...');
            const addColumnSQL = `
              ALTER TABLE colleges ADD COLUMN IF NOT EXISTS quota TEXT NOT NULL DEFAULT 'All India Quota';
            `;
            
            const { error: addColumnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
            if (addColumnError) {
              console.warn('Could not add quota column automatically:', addColumnError);
            }
          }
        } catch (quotaCheckError) {
          console.warn('Could not check/add quota column:', quotaCheckError);
        }
        
        console.log('Colleges table exists and is accessible');
        setTableCreated(true);
      }
    } catch (error) {
      console.error('Table check/creation failed:', error);
      
      // Special case for common error
      if (error.message.includes('permission denied for schema public')) {
        throw new Error('Permission denied accessing database tables. Please ensure you have proper permissions.');
      } else if (error.message.includes('exec_sql')) {
        throw new Error('Unable to create table automatically. Please create it manually in Supabase SQL editor.');
      } else {
        throw new Error(`Table setup failed: ${error.message}`);
      }
    }
  };

  const fetchColleges = async () => {
    try {
      if (!tableCreated) {
        throw new Error('Colleges table not yet created or verified');
      }
      
      console.log('Fetching colleges from database...');
      
      const { data, error } = await Promise.race([
        supabase
          .from('colleges')
          .select('*')
          .order('name'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 10000)
        )
      ]);

      if (error) {
        throw error;
      }

      // Process data
      const processedColleges = data || [];
      setColleges(processedColleges);
      
      // Calculate stats including quota breakdown
      const statsData = {
        total: processedColleges.length,
        government: processedColleges.filter(c => c.type === 'Government').length,
        private: processedColleges.filter(c => c.type === 'Private').length,
        deemed: processedColleges.filter(c => c.type === 'Deemed University').length,
        allIndiaQuota: processedColleges.filter(c => c.quota === 'All India Quota').length,
        stateQuota: processedColleges.filter(c => c.quota === 'State Quota').length
      };
      setStats(statsData);
      
      console.log(`Successfully loaded ${processedColleges.length} colleges`);
      setError(null);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      if (error.message.includes('timeout')) {
        throw new Error('Fetching colleges timed out. Please try again.');
      } else {
        throw new Error(`Failed to fetch colleges: ${error.message}`);
      }
    }
  };

  const filterColleges = () => {
    let filtered = [...colleges];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(college => 
        college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(college => college.type === filterType);
    }
    
    // Apply quota filter
    if (filterQuota !== 'All') {
      filtered = filtered.filter(college => college.quota === filterQuota);
    }
    
    setFilteredColleges(filtered);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const parseResult = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        });
      });
      
      const { data, errors, meta } = parseResult;
      
      if (errors.length > 0) {
        throw new Error(`CSV parsing errors: ${errors.map(e => e.message).join(', ')}`);
      }
      
      console.log(`Parsed ${data.length} colleges from CSV`);
      
      // Validate data structure - now including quota
      const requiredFields = ['name', 'location', 'type', 'quota', 'cutoffGeneral', 'cutoffOBC', 'cutoffSC', 'cutoffST', 'cutoffEWS', 'fees', 'seats'];
      const missingFields = requiredFields.filter(field => !meta.fields.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`CSV is missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Process data for database
      const collegesData = data.map(row => ({
        name: row.name?.trim() || '',
        location: row.location?.trim() || '',
        type: row.type?.trim() || '',
        quota: row.quota?.trim() || 'All India Quota',
        cutoff_ranks: {
          General: parseInt(row.cutoffGeneral) || 0,
          OBC: parseInt(row.cutoffOBC) || 0,
          SC: parseInt(row.cutoffSC) || 0,
          ST: parseInt(row.cutoffST) || 0,
          EWS: parseInt(row.cutoffEWS) || 0
        },
        fees: row.fees?.trim() || '',
        seats: parseInt(row.seats) || 0,
        created_at: new Date().toISOString()
      })).filter(college => college.name && college.location && college.type);
      
      if (collegesData.length === 0) {
        throw new Error('No valid college data found in CSV file');
      }
      
      // Clear existing data
      const { error: deleteError } = await supabase
        .from('colleges')
        .delete()
        .gt('id', 0); // This will delete all records
      
      if (deleteError) throw deleteError;
      
      // Insert new data in batches to avoid timeout
      const batchSize = 50; // Smaller batch size for better reliability
      let insertedCount = 0;
      
      for (let i = 0; i < collegesData.length; i += batchSize) {
        const batch = collegesData.slice(i, i + batchSize);
        const { data: insertedData, error: insertError } = await supabase
          .from('colleges')
          .insert(batch)
          .select();
        
        if (insertError) throw insertError;
        insertedCount += insertedData?.length || batch.length;
      }
      
      setUploadStatus({
        success: true,
        message: `Successfully uploaded ${insertedCount} colleges`
      });
      
      // Refresh the college list
      await fetchColleges();
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        success: false,
        message: `Upload failed: ${error.message}`
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    // CSV template header - now including quota
    const header = 'name,location,type,quota,cutoffGeneral,cutoffOBC,cutoffSC,cutoffST,cutoffEWS,fees,seats\n';
    
    // Example data rows with quota information
    const exampleRows = [
      '"All India Institute of Medical Sciences (AIIMS), New Delhi","Delhi","Government","All India Quota",50,80,150,200,60,"₹5,856/year",125',
      '"Kasturba Medical College (KMC), Manipal","Karnataka","Private","All India Quota",8000,12000,18000,20000,9000,"₹24,50,000/year",250',
      '"Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER)","Puducherry","Deemed University","All India Quota",400,600,1100,1400,480,"₹8,000/year",200',
      '"Government Medical College, Mumbai","Maharashtra","Government","State Quota",2500,3500,5000,6000,2800,"₹50,000/year",150',
      '"Madras Medical College","Tamil Nadu","Government","State Quota",1800,2500,4000,5000,2000,"₹25,000/year",200'
    ].join('\n');
    
    const csvContent = header + exampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'college_data_template_with_quota.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    setTemplateDownloaded(true);
  };

  const exportColleges = () => {
    if (colleges.length === 0) {
      alert('No colleges to export');
      return;
    }
    
    // Transform data for CSV - now including quota
    const csvData = colleges.map(college => ({
      name: college.name,
      location: college.location,
      type: college.type,
      quota: college.quota || 'All India Quota',
      cutoffGeneral: college.cutoff_ranks?.General || 0,
      cutoffOBC: college.cutoff_ranks?.OBC || 0,
      cutoffSC: college.cutoff_ranks?.SC || 0,
      cutoffST: college.cutoff_ranks?.ST || 0,
      cutoffEWS: college.cutoff_ranks?.EWS || 0,
      fees: college.fees,
      seats: college.seats
    }));
    
    // Convert to CSV
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college_data_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setColleges(colleges.filter(college => college.id !== id));
      setUploadStatus({
        success: true,
        message: 'College deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      setUploadStatus({
        success: false,
        message: `Delete failed: ${error.message}`
      });
    }
  };

  const openEditModal = (college) => {
    setSelectedCollege(college);
    setEditFormData({
      name: college.name,
      location: college.location,
      type: college.type,
      quota: college.quota || 'All India Quota',
      cutoffGeneral: college.cutoff_ranks?.General || 0,
      cutoffOBC: college.cutoff_ranks?.OBC || 0,
      cutoffSC: college.cutoff_ranks?.SC || 0,
      cutoffST: college.cutoff_ranks?.ST || 0,
      cutoffEWS: college.cutoff_ranks?.EWS || 0,
      fees: college.fees,
      seats: college.seats
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedCollege = {
        name: editFormData.name,
        location: editFormData.location,
        type: editFormData.type,
        quota: editFormData.quota,
        cutoff_ranks: {
          General: parseInt(editFormData.cutoffGeneral) || 0,
          OBC: parseInt(editFormData.cutoffOBC) || 0,
          SC: parseInt(editFormData.cutoffSC) || 0,
          ST: parseInt(editFormData.cutoffST) || 0,
          EWS: parseInt(editFormData.cutoffEWS) || 0
        },
        fees: editFormData.fees,
        seats: parseInt(editFormData.seats) || 0,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('colleges')
        .update(updatedCollege)
        .eq('id', selectedCollege.id);
      
      if (error) throw error;
      
      // Update local state
      setColleges(colleges.map(college => 
        college.id === selectedCollege.id ? { ...college, ...updatedCollege } : college
      ));
      
      setIsEditModalOpen(false);
      setUploadStatus({
        success: true,
        message: 'College updated successfully'
      });
    } catch (error) {
      console.error('Update error:', error);
      setUploadStatus({
        success: false,
        message: `Update failed: ${error.message}`
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    initializeComponent();
  };

  const createTableManually = () => {
    const tableSQL = `
-- Create colleges table with quota column
CREATE TABLE IF NOT EXISTS colleges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  quota TEXT NOT NULL DEFAULT 'All India Quota',
  cutoff_ranks JSONB NOT NULL,
  fees TEXT NOT NULL,
  seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON colleges FOR SELECT USING (true);
CREATE POLICY "Authenticated users full access" ON colleges FOR ALL USING (auth.role() = 'authenticated');
    `;
    
    navigator.clipboard.writeText(tableSQL).then(() => {
      alert('SQL copied to clipboard! Go to Supabase SQL Editor and run this query.');
    }).catch(() => {
      console.log('Manual copy - SQL for creating table:', tableSQL);
      alert('Please copy the SQL from the browser console and run it in Supabase SQL editor.');
    });
  };

  // Sample data for direct insertion - now with quota
  const insertSampleData = async () => {
    try {
      setIsLoading(true);
      
      const sampleColleges = [
        {
          name: "All India Institute of Medical Sciences (AIIMS), New Delhi",
          location: "Delhi",
          type: "Government",
          quota: "All India Quota",
          cutoff_ranks: {
            General: 50,
            OBC: 80,
            SC: 150,
            ST: 200,
            EWS: 60
          },
          fees: "₹5,856/year",
          seats: 125
        },
        {
          name: "Kasturba Medical College (KMC), Manipal",
          location: "Karnataka",
          type: "Private",
          quota: "All India Quota",
          cutoff_ranks: {
            General: 8000,
            OBC: 12000,
            SC: 18000,
            ST: 20000,
            EWS: 9000
          },
          fees: "₹24,50,000/year",
          seats: 250
        },
        {
          name: "Government Medical College, Mumbai",
          location: "Maharashtra",
          type: "Government",
          quota: "State Quota",
          cutoff_ranks: {
            General: 2500,
            OBC: 3500,
            SC: 5000,
            ST: 6000,
            EWS: 2800
          },
          fees: "₹50,000/year",
          seats: 150
        },
        {
          name: "Madras Medical College",
          location: "Tamil Nadu",
          type: "Government",
          quota: "State Quota",
          cutoff_ranks: {
            General: 1800,
            OBC: 2500,
            SC: 4000,
            ST: 5000,
            EWS: 2000
          },
          fees: "₹25,000/year",
          seats: 200
        },
        {
          name: "Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER)",
          location: "Puducherry",
          type: "Deemed University",
          quota: "All India Quota",
          cutoff_ranks: {
            General: 400,
            OBC: 600,
            SC: 1100,
            ST: 1400,
            EWS: 480
          },
          fees: "₹8,000/year",
          seats: 200
        }
      ];
      
      const { data, error } = await supabase
        .from('colleges')
        .insert(sampleColleges)
        .select();
      
      if (error) throw error;
      
      setUploadStatus({
        success: true,
        message: `Successfully added ${data.length} sample colleges`
      });
      
      await fetchColleges();
    } catch (error) {
      console.error('Sample data error:', error);
      setUploadStatus({
        success: false,
        message: `Failed to add sample data: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiAlertTriangle} className="text-2xl text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {error.type === 'initialization' ? 'Setup Required' : 'College Data Error'}
                </h3>
                <p className="text-red-700 mb-4">{error.message}</p>
                
                {error.message.includes('does not exist') && (
                  <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800 mb-3">
                      <strong>Setup Instructions:</strong> The colleges table needs to be created in your Supabase database.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={createTableManually}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Copy SQL to Create Table
                      </button>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Open Supabase Dashboard
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiRefreshCw} className="inline mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={insertSampleData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <SafeIcon icon={FiDatabase} className="inline mr-2" />
                    Add Sample Colleges
                  </button>
                  
                  <div className={`flex items-center space-x-2 text-sm ${
                    connectionStatus === 'connected' ? 'text-green-600' : 
                    connectionStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' : 
                      connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span>
                      {connectionStatus === 'connected' && 'Database Connected'}
                      {connectionStatus === 'failed' && 'Database Connection Failed'}
                      {connectionStatus === 'testing' && 'Testing Connection...'}
                      {connectionStatus === 'timeout' && 'Connection Timed Out'}
                      {connectionStatus === 'unknown' && 'Connection Status Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Troubleshooting Tips:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 list-disc list-inside mt-2">
                    <li>Make sure your Supabase project is active and available</li>
                    <li>Check if you have proper permissions to create/modify tables</li>
                    <li>Try connecting with a different browser or network</li>
                    <li>Verify your API keys are correct in the application</li>
                  </ul>
                </div>
                
                {error.details && (
                  <details className="mt-4">
                    <summary className="text-sm text-red-600 cursor-pointer">Technical Details</summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Setting up College Data</h3>
          <p className="text-gray-600">
            {connectionStatus === 'testing' && 'Testing database connection...'}
            {connectionStatus === 'connected' && 'Loading college data...'}
            {connectionStatus === 'unknown' && 'Initializing system...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">College Data Management</h2>
          <p className="text-gray-600">Manage college database for college predictor</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={initializeComponent} 
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={exportColleges} 
            disabled={colleges.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
        connectionStatus === 'connected' ? 'bg-green-50 text-green-700' : 
        connectionStatus === 'failed' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 
          connectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
        }`}></div>
        <span className="text-sm font-medium">
          {connectionStatus === 'connected' && 'Database Connected'}
          {connectionStatus === 'failed' && 'Database Connection Issues'}
          {connectionStatus === 'testing' && 'Testing Connection...'}
          {connectionStatus === 'unknown' && 'Connection Status Unknown'}
        </span>
      </div>

      {/* Enhanced Stats with Quota breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Colleges</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <SafeIcon icon={FiDatabase} className="text-2xl text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Government</p>
              <p className="text-2xl font-bold text-green-600">{stats.government}</p>
            </div>
            <SafeIcon icon={FiStar} className="text-2xl text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Private</p>
              <p className="text-2xl font-bold text-purple-600">{stats.private}</p>
            </div>
            <SafeIcon icon={FiUsers} className="text-2xl text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deemed Univ.</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.deemed}</p>
            </div>
            <SafeIcon icon={FiDatabase} className="text-2xl text-indigo-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">All India Quota</p>
              <p className="text-2xl font-bold text-orange-600">{stats.allIndiaQuota}</p>
            </div>
            <SafeIcon icon={FiStar} className="text-2xl text-orange-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">State Quota</p>
              <p className="text-2xl font-bold text-teal-600">{stats.stateQuota}</p>
            </div>
            <SafeIcon icon={FiUsers} className="text-2xl text-teal-600" />
          </div>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload College Data</h3>
        
        {/* Template Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiInfo} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">CSV File Format</p>
              <p className="text-xs text-blue-700 mb-2">
                The CSV file must include the following columns: name, location, type, <strong>quota</strong>, cutoffGeneral, cutoffOBC, cutoffSC, cutoffST, cutoffEWS, fees, seats
              </p>
              <p className="text-xs text-blue-700 mb-2">
                <strong>Quota options:</strong> "All India Quota", "State Quota", "Management Quota", "NRI Quota"
              </p>
              <button 
                onClick={downloadTemplate} 
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
              >
                <SafeIcon icon={FiDownload} className="text-xs" />
                <span>{templateDownloaded ? 'Download Again' : 'Download Template'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Add Sample Data */}
        {colleges.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiInfo} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Colleges Found</p>
                <p className="text-xs text-yellow-700 mb-2">
                  Your database is empty. You can add sample colleges to get started quickly.
                </p>
                <button 
                  onClick={insertSampleData} 
                  className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                >
                  <SafeIcon icon={FiDatabase} className="text-xs" />
                  <span>Add Sample Colleges</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <SafeIcon icon={FiUpload} className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Drag and drop your CSV file here, or click to browse</p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              className="hidden" 
              id="csv-upload" 
            />
            <label 
              htmlFor="csv-upload" 
              className={`inline-flex items-center space-x-2 px-4 py-2 ${isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white rounded-lg transition-colors`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiUpload} />
                  <span>Select CSV File</span>
                </>
              )}
            </label>
          </div>
          
          {/* Upload Status */}
          {uploadStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${uploadStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={uploadStatus.success ? FiCheck : FiX} />
                <span>{uploadStatus.message}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* College List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">College Database ({filteredColleges.length} colleges)</h3>
          
          <div className="flex space-x-4">
            {/* Search */}
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search colleges..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Deemed University">Deemed University</option>
            </select>
            
            {/* Quota Filter */}
            <select 
              value={filterQuota} 
              onChange={(e) => setFilterQuota(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Quotas</option>
              <option value="All India Quota">All India Quota</option>
              <option value="State Quota">State Quota</option>
              <option value="Management Quota">Management Quota</option>
              <option value="NRI Quota">NRI Quota</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        {filteredColleges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cutoff (General)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredColleges.map((college, index) => (
                  <motion.tr 
                    key={college.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm">{college.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{college.location || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        college.type === 'Government' ? 'bg-blue-100 text-blue-800' : 
                        college.type === 'Private' ? 'bg-purple-100 text-purple-800' : 
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {college.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        college.quota === 'All India Quota' ? 'bg-orange-100 text-orange-800' : 
                        college.quota === 'State Quota' ? 'bg-teal-100 text-teal-800' : 
                        college.quota === 'Management Quota' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {college.quota || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{college.cutoff_ranks?.General || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{college.fees || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{college.seats || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(college)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit College"
                        >
                          <SafeIcon icon={FiEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete College"
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <SafeIcon icon={FiDatabase} className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Colleges Found</h3>
            <p className="text-gray-600 mb-4">
              {colleges.length === 0 
                ? "The college database is empty. Upload a CSV file to add colleges." 
                : "No colleges match your search criteria."}
            </p>
            {colleges.length === 0 ? (
              <button
                onClick={insertSampleData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiDatabase} className="inline mr-2" />
                Add Sample Colleges
              </button>
            ) : (
              <button
                onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterQuota('All'); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit College</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <SafeIcon icon={FiX} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => handleEditFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Type</label>
                  <select
                    value={editFormData.type || ''}
                    onChange={(e) => handleEditFormChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Deemed University">Deemed University</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quota Type</label>
                  <select
                    value={editFormData.quota || ''}
                    onChange={(e) => handleEditFormChange('quota', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All India Quota">All India Quota</option>
                    <option value="State Quota">State Quota</option>
                    <option value="Management Quota">Management Quota</option>
                    <option value="NRI Quota">NRI Quota</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff Ranks</label>
                <div className="grid md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">General</label>
                    <input
                      type="number"
                      value={editFormData.cutoffGeneral || ''}
                      onChange={(e) => handleEditFormChange('cutoffGeneral', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">OBC</label>
                    <input
                      type="number"
                      value={editFormData.cutoffOBC || ''}
                      onChange={(e) => handleEditFormChange('cutoffOBC', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SC</label>
                    <input
                      type="number"
                      value={editFormData.cutoffSC || ''}
                      onChange={(e) => handleEditFormChange('cutoffSC', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ST</label>
                    <input
                      type="number"
                      value={editFormData.cutoffST || ''}
                      onChange={(e) => handleEditFormChange('cutoffST', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">EWS</label>
                    <input
                      type="number"
                      value={editFormData.cutoffEWS || ''}
                      onChange={(e) => handleEditFormChange('cutoffEWS', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                  <input
                    type="text"
                    value={editFormData.fees || ''}
                    onChange={(e) => handleEditFormChange('fees', e.target.value)}
                    placeholder="e.g. ₹5,856/year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                  <input
                    type="number"
                    value={editFormData.seats || ''}
                    onChange={(e) => handleEditFormChange('seats', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeDataManager;