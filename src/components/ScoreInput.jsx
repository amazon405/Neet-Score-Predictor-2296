import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAtom, FiDroplet, FiHeart } = FiIcons;

const ScoreInput = ({ scores, onScoreChange, category, onCategoryChange }) => {
  const subjects = [
    { key: 'physics', label: 'Physics', icon: FiAtom, max: 180, color: 'blue' },
    { key: 'chemistry', label: 'Chemistry', icon: FiDroplet, max: 180, color: 'green' },
    { key: 'biology', label: 'Biology', icon: FiHeart, max: 360, color: 'red' }
  ];

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Subject Scores */}
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <SafeIcon 
              icon={subject.icon} 
              className={`text-${subject.color}-600`} 
            />
            <span>{subject.label} (Max: {subject.max})</span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              value={scores[subject.key]}
              onChange={(e) => onScoreChange(subject.key, e.target.value)}
              min="0"
              max={subject.max}
              placeholder={`Enter ${subject.label.toLowerCase()} score`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Progress Bar */}
            {scores[subject.key] && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${subject.color}-500 h-2 rounded-full transition-all`}
                    style={{ 
                      width: `${Math.min((scores[subject.key] / subject.max) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {scores[subject.key]}/{subject.max} 
                  ({((scores[subject.key] / subject.max) * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Total Score Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Score</span>
          <span className="text-2xl font-bold text-purple-600">
            {scores.total}/720
          </span>
        </div>
        
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
              style={{ width: `${(scores.total / 720) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {((scores.total / 720) * 100).toFixed(1)}% of maximum score
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreInput;