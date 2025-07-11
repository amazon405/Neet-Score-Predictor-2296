import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ScoreInput from './ScoreInput';
import PredictionResults from './PredictionResults';
import StudentInfoModal from './StudentInfoModal';
import { calculateRank, calculatePercentile } from '../utils/rankCalculations';
import { sendPredictionEmail } from '../utils/emailService';
import { saveStudentPrediction, logEmailSent } from '../utils/supabaseService';

const { FiTarget, FiTrendingUp, FiBook, FiAward } = FiIcons;

const RankPredictor = () => {
  const [scores, setScores] = useState({
    physics: '',
    chemistry: '',
    biology: '',
    total: 0
  });
  const [prediction, setPrediction] = useState(null);
  const [category, setCategory] = useState('General');
  const [showModal, setShowModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  const handleScoreChange = (subject, value) => {
    const newScores = { ...scores, [subject]: value };
    const total = parseInt(newScores.physics || 0) + parseInt(newScores.chemistry || 0) + parseInt(newScores.biology || 0);
    newScores.total = total;
    setScores(newScores);
  };

  const handlePredict = () => {
    if (scores.total === 0) return;
    // Show modal to collect student information
    setShowModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      console.log('Starting form submission...', formData);
      
      // Calculate prediction
      const rankData = calculateRank(formData.scores.total, formData.category);
      const percentile = calculatePercentile(formData.scores.total);
      const predictionData = {
        ...rankData,
        percentile,
        scores: formData.scores,
        category: formData.category,
        studentInfo: formData.studentInfo
      };
      console.log('Prediction data calculated:', predictionData);
      
      // Save to database first
      console.log('Saving student data to database...');
      const savedStudent = await saveStudentPrediction(predictionData);
      console.log('Student data saved successfully:', savedStudent);
      
      // Set prediction to show results
      setPrediction(predictionData);
      setStudentInfo(formData.studentInfo);
      
      // Send email with prediction report
      try {
        console.log('Sending prediction email...');
        const emailResult = await sendPredictionEmail(predictionData);
        console.log('Email sent successfully:', emailResult);
        
        // Log email success
        await logEmailSent({
          to: formData.studentInfo.email,
          subject: `🎯 Your NEET Rank Prediction Report - ${formData.studentInfo.fullName}`,
          messageId: emailResult.messageId || null
        });
        
        alert('✅ Success! Your prediction has been calculated and the detailed report has been sent to your email address.');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Log email failure
        await logEmailSent({
          to: formData.studentInfo.email,
          subject: `🎯 Your NEET Rank Prediction Report - ${formData.studentInfo.fullName}`,
          status: 'failed',
          error: emailError.message
        });
        
        alert('✅ Prediction calculated successfully! However, there was an issue sending the email. Please check your email address or try again later.');
      }
    } catch (error) {
      console.error('Failed to process prediction:', error);
      alert('❌ Error processing your prediction. Please try again. If the issue persists, please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Total Applicants', value: '18+ Lakh', icon: FiTarget },
    { label: 'Medical Seats', value: '1.08 Lakh', icon: FiAward },
    { label: 'Success Rate', value: '6%', icon: FiTrendingUp },
    { label: 'Qualifying Marks', value: '50th Percentile', icon: FiBook }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-white rounded-2xl p-8 shadow-lg"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          NEET Rank Predictor {currentYear}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Predict your NEET rank and explore medical college admission possibilities
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl"
            >
              <SafeIcon icon={stat.icon} className="text-2xl text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your Scores</h2>
          <ScoreInput 
            scores={scores} 
            onScoreChange={handleScoreChange} 
            category={category}
            onCategoryChange={setCategory}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePredict}
            disabled={scores.total === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Predict My Rank'
            )}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          {prediction ? (
            <PredictionResults prediction={prediction} />
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiTarget} className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter your scores to see rank prediction</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Student Info Modal */}
      <StudentInfoModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        scores={scores}
        category={category}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default RankPredictor;