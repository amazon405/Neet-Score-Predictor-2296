import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const {
  FiDownload,
  FiFileText,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiTarget,
  FiSettings
} = FiIcons;

const ExportManager = () => {
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    category: 'all',
    state: 'all',
    includeFields: {
      personalInfo: true,
      academicInfo: true,
      scoreDetails: true,
      predictions: true,
      timestamps: true
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState({
    totalRecords: 0,
    filteredRecords: 0
  });

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FiFileText, description: 'Comma-separated values' },
    { value: 'xlsx', label: 'Excel', icon: FiFileText, description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', icon: FiFileText, description: 'JavaScript Object Notation' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const categories = ['all', 'General', 'OBC', 'SC', 'ST', 'EWS'];
  const states = [
    'all', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu',
    'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Punjab'
  ];

  const handleConfigChange = (field, value) => {
    setExportConfig({ ...exportConfig, [field]: value });
  };

  const handleFieldToggle = (field) => {
    setExportConfig({
      ...exportConfig,
      includeFields: {
        ...exportConfig.includeFields,
        [field]: !exportConfig.includeFields[field]
      }
    });
  };

  const fetchFilteredData = async () => {
    try {
      let query = supabase.from('student_predictions').select('*');

      // Apply date filters
      if (exportConfig.dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', today);
      } else if (exportConfig.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (exportConfig.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        query = query.gte('created_at', monthAgo.toISOString());
      } else if (exportConfig.dateRange === 'custom' && exportConfig.startDate && exportConfig.endDate) {
        query = query.gte('created_at', exportConfig.startDate).lte('created_at', exportConfig.endDate);
      }

      // Apply category filter
      if (exportConfig.category !== 'all') {
        query = query.eq('category', exportConfig.category);
      }

      // Apply state filter
      if (exportConfig.state !== 'all') {
        query = query.eq('state', exportConfig.state);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      return [];
    }
  };

  const prepareExportData = (students) => {
    return students.map(student => {
      const exportData = {};

      if (exportConfig.includeFields.personalInfo) {
        exportData['Full Name'] = student.full_name;
        exportData['Email'] = student.email;
        exportData['Phone'] = student.phone;
        exportData['City'] = student.city;
        exportData['State'] = student.state;
        exportData['Category'] = student.category;
      }

      if (exportConfig.includeFields.academicInfo) {
        exportData['School Name'] = student.school_name || '';
        exportData['Current Class'] = student.current_class;
        exportData['Exam Year'] = student.exam_year;
      }

      if (exportConfig.includeFields.scoreDetails) {
        exportData['Physics Score'] = student.physics_score;
        exportData['Chemistry Score'] = student.chemistry_score;
        exportData['Biology Score'] = student.biology_score;
        exportData['Total Score'] = student.total_score;
        exportData['Score Percentage'] = ((student.total_score / 720) * 100).toFixed(2);
      }

      if (exportConfig.includeFields.predictions) {
        exportData['Expected Rank'] = student.expected_rank;
        exportData['Min Rank'] = student.min_rank;
        exportData['Max Rank'] = student.max_rank;
        exportData['Percentile'] = student.percentile;
      }

      if (exportConfig.includeFields.timestamps) {
        exportData['Created Date'] = format(new Date(student.created_at), 'yyyy-MM-dd');
        exportData['Created Time'] = format(new Date(student.created_at), 'HH:mm:ss');
      }

      return exportData;
    });
  };

  const exportToCSV = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neet_students_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data) => {
    // In a real implementation, you would use a library like xlsx
    // For now, we'll export as CSV with .xlsx extension
    exportToCSV(data);
    alert('Excel export feature coming soon! Downloaded as CSV for now.');
  };

  const exportToJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neet_students_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const students = await fetchFilteredData();
      const exportData = prepareExportData(students);

      switch (exportConfig.format) {
        case 'csv':
          exportToCSV(exportData);
          break;
        case 'xlsx':
          exportToExcel(exportData);
          break;
        case 'json':
          exportToJSON(exportData);
          break;
        default:
          exportToCSV(exportData);
      }

      // Log export activity
      await supabase.from('export_logs').insert({
        format: exportConfig.format,
        records_count: exportData.length,
        filters_applied: JSON.stringify(exportConfig),
        exported_by: 'admin' // In real app, use actual admin user
      });

      alert(`Successfully exported ${exportData.length} records!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const previewData = async () => {
    try {
      const students = await fetchFilteredData();
      setExportStats({
        totalRecords: students.length,
        filteredRecords: students.length
      });
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  React.useEffect(() => {
    previewData();
  }, [exportConfig.dateRange, exportConfig.category, exportConfig.state, exportConfig.startDate, exportConfig.endDate]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Export Manager</h2>
          <p className="text-gray-600">Export student data in various formats</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{exportStats.filteredRecords}</div>
          <div className="text-sm text-gray-600">Records to export</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Format</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {exportFormats.map(format => (
                <label
                  key={format.value}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    exportConfig.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportConfig.format === format.value}
                    onChange={(e) => handleConfigChange('format', e.target.value)}
                    className="sr-only"
                  />
                  <SafeIcon icon={format.icon} className="text-xl text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">{format.label}</div>
                    <div className="text-sm text-gray-500">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={exportConfig.dateRange}
                  onChange={(e) => handleConfigChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={exportConfig.category}
                  onChange={(e) => handleConfigChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {exportConfig.dateRange === 'custom' && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportConfig.startDate}
                    onChange={(e) => handleConfigChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportConfig.endDate}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={exportConfig.state}
                onChange={(e) => handleConfigChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {states.map(state => (
                  <option key={state} value={state}>
                    {state === 'all' ? 'All States' : state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field Selection */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Include Fields</h3>
            
            <div className="space-y-3">
              {Object.entries({
                personalInfo: 'Personal Information (Name, Email, Phone, Location)',
                academicInfo: 'Academic Information (School, Class, Exam Year)',
                scoreDetails: 'Score Details (Subject scores, Total, Percentage)',
                predictions: 'Predictions (Rank, Percentile)',
                timestamps: 'Timestamps (Created Date & Time)'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeFields[key]}
                    onChange={() => handleFieldToggle(key)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Format:</span>
                <span className="font-medium text-gray-800">{exportConfig.format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Records:</span>
                <span className="font-medium text-gray-800">{exportStats.filteredRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date Range:</span>
                <span className="font-medium text-gray-800">
                  {exportConfig.dateRange === 'all' ? 'All Time' :
                   exportConfig.dateRange === 'custom' ? 'Custom' :
                   dateRanges.find(r => r.value === exportConfig.dateRange)?.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="font-medium text-gray-800">
                  {exportConfig.category === 'all' ? 'All' : exportConfig.category}
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleExport}
              disabled={isExporting || exportStats.filteredRecords === 0}
              whileHover={{ scale: isExporting ? 1 : 1.02 }}
              whileTap={{ scale: isExporting ? 1 : 0.98 }}
              className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiDownload} />
                  <span>Export Data</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Quick Export Templates */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Templates</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setExportConfig({
                  format: 'csv',
                  dateRange: 'all',
                  category: 'all',
                  state: 'all',
                  includeFields: {
                    personalInfo: true,
                    academicInfo: false,
                    scoreDetails: true,
                    predictions: true,
                    timestamps: false
                  }
                })}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📊 Basic Report (Personal + Scores + Predictions)
              </button>
              
              <button
                onClick={() => setExportConfig({
                  format: 'xlsx',
                  dateRange: 'all',
                  category: 'all',
                  state: 'all',
                  includeFields: {
                    personalInfo: true,
                    academicInfo: true,
                    scoreDetails: true,
                    predictions: true,
                    timestamps: true
                  }
                })}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📋 Complete Report (All Fields)
              </button>
              
              <button
                onClick={() => setExportConfig({
                  format: 'csv',
                  dateRange: 'today',
                  category: 'all',
                  state: 'all',
                  includeFields: {
                    personalInfo: true,
                    academicInfo: false,
                    scoreDetails: false,
                    predictions: true,
                    timestamps: true
                  }
                })}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                📅 Today's Students (Contact Info)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;