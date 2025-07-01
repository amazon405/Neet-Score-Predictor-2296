import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getCollegePredictions } from '../utils/collegePredictions';

const { FiSearch, FiMapPin, FiStar, FiUsers, FiBook } = FiIcons;

const CollegePredictor = () => {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('General');
  const [state, setState] = useState('All States');
  const [predictions, setPredictions] = useState([]);

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const states = [
    'All States', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 
    'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Punjab'
  ];

  const handlePredict = () => {
    if (!rank) return;
    const results = getCollegePredictions(parseInt(rank), category, state);
    setPredictions(results);
  };

  const getChanceColor = (chance) => {
    if (chance >= 80) return 'green';
    if (chance >= 60) return 'blue';
    if (chance >= 40) return 'yellow';
    return 'red';
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
        
        <div className="grid md:grid-cols-3 gap-6">
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
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePredict}
          disabled={!rank}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          <SafeIcon icon={FiSearch} className="inline mr-2" />
          Find Colleges
        </motion.button>
      </motion.div>

      {/* Results */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            College Predictions ({predictions.length} results)
          </h2>
          
          <div className="space-y-4">
            {predictions.map((college, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {college.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiMapPin} />
                        <span>{college.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={college.type === 'Government' ? FiStar : FiUsers} />
                        <span>{college.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`bg-${getChanceColor(college.admissionChance)}-100 text-${getChanceColor(college.admissionChance)}-700 px-3 py-1 rounded-full text-sm font-medium`}>
                    {college.admissionChance}% chance
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Cutoff Rank:</span>
                    <div className="font-semibold">{college.cutoffRank}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Fees (Annual):</span>
                    <div className="font-semibold">{college.fees}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Seats:</span>
                    <div className="font-semibold">{college.seats}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {predictions.length === 0 && rank && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl shadow-lg"
        >
          <SafeIcon icon={FiBook} className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No colleges found for the given criteria</p>
        </motion.div>
      )}
    </div>
  );
};

export default CollegePredictor;