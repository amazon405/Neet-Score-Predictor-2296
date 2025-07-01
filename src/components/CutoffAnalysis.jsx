import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getCutoffTrends } from '../utils/cutoffData';

const { FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart3 } = FiIcons;

const CutoffAnalysis = () => {
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [selectedState, setSelectedState] = useState('All India');
  
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const states = ['All India', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu'];
  
  const cutoffData = getCutoffTrends(selectedCategory, selectedState);

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return FiTrendingUp;
      case 'down': return FiTrendingDown;
      default: return FiMinus;
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up': return 'red';
      case 'down': return 'green';
      default: return 'gray';
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
          Cutoff Analysis
        </h1>
        <p className="text-lg text-gray-600">
          Analyze historical cutoff trends for medical colleges
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Quota
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Cutoff Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-2 mb-6">
          <SafeIcon icon={FiBarChart3} className="text-xl text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Cutoff Trends - {selectedCategory} ({selectedState})
          </h2>
        </div>

        <div className="space-y-4">
          {cutoffData.map((college, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {college.name}
                  </h3>
                  <p className="text-sm text-gray-600">{college.location}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <SafeIcon 
                    icon={getTrendIcon(college.trend)} 
                    className={`text-${getTrendColor(college.trend)}-600`} 
                  />
                  <span className={`text-sm font-medium text-${getTrendColor(college.trend)}-600`}>
                    {college.trendText}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {college.years.map((yearData, yearIndex) => (
                  <div key={yearIndex} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">{yearData.year}</div>
                    <div className="text-lg font-bold text-gray-800">
                      {yearData.cutoff}
                    </div>
                    <div className="text-xs text-gray-500">
                      {yearData.score} marks
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Expected 2024 Cutoff:</span>
                  <span className="font-bold text-blue-600">
                    {college.predicted2024}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Trends Analysis</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Competition has increased over the past 3 years</li>
              <li>• Government college cutoffs are rising consistently</li>
              <li>• State quota provides better opportunities</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Apply for both AIQ and state counseling</li>
              <li>• Consider multiple states for better chances</li>
              <li>• Keep backup options in private colleges</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CutoffAnalysis;