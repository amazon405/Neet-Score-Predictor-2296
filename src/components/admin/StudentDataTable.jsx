import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiMail, 
  FiDownload, 
  FiRefreshCw, 
  FiDatabase, 
  FiAlertTriangle,
  FiUsers,
  FiCheckCircle,
  FiX
} = FiIcons;

const StudentDataTable = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    categories: {}
  });
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, filterCategory, sortBy, sortOrder]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching students data from Supabase...');
      setConnectionStatus('connecting');
      
      // Test connection with a simple query first
      const { data: testData, error: testError } = await supabase
        .from('student_predictions')
        .select('count');
      
      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error('Database connection failed: ' + testError.message);
      }
      
      setConnectionStatus('connected');
      
      // Fetch all student data with timeout
      const { data, error } = await Promise.race([
        supabase
          .from('student_predictions')
          .select(`
            id,
            full_name,
            email,
            phone,
            state,
            city,
            school_name,
            current_class,
            exam_year,
            category,
            physics_score,
            chemistry_score,
            biology_score,
            total_score,
            expected_rank,
            min_rank,
            max_rank,
            percentile,
            created_at
          `)
          .order('created_at', { ascending: false }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
        )
      ]);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error('Failed to fetch student data: ' + error.message);
      }

      console.log(`Fetched ${data?.length || 0} student records`);
      
      // Process and validate data
      const validStudents = (data || []).filter(student => {
        // Basic validation - ensure required fields exist
        return student.full_name && 
               student.email && 
               student.total_score !== null && 
               student.expected_rank !== null;
      });

      console.log(`${validStudents.length} valid students after filtering`);
      
      setStudents(validStudents);
      calculateStats(validStudents);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message || 'Failed to load student data');
      setConnectionStatus('error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (studentData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayCount = studentData.filter(s => 
      new Date(s.created_at) >= today
    ).length;
    
    const weekCount = studentData.filter(s => 
      new Date(s.created_at) >= weekAgo
    ).length;
    
    const categories = {};
    studentData.forEach(s => {
      categories[s.category] = (categories[s.category] || 0) + 1;
    });
    
    setStats({
      total: studentData.length,
      today: todayCount,
      thisWeek: weekCount,
      categories
    });
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm) ||
        student.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(student => student.category === filterCategory);
    }
    
    // Sort students
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Name', 'Email', 'Phone', 'State', 'City', 'Category',
      'Physics Score', 'Chemistry Score', 'Biology Score', 'Total Score',
      'Expected Rank', 'Min Rank', 'Max Rank', 'Percentile', 
      'School', 'Class', 'Exam Year', 'Created At'
    ];

    const csvData = filteredStudents.map(student => [
      student.full_name || '',
      student.email || '',
      student.phone || '',
      student.state || '',
      student.city || '',
      student.category || '',
      student.physics_score || 0,
      student.chemistry_score || 0,
      student.biology_score || 0,
      student.total_score || 0,
      student.expected_rank || 0,
      student.min_rank || 0,
      student.max_rank || 0,
      student.percentile || 0,
      student.school_name || '',
      student.current_class || '',
      student.exam_year || '',
      student.created_at ? format(new Date(student.created_at), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_data_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addSampleData = async () => {
    try {
      setLoading(true);
      
      const sampleStudents = [
        {
          full_name: 'Amit Kumar',
          email: 'amit.kumar@example.com',
          phone: '9876543210',
          state: 'Delhi',
          city: 'New Delhi',
          school_name: 'Delhi Public School',
          current_class: '12th',
          exam_year: '2024',
          category: 'General',
          physics_score: 150,
          chemistry_score: 160,
          biology_score: 320,
          total_score: 630,
          expected_rank: 1200,
          min_rank: 960,
          max_rank: 1440,
          percentile: 98.5
        },
        {
          full_name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '9876543211',
          state: 'Maharashtra',
          city: 'Mumbai',
          school_name: 'St. Xavier School',
          current_class: '12th',
          exam_year: '2024',
          category: 'OBC',
          physics_score: 145,
          chemistry_score: 155,
          biology_score: 310,
          total_score: 610,
          expected_rank: 2500,
          min_rank: 2000,
          max_rank: 3000,
          percentile: 97.2
        },
        {
          full_name: 'Rahul Singh',
          email: 'rahul.singh@example.com',
          phone: '9876543212',
          state: 'Tamil Nadu',
          city: 'Chennai',
          school_name: 'Chennai Public School',
          current_class: '12th',
          exam_year: '2024',
          category: 'SC',
          physics_score: 140,
          chemistry_score: 150,
          biology_score: 300,
          total_score: 590,
          expected_rank: 3500,
          min_rank: 2800,
          max_rank: 4200,
          percentile: 96.1
        }
      ];

      const { error } = await supabase
        .from('student_predictions')
        .insert(sampleStudents);

      if (error) throw error;
      
      await fetchStudents();
      alert('Sample data added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Failed to add sample data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Data</h2>
            <p className="text-gray-600">Loading student predictions...</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching student data from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Data</h2>
            <p className="text-gray-600">Database connection failed</p>
          </div>
          <button 
            onClick={fetchStudents} 
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Retry</span>
          </button>
        </div>
        
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
          <div className="text-red-600 mb-4">
            <SafeIcon icon={FiAlertTriangle} className="text-4xl mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Student Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
            <button 
              onClick={fetchStudents} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="inline mr-2" />
              Try Again
            </button>
            <button 
              onClick={addSampleData} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <SafeIcon icon={FiUsers} className="inline mr-2" />
              Add Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Data</h2>
          <p className="text-gray-600">
            {stats.total} total students | {stats.today} today | {stats.thisWeek} this week
          </p>
        </div>
        <div className="flex space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {connectionStatus === 'connected' ? '● Connected' : '● Disconnected'}
          </div>
          <button
            onClick={fetchStudents}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredStudents.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          <div className="text-sm text-gray-600">Today</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.categories.General || 0}</div>
          <div className="text-sm text-gray-600">General</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.categories.OBC || 0}</div>
          <div className="text-sm text-gray-600">OBC</div>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">
            {(stats.categories.SC || 0) + (stats.categories.ST || 0)}
          </div>
          <div className="text-sm text-gray-600">SC/ST</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Date Created</option>
            <option value="full_name">Name</option>
            <option value="total_score">Total Score</option>
            <option value="expected_rank">Expected Rank</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </p>
        {students.length === 0 && (
          <button
            onClick={addSampleData}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Add Sample Data
          </button>
        )}
      </div>

      {/* Table or Empty State */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.current_class} - {student.exam_year}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.category === 'General' ? 'bg-blue-100 text-blue-800' :
                        student.category === 'OBC' ? 'bg-green-100 text-green-800' :
                        student.category === 'SC' ? 'bg-purple-100 text-purple-800' :
                        student.category === 'ST' ? 'bg-pink-100 text-pink-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.city}</div>
                    <div className="text-sm text-gray-500">{student.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div>P: {student.physics_score}/180</div>
                      <div>C: {student.chemistry_score}/180</div>
                      <div>B: {student.biology_score}/360</div>
                      <div className="font-medium">Total: {student.total_score}/720</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">Rank: {student.expected_rank}</div>
                      <div className="text-gray-500">Percentile: {student.percentile}%</div>
                      <div className="text-gray-500">Range: {student.min_rank}-{student.max_rank}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.created_at ? format(new Date(student.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <SafeIcon icon={FiEye} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Send Email"
                      >
                        <SafeIcon icon={FiMail} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <SafeIcon icon={students.length === 0 ? FiDatabase : FiFilter} className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {students.length === 0 ? 'No Students Found' : 'No Matching Students'}
          </h3>
          <p className="text-gray-600 mb-4">
            {students.length === 0 
              ? "No student data available yet. Students will appear here after they submit predictions." 
              : "No students match your current search criteria."}
          </p>
          {students.length === 0 ? (
            <button
              onClick={addSampleData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiUsers} className="inline mr-2" />
              Add Sample Data
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('All');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Student Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <SafeIcon icon={FiX} className="text-gray-500" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedStudent.full_name}</div>
                  <div><span className="font-medium">Email:</span> {selectedStudent.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedStudent.phone}</div>
                  <div><span className="font-medium">Category:</span> {selectedStudent.category}</div>
                  <div><span className="font-medium">City:</span> {selectedStudent.city}</div>
                  <div><span className="font-medium">State:</span> {selectedStudent.state}</div>
                  <div><span className="font-medium">School:</span> {selectedStudent.school_name || 'Not provided'}</div>
                </div>
              </div>
              
              {/* Academic Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Academic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Class:</span> {selectedStudent.current_class}</div>
                  <div><span className="font-medium">Exam Year:</span> {selectedStudent.exam_year}</div>
                  <div><span className="font-medium">Physics Score:</span> {selectedStudent.physics_score}/180</div>
                  <div><span className="font-medium">Chemistry Score:</span> {selectedStudent.chemistry_score}/180</div>
                  <div><span className="font-medium">Biology Score:</span> {selectedStudent.biology_score}/360</div>
                  <div><span className="font-medium">Total Score:</span> {selectedStudent.total_score}/720</div>
                  <div><span className="font-medium">Percentage:</span> {((selectedStudent.total_score / 720) * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
            
            {/* Prediction Results */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Prediction Results</h4>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.expected_rank}</div>
                  <div className="text-sm text-gray-600">Expected Rank</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.percentile}%</div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{selectedStudent.min_rank}</div>
                  <div className="text-sm text-gray-600">Best Case</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{selectedStudent.max_rank}</div>
                  <div className="text-sm text-gray-600">Worst Case</div>
                </div>
              </div>
            </div>
            
            {/* Submission Date */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Submitted on: {selectedStudent.created_at ? format(new Date(selectedStudent.created_at), 'PPpp') : 'Unknown'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDataTable;