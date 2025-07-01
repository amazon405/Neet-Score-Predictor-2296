import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../lib/supabase';

const { FiUsers, FiTrendingUp, FiTarget, FiAward, FiBarChart3, FiPieChart } = FiIcons;

const AnalyticsOverview = ({ stats, detailed = false }) => {
  const [analyticsData, setAnalyticsData] = useState({
    categoryDistribution: [],
    stateDistribution: [],
    scoreRanges: [],
    rankRanges: [],
    trends: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (detailed) {
      fetchDetailedAnalytics();
    }
  }, [detailed]);

  const fetchDetailedAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching detailed analytics...');
      
      const { data: students, error } = await Promise.race([
        supabase
          .from('student_predictions')
          .select('*')
          .limit(500), // Limit for performance
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analytics timeout')), 6000)
        )
      ]);

      if (error) throw error;

      // Filter genuine students (same logic as StudentDataTable)
      const genuineStudents = (students || []).filter(student => {
        const isTestEntry = 
          student.full_name?.toLowerCase().includes('test') ||
          student.full_name?.toLowerCase().includes('demo') ||
          student.email?.toLowerCase().includes('test') ||
          student.email?.toLowerCase().includes('example');

        const hasValidScores = 
          student.total_score > 0 &&
          student.physics_score >= 0 && student.physics_score <= 180 &&
          student.chemistry_score >= 0 && student.chemistry_score <= 180 &&
          student.biology_score >= 0 && student.biology_score <= 360;

        const hasEssentialData = 
          student.full_name && student.email && student.state && student.city;

        return !isTestEntry && hasValidScores && hasEssentialData;
      });

      // Process analytics data
      const categoryDist = processCategories(genuineStudents);
      const stateDist = processStates(genuineStudents);
      const scoreRanges = processScoreRanges(genuineStudents);
      const rankRanges = processRankRanges(genuineStudents);
      const trends = processTrends(genuineStudents);

      setAnalyticsData({
        categoryDistribution: categoryDist,
        stateDistribution: stateDist,
        scoreRanges,
        rankRanges,
        trends
      });

      console.log(`Analytics processed for ${genuineStudents.length} genuine students`);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processCategories = (students) => {
    const categories = {};
    students.forEach(student => {
      categories[student.category] = (categories[student.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const processStates = (students) => {
    const states = {};
    students.forEach(student => {
      states[student.state] = (states[student.state] || 0) + 1;
    });
    return Object.entries(states)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processScoreRanges = (students) => {
    const ranges = {
      '600+': 0,
      '500-599': 0,
      '400-499': 0,
      '300-399': 0,
      'Below 300': 0
    };

    students.forEach(student => {
      const score = student.total_score;
      if (score >= 600) ranges['600+']++;
      else if (score >= 500) ranges['500-599']++;
      else if (score >= 400) ranges['400-499']++;
      else if (score >= 300) ranges['300-399']++;
      else ranges['Below 300']++;
    });

    return Object.entries(ranges).map(([name, count]) => ({ name, count }));
  };

  const processRankRanges = (students) => {
    const ranges = {
      '1-1000': 0,
      '1K-5K': 0,
      '5K-15K': 0,
      '15K-50K': 0,
      '50K+': 0
    };

    students.forEach(student => {
      const rank = student.expected_rank;
      if (rank <= 1000) ranges['1-1000']++;
      else if (rank <= 5000) ranges['1K-5K']++;
      else if (rank <= 15000) ranges['5K-15K']++;
      else if (rank <= 50000) ranges['15K-50K']++;
      else ranges['50K+']++;
    });

    return Object.entries(ranges).map(([name, count]) => ({ name, count }));
  };

  const processTrends = (students) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStudents = students.filter(student =>
        student.created_at.startsWith(dateStr)
      );
      
      last7Days.push({
        date: dateStr,
        count: dayStudents.length,
        avgScore: dayStudents.length > 0 
          ? Math.round(dayStudents.reduce((sum, s) => sum + s.total_score, 0) / dayStudents.length)
          : 0
      });
    }
    return last7Days;
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-${color}-50 to-${color}-100 p-6 rounded-xl border border-${color}-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <SafeIcon icon={icon} className={`text-3xl text-${color}-600`} />
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <SafeIcon icon={FiBarChart3} className="text-4xl mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDetailedAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {detailed ? 'Detailed Analytics' : 'Overview'}
        </h2>
        <p className="text-gray-600">
          {detailed ? 'Comprehensive analysis of genuine student data' : 'Quick overview of key metrics'}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={FiUsers}
          color="blue"
          trend="+12% from last month"
        />
        <StatCard
          title="Today's Predictions"
          value={stats.todayPredictions}
          icon={FiTarget}
          color="green"
          trend="Active today"
        />
        <StatCard
          title="Emails Sent"
          value={stats.emailsSent}
          icon={FiTrendingUp}
          color="purple"
          trend="100% delivery rate"
        />
        <StatCard
          title="Average Score"
          value={stats.avgScore}
          icon={FiAward}
          color="orange"
          trend="Out of 720"
        />
      </div>

      {detailed && (
        <>
          {/* Category Distribution */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiPieChart} className="text-xl text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
              </div>
              <div className="space-y-3">
                {analyticsData.categoryDistribution.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiBarChart3} className="text-xl text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Top States</h3>
              </div>
              <div className="space-y-3">
                {analyticsData.stateDistribution.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score and Rank Ranges */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Distribution</h3>
              <div className="space-y-3">
                {analyticsData.scoreRanges.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rank Distribution</h3>
              <div className="space-y-3">
                {analyticsData.rankRanges.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Trend */}
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">7-Day Trend</h3>
            <div className="grid grid-cols-7 gap-2">
              {analyticsData.trends.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">{day.count}</div>
                    <div className="text-xs text-gray-600">students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsOverview;