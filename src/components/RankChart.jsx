import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBarChart3 } = FiIcons;

const RankChart = ({ prediction }) => {
  const rankRanges = [
    { range: '1-1000', label: 'Top 1K', color: 'green', percentage: 0.05 },
    { range: '1K-5K', label: '1K-5K', color: 'blue', percentage: 0.25 },
    { range: '5K-15K', label: '5K-15K', color: 'yellow', percentage: 0.5 },
    { range: '15K-50K', label: '15K-50K', color: 'orange', percentage: 1.75 },
    { range: '50K+', label: '50K+', color: 'red', percentage: 97.45 }
  ];

  const getUserRankRange = (rank) => {
    if (rank <= 1000) return 0;
    if (rank <= 5000) return 1;
    if (rank <= 15000) return 2;
    if (rank <= 50000) return 3;
    return 4;
  };

  const userRangeIndex = getUserRankRange(prediction.expectedRank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-gray-200"
    >
      <div className="flex items-center space-x-2 mb-6">
        <SafeIcon icon={FiBarChart3} className="text-xl text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">Rank Distribution</h3>
      </div>

      <div className="space-y-4">
        {rankRanges.map((range, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center space-x-4 p-3 rounded-lg ${
              index === userRangeIndex ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
            }`}
          >
            <div className="w-16 text-sm font-medium text-gray-700">
              {range.range}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">{range.label}</span>
                <span className="text-sm font-medium text-gray-700">
                  {range.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(range.percentage * 10, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                  className={`bg-${range.color}-500 h-2 rounded-full`}
                />
              </div>
            </div>
            
            {index === userRangeIndex && (
              <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                YOUR RANGE
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          Your expected rank: <strong>{prediction.expectedRank}</strong> falls in the{' '}
          <strong className="text-blue-600">{rankRanges[userRangeIndex].label}</strong> category
        </p>
      </div>
    </motion.div>
  );
};

export default RankChart;