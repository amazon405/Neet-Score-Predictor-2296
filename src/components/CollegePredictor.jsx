import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getCollegePredictions } from '../utils/collegePredictions';

const { FiSearch, FiMapPin, FiStar, FiUsers, FiBook, FiFilter, FiUniversity } = FiIcons;

const CollegePredictor = () => {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('General');
  const [state, setState] = useState('All States');
  const [collegeType, setCollegeType] = useState('All Types');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const states = [
    'All States', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 
    'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Punjab',
    'Kerala', 'Madhya Pradesh', 'Assam', 'Haryana', 'Jharkhand',
    'Puducherry'
  ];
  
  const collegeTypes = ['All Types', 'Government', 'Private', 'Deemed University'];

  const handlePredict = async () => {
    if (!rank) return;
    
    setLoading(true);
    
    try {
      // Get all colleges based on rank and category
      let results = await getCollegePredictions(parseInt(rank), category, state);
      
      // Filter by college type if needed
      if (collegeType !== 'All Types') {
        results = results.filter(college => college.type === collegeType);
      }
      
      setPredictions(results);
    } catch (error) {
      console.error('Error fetching college predictions:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const getChanceColor = (chance) => {
    if (chance >= 80) return 'green';
    if (chance >= 60) return 'blue';
    if (chance >= 40) return 'yellow';
    return 'red';
  };
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'Government': return FiStar;
      case 'Private': return FiUsers;
      case 'Deemed University': return FiUniversity;
      default: return FiUsers;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-white rounded-2xl p-8 shadow-lg"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          College Predictor
        </h1>
        <p className="text-lg text-gray-600">
          Find medical colleges based on your NEET rank and preferences
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your Details</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NEET Rank
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="Enter your rank"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College Type
            </label>
            <select
              value={collegeType}
              onChange={(e) => setCollegeType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {collegeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePredict}
          disabled={!rank || loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Finding Colleges...</span>
            </div>
          ) : (
            <>
              <SafeIcon icon={FiSearch} className="inline mr-2" />
              Find Colleges
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Results */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              College Predictions ({predictions.length} results)
            </h2>
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiFilter} className="text-gray-500" />
                <select
                  value={collegeType}
                  onChange={(e) => setCollegeType(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {collegeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {predictions.map((college, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }} // Faster animation for many items
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
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
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  
                  <div className={`bg-${getChanceColor(college.admissionChance)}-100 text-${getChanceColor(college.admissionChance)}-700 px-3 py-1 rounded-full text-sm font-medium`}>
                    {college.admissionChance}% chance
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Cutoff Rank ({category}):</span>
                    <div className="font-semibold text-gray-800">{college.cutoffRank}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Fees (Annual):</span>
                    <div className="font-semibold text-gray-800">{college.fees}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Your Position:</span>
                    <div className={`font-semibold ${parseInt(rank) <= college.cutoffRank ? 'text-green-600' : 'text-red-600'}`}>
                      {parseInt(rank) <= college.cutoffRank ? 'Above Cutoff' : 'Below Cutoff'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {predictions.length === 0 && rank && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl shadow-lg"
        >
          <SafeIcon icon={FiBook} className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No colleges found</h3>
          <p className="text-gray-500">No colleges match your criteria. Try adjusting your filters or rank.</p>
        </motion.div>
      )}
      
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl shadow-lg"
        >
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Finding Colleges</h3>
          <p className="text-gray-500">Searching for colleges that match your criteria...</p>
        </motion.div>
      )}
    </div>
  );
};

export default CollegePredictor;