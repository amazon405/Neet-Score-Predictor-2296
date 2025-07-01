// NEET rank calculation utilities based on historical data and trends

export const calculateRank = (totalScore, category) => {
  // Base rank calculation using score-to-rank conversion
  const baseRank = calculateBaseRank(totalScore);
  
  // Apply category-based adjustments
  const categoryMultiplier = getCategoryMultiplier(category);
  
  const expectedRank = Math.round(baseRank * categoryMultiplier);
  const minRank = Math.round(expectedRank * 0.8); // Best case scenario
  const maxRank = Math.round(expectedRank * 1.2); // Worst case scenario
  
  return {
    expectedRank,
    minRank,
    maxRank
  };
};

const calculateBaseRank = (score) => {
  // Approximate rank calculation based on NEET scoring pattern
  // This is based on historical data analysis
  
  if (score >= 650) return Math.round(500 + (720 - score) * 10);
  if (score >= 600) return Math.round(1000 + (650 - score) * 50);
  if (score >= 550) return Math.round(5000 + (600 - score) * 100);
  if (score >= 500) return Math.round(15000 + (550 - score) * 200);
  if (score >= 450) return Math.round(50000 + (500 - score) * 400);
  if (score >= 400) return Math.round(100000 + (450 - score) * 800);
  if (score >= 350) return Math.round(200000 + (400 - score) * 1000);
  if (score >= 300) return Math.round(400000 + (350 - score) * 1500);
  
  return Math.round(600000 + (300 - score) * 2000);
};

const getCategoryMultiplier = (category) => {
  const multipliers = {
    'General': 1.0,
    'EWS': 0.95,
    'OBC': 0.85,
    'SC': 0.7,
    'ST': 0.65
  };
  
  return multipliers[category] || 1.0;
};

export const calculatePercentile = (totalScore) => {
  // Percentile calculation based on score distribution
  const maxScore = 720;
  const basePercentile = (totalScore / maxScore) * 100;
  
  // Adjust for actual NEET percentile distribution
  if (basePercentile >= 90) return Math.min(99.9, 85 + (basePercentile - 90) * 1.5);
  if (basePercentile >= 80) return Math.min(95, 70 + (basePercentile - 80) * 1.5);
  if (basePercentile >= 70) return Math.min(85, 55 + (basePercentile - 70) * 1.5);
  if (basePercentile >= 60) return Math.min(75, 40 + (basePercentile - 60) * 1.5);
  if (basePercentile >= 50) return Math.min(65, 25 + (basePercentile - 50) * 1.5);
  
  return Math.max(1, basePercentile * 0.5);
};

export const getScoreFromRank = (rank, category) => {
  // Reverse calculation to estimate score from rank
  const categoryMultiplier = getCategoryMultiplier(category);
  const adjustedRank = rank / categoryMultiplier;
  
  if (adjustedRank <= 1000) return Math.round(650 + (1000 - adjustedRank) / 10);
  if (adjustedRank <= 5000) return Math.round(600 + (5000 - adjustedRank) / 50);
  if (adjustedRank <= 15000) return Math.round(550 + (15000 - adjustedRank) / 100);
  if (adjustedRank <= 50000) return Math.round(500 + (50000 - adjustedRank) / 200);
  if (adjustedRank <= 100000) return Math.round(450 + (100000 - adjustedRank) / 400);
  
  return Math.max(300, 400 - (adjustedRank - 100000) / 1000);
};