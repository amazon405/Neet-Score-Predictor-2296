import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getCollegePredictions } from '../utils/collegePredictions';

const { FiMapPin, FiStar, FiUsers, FiTrendingUp, FiFilter, FiDownload, FiUniversity } = FiIcons;

const CollegeRecommendations = ({ userRank, category, studentInfo }) => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [filters, setFilters] = useState({
    state: studentInfo?.state || 'All States',
    type: 'All Types',
    chanceRange: 'All',
    sortBy: 'chance'
  });
  const [loading, setLoading] = useState(true);

  const states = [
    'All States', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
    'Gujarat', 'Rajasthan', 'West Bengal', 'Punjab', 'Kerala', 'Madhya Pradesh', 
    'Assam', 'Haryana', 'Jharkhand', 'Puducherry'
  ];

  const collegeTypes = ['All Types', 'Government', 'Private', 'Deemed University'];

  const chanceRanges = [
    { value: 'All', label: 'All Chances' },
    { value: 'high', label: 'High (80%+)' },
    { value: 'good', label: 'Good (60-79%)' },
    { value: 'moderate', label: 'Moderate (40-59%)' },
    { value: 'low', label: 'Low (<40%)' }
  ];

  useEffect(() => {
    if (userRank && category) {
      fetchCollegePredictions();
    }
  }, [userRank, category]);

  useEffect(() => {
    applyFilters();
  }, [predictions, filters]);

  const fetchCollegePredictions = async () => {
    setLoading(true);
    try {
      // Get predictions for user's state and all states
      const userStatePredictions = await getCollegePredictions(userRank, category, studentInfo?.state || 'All States');
      const allStatePredictions = await getCollegePredictions(userRank, category, 'All States');

      // Combine and remove duplicates
      const allPredictions = [...userStatePredictions];
      allStatePredictions.forEach(college => {
        if (!allPredictions.find(existing => existing.name === college.name)) {
          allPredictions.push(college);
        }
      });

      // Sort by admission chances
      allPredictions.sort((a, b) => b.admissionChance - a.admissionChance);
      setPredictions(allPredictions);
    } catch (error) {
      console.error('Error fetching college predictions:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  
  const applyFilters = () => {
    let filtered = [...predictions];

    // Filter by state
    if (filters.state !== 'All States') {
      filtered = filtered.filter(college => college.location === filters.state);
    }

    // Filter by type
    if (filters.type !== 'All Types') {
      filtered = filtered.filter(college => college.type === filters.type);
    }

    // Filter by chance range
    if (filters.chanceRange !== 'All') {
      switch (filters.chanceRange) {
        case 'high':
          filtered = filtered.filter(college => college.admissionChance >= 80);
          break;
        case 'good':
          filtered = filtered.filter(college => college.admissionChance >= 60 && college.admissionChance < 80);
          break;
        case 'moderate':
          filtered = filtered.filter(college => college.admissionChance >= 40 && college.admissionChance < 60);
          break;
        case 'low':
          filtered = filtered.filter(college => college.admissionChance < 40);
          break;
      }
    }

    // Sort
    switch (filters.sortBy) {
      case 'chance':
        filtered.sort((a, b) => b.admissionChance - a.admissionChance);
        break;
      case 'cutoff':
        filtered.sort((a, b) => a.cutoffRank - b.cutoffRank);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'location':
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'fees':
        filtered.sort((a, b) => {
          const aFees = parseInt(a.fees.replace(/[^\d]/g, ''));
          const bFees = parseInt(b.fees.replace(/[^\d]/g, ''));
          return aFees - bFees;
        });
        break;
    }

    setFilteredPredictions(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const getChanceColor = (chance) => {
    if (chance >= 80) return 'green';
    if (chance >= 60) return 'blue';
    if (chance >= 40) return 'yellow';
    return 'red';
  };

  const getChanceText = (chance) => {
    if (chance >= 80) return 'High';
    if (chance >= 60) return 'Good';
    if (chance >= 40) return 'Moderate';
    return 'Low';
  };
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'Government': return FiStar;
      case 'Private': return FiUsers;
      case 'Deemed University': return FiUniversity;
      default: return FiUsers;
    }
  };

  const exportCollegeList = () => {
    try {
      const csvData = filteredPredictions.map(college => [
        college.name,
        college.location,
        college.type,
        college.cutoffRank,
        college.admissionChance + '%',
        college.fees,
        college.seats
      ]);

      const headers = ['College Name', 'Location', 'Type', 'Cutoff Rank', 'Admission Chance', 'Fees', 'Seats'];
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `college_recommendations_rank_${userRank}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleCutoffAnalysis = () => {
    try {
      navigate('/cutoff-analysis');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to hash navigation
      window.location.hash = '/cutoff-analysis';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Finding colleges for your rank...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              College Recommendations
            </h3>
            <p className="text-gray-600">
              Based on your predicted rank: <strong className="text-blue-600">{userRank}</strong>
              | Category: <strong className="text-blue-600">{category}</strong>
              {studentInfo?.state && (
                <>
                  | Home State: <strong className="text-blue-600">{studentInfo.state}</strong>
                </>
              )}
            </p>
          </div>
          <button
            onClick={exportCollegeList}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export List</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">
              {filteredPredictions.filter(c => c.admissionChance >= 60).length}
            </div>
            <div className="text-xs text-gray-600">Good Chances</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600">
              {filteredPredictions.filter(c => c.type === 'Government').length}
            </div>
            <div className="text-xs text-gray-600">Government</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-600">
              {filteredPredictions.filter(c => c.type === 'Private').length}
            </div>
            <div className="text-xs text-gray-600">Private</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">
              {filteredPredictions.filter(c => c.type === 'Deemed University').length}
            </div>
            <div className="text-xs text-gray-600">Deemed Univ.</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-600">
              {filteredPredictions.filter(c => c.location === studentInfo?.state).length}
            </div>
            <div className="text-xs text-gray-600">Home State</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiFilter} className="text-gray-600" />
          <h4 className="font-semibold text-gray-800">Filters</h4>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {collegeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Chance</label>
            <select
              value={filters.chanceRange}
              onChange={(e) => handleFilterChange('chanceRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {chanceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="chance">Admission Chance</option>
              <option value="cutoff">Cutoff Rank</option>
              <option value="name">College Name</option>
              <option value="location">Location</option>
              <option value="fees">Fees (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredPredictions.length} of {predictions.length} colleges
        </p>
        {filteredPredictions.length > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            Best match: {filteredPredictions[0]?.name}
          </p>
        )}
      </div>

      {/* College List */}
      <div className="space-y-4">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((college, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }} // Faster animation for many items
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {college.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full bg-${
                      college.type === 'Government' ? 'blue' : 
                      college.type === 'Private' ? 'purple' : 'green'
                    }-100 text-${
                      college.type === 'Government' ? 'blue' : 
                      college.type === 'Private' ? 'purple' : 'green'
                    }-700`}>
                      {college.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiMapPin} />
                      <span>{college.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={getTypeIcon(college.type)} />
                      <span>Seats: {college.seats}</span>
                    </div>
                  </div>
                </div>

                {/* Admission Chance Badge */}
                <div className={`bg-${getChanceColor(college.admissionChance)}-100 text-${getChanceColor(college.admissionChance)}-700 px-4 py-2 rounded-full`}>
                  <div className="text-center">
                    <div className="font-bold text-lg">{college.admissionChance}%</div>
                    <div className="text-xs">{getChanceText(college.admissionChance)} Chance</div>
                  </div>
                </div>
              </div>

              {/* College Details */}
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block">Cutoff Rank ({category})</span>
                  <div className="font-semibold text-lg">{college.cutoffRank}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block">Annual Fees</span>
                  <div className="font-semibold text-lg">{college.fees}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block">Total Seats</span>
                  <div className="font-semibold text-lg">{college.seats}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-500 block">Your Position</span>
                  <div className={`font-semibold text-lg ${userRank <= college.cutoffRank ? 'text-green-600' : 'text-red-600'}`}>
                    {userRank <= college.cutoffRank ? 'Above Cutoff' : 'Below Cutoff'}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              {college.admissionChance >= 60 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiTrendingUp} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Recommended: High chances of admission with your rank!
                    </span>
                  </div>
                </div>
              )}

              {college.location === studentInfo?.state && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMapPin} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Home State Advantage: Apply for state quota for better chances!
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Colleges Found</h3>
            <p className="text-gray-600 mb-4">
              No colleges match your current filter criteria.
            </p>
            <button
              onClick={() => setFilters({ state: 'All States', type: 'All Types', chanceRange: 'All', sortBy: 'chance' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Call to Action */}
      {filteredPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200"
        >
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              Ready for NEET Counseling?
            </h4>
            <p className="text-gray-600 mb-4">
              Save this list and prepare your documents for the upcoming counseling rounds.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={exportCollegeList}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Download College List
              </button>
              <button
                onClick={handleCutoffAnalysis}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Cutoff Trends
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CollegeRecommendations;