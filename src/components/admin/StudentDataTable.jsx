import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const { FiSearch, FiFilter, FiEye, FiMail, FiDownload, FiRefreshCw } = FiIcons;

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
      console.log('Fetching students data...');
      
      // Add timeout to prevent long loading
      const { data, error } = await Promise.race([
        supabase
          .from('student_predictions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100), // Limit to improve performance
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        )
      ]);

      if (error) throw error;

      // Filter out any test/fake entries based on common patterns
      const genuineStudents = (data || []).filter(student => {
        // Filter out obvious test entries
        const isTestEntry = 
          student.full_name?.toLowerCase().includes('test') ||
          student.full_name?.toLowerCase().includes('demo') ||
          student.full_name?.toLowerCase().includes('sample') ||
          student.email?.toLowerCase().includes('test') ||
          student.email?.toLowerCase().includes('demo') ||
          student.email?.toLowerCase().includes('example') ||
          student.phone?.includes('1234567890') ||
          student.phone?.includes('0000000000') ||
          student.phone?.includes('9999999999');

        // Filter out entries with invalid scores (all zeros or unrealistic values)
        const hasValidScores = 
          student.total_score > 0 &&
          student.physics_score >= 0 && student.physics_score <= 180 &&
          student.chemistry_score >= 0 && student.chemistry_score <= 180 &&
          student.biology_score >= 0 && student.biology_score <= 360;

        // Filter out entries with incomplete essential data
        const hasEssentialData = 
          student.full_name && 
          student.email && 
          student.phone && 
          student.state && 
          student.city;

        return !isTestEntry && hasValidScores && hasEssentialData;
      });

      console.log(`Loaded ${genuineStudents.length} genuine students from ${(data || []).length} total entries`);
      setStudents(genuineStudents);

    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load student data. Please try again.');
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm);

      const matchesCategory = filterCategory === 'All' || student.category === filterCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
      'Expected Rank', 'Percentile', 'School', 'Class', 'Exam Year', 'Created At'
    ];

    const csvData = filteredStudents.map(student => [
      student.full_name,
      student.email,
      student.phone,
      student.state,
      student.city,
      student.category,
      student.physics_score,
      student.chemistry_score,
      student.biology_score,
      student.total_score,
      student.expected_rank,
      student.percentile,
      student.school_name,
      student.current_class,
      student.exam_year,
      format(new Date(student.created_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Data</h2>
            <p className="text-gray-600">Loading genuine student predictions...</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
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
            <p className="text-gray-600">Manage and analyze student predictions</p>
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
            <SafeIcon icon={FiFilter} className="text-4xl mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Data</h2>
          <p className="text-gray-600">
            Showing {filteredStudents.length} genuine student predictions
          </p>
        </div>
        <div className="flex space-x-2">
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
            <span>Export CSV</span>
          </button>
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
              placeholder="Search by name, email, phone..."
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
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} genuine students
        </p>
      </div>

      {/* Table or Empty State */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }} // Reduced delay for faster rendering
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{student.full_name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
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
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{student.city}</div>
                    <div className="text-sm text-gray-500">{student.state}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div>P: {student.physics_score}</div>
                      <div>C: {student.chemistry_score}</div>
                      <div>B: {student.biology_score}</div>
                      <div className="font-medium">Total: {student.total_score}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">Rank: {student.expected_rank}</div>
                      <div className="text-gray-500">Percentile: {student.percentile}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {format(new Date(student.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(student.created_at), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Details"
                      >
                        <SafeIcon icon={FiEye} />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
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
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <SafeIcon icon={FiFilter} className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Students Found</h3>
          <p className="text-gray-600 mb-4">
            {students.length === 0 
              ? "No genuine student data available yet."
              : "No students match your current search criteria."
            }
          </p>
          {students.length === 0 && (
            <button
              onClick={fetchStudents}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Student Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <SafeIcon icon={FiFilter} className="transform rotate-45" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedStudent.full_name}</div>
                  <div><span className="font-medium">Email:</span> {selectedStudent.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedStudent.phone}</div>
                  <div><span className="font-medium">Category:</span> {selectedStudent.category}</div>
                  <div><span className="font-medium">City:</span> {selectedStudent.city}</div>
                  <div><span className="font-medium">State:</span> {selectedStudent.state}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Academic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">School:</span> {selectedStudent.school_name || 'Not provided'}</div>
                  <div><span className="font-medium">Class:</span> {selectedStudent.current_class}</div>
                  <div><span className="font-medium">Exam Year:</span> {selectedStudent.exam_year}</div>
                  <div><span className="font-medium">Physics:</span> {selectedStudent.physics_score}/180</div>
                  <div><span className="font-medium">Chemistry:</span> {selectedStudent.chemistry_score}/180</div>
                  <div><span className="font-medium">Biology:</span> {selectedStudent.biology_score}/360</div>
                  <div><span className="font-medium">Total:</span> {selectedStudent.total_score}/720</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Prediction Results</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.expected_rank}</div>
                  <div className="text-gray-600">Expected Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.percentile}%</div>
                  <div className="text-gray-600">Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((selectedStudent.total_score / 720) * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Score %</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDataTable;