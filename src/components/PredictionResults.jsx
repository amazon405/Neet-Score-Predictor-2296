import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import RankChart from './RankChart';
import CollegeRecommendations from './CollegeRecommendations';

const { FiTrendingUp, FiTarget, FiAward, FiPercent, FiUsers, FiCheckCircle, FiBook } = FiIcons;

const PredictionResults = ({ prediction }) => {
  const [activeSection, setActiveSection] = useState('prediction');

  const getAdmissionChances = (rank) => {
    if (rank <= 1000) return { text: 'Excellent', color: 'green', percentage: 95 };
    if (rank <= 5000) return { text: 'Very Good', color: 'blue', percentage: 85 };
    if (rank <= 15000) return { text: 'Good', color: 'yellow', percentage: 70 };
    if (rank <= 50000) return { text: 'Moderate', color: 'orange', percentage: 50 };
    return { text: 'Low', color: 'red', percentage: 25 };
  };

  const chances = getAdmissionChances(prediction.expectedRank);

  const resultCards = [
    {
      title: 'Expected Rank',
      value: `${prediction.minRank} - ${prediction.maxRank}`,
      subtitle: `Best Case: ${prediction.expectedRank}`,
      icon: FiTarget,
      color: 'blue'
    },
    {
      title: 'Percentile',
      value: `${prediction.percentile}%`,
      subtitle: 'National Ranking',
      icon: FiPercent,
      color: 'green'
    },
    {
      title: 'Total Score',
      value: `${prediction.scores.total}/720`,
      subtitle: `${((prediction.scores.total / 720) * 100).toFixed(1)}%`,
      icon: FiTrendingUp,
      color: 'purple'
    },
    {
      title: 'Category',
      value: prediction.category,
      subtitle: 'Reservation Status',
      icon: FiUsers,
      color: 'indigo'
    }
  ];

  const sections = [
    { id: 'prediction', label: 'Prediction Results', icon: FiTarget },
    { id: 'colleges', label: 'College Recommendations', icon: FiBook }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Your Prediction Results</h2>
        
        {/* Section Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SafeIcon icon={section.icon} className="text-sm" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Results Section */}
      {activeSection === 'prediction' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-4">
            {resultCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-r from-${card.color}-50 to-${card.color}-100 p-4 rounded-xl border border-${card.color}-200`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={card.icon} className={`text-${card.color}-600`} />
                  <span className="text-sm font-medium text-gray-700">{card.title}</span>
                </div>
                <div className={`text-xl font-bold text-${card.color}-700`}>{card.value}</div>
                <div className="text-xs text-gray-600">{card.subtitle}</div>
              </motion.div>
            ))}
          </div>

          {/* Admission Chances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r from-${chances.color}-50 to-${chances.color}-100 p-6 rounded-xl border border-${chances.color}-200`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiAward} className={`text-2xl text-${chances.color}-600`} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">Admission Chances</h3>
                <p className="text-sm text-gray-600">Government Medical Colleges</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-2xl font-bold text-${chances.color}-700`}>
                {chances.text}
              </span>
              <span className={`text-xl font-semibold text-${chances.color}-600`}>
                {chances.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`bg-${chances.color}-500 h-3 rounded-full transition-all`}
                style={{ width: `${chances.percentage}%` }}
              />
            </div>
          </motion.div>

          {/* Rank Visualization */}
          <RankChart prediction={prediction} />

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 p-6 rounded-xl border border-blue-200"
          >
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiCheckCircle} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Recommendations</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {prediction.expectedRank <= 15000 && (
                <li>• Consider top government medical colleges</li>
              )}
              {prediction.expectedRank > 15000 && prediction.expectedRank <= 50000 && (
                <li>• Look into state quota seats and deemed universities</li>
              )}
              {prediction.expectedRank > 50000 && (
                <li>• Explore private medical colleges and management quota</li>
              )}
              <li>• Apply for state counseling in addition to All India Quota</li>
              <li>• Keep backup options ready including other entrance exams</li>
            </ul>
          </motion.div>

          {/* Call to Action for Colleges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
          >
            <div className="text-center">
              <SafeIcon icon={FiBook} className="text-4xl text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Ready to Find Your Perfect College?
              </h3>
              <p className="text-gray-600 mb-4">
                Based on your predicted rank of <strong>{prediction.expectedRank}</strong>, 
                we've found colleges that match your profile.
              </p>
              <button
                onClick={() => setActiveSection('colleges')}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View College Recommendations →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* College Recommendations Section */}
      {activeSection === 'colleges' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CollegeRecommendations 
            userRank={prediction.expectedRank}
            category={prediction.category}
            studentInfo={prediction.studentInfo}
          />
        </motion.div>
      )}
    </div>
  );
};

export default PredictionResults;