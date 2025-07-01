// College prediction data and utilities

const collegeDatabase = [
  // Top Government Medical Colleges
  {
    name: "All Institute of Medical Sciences (AIIMS), New Delhi",
    location: "Delhi",
    type: "Government",
    cutoffRanks: { General: 50, OBC: 80, SC: 150, ST: 200, EWS: 60 },
    fees: "₹5,856/year",
    seats: 125
  },
  {
    name: "Armed Forces Medical College (AFMC), Pune",
    location: "Maharashtra",
    type: "Government",
    cutoffRanks: { General: 150, OBC: 250, SC: 400, ST: 500, EWS: 180 },
    fees: "₹8,000/year",
    seats: 130
  },
  {
    name: "King George's Medical University, Lucknow",
    location: "Uttar Pradesh",
    type: "Government",
    cutoffRanks: { General: 800, OBC: 1200, SC: 2000, ST: 2500, EWS: 950 },
    fees: "₹50,000/year",
    seats: 250
  },
  {
    name: "Grant Medical College, Mumbai",
    location: "Maharashtra",
    type: "Government",
    cutoffRanks: { General: 1200, OBC: 1800, SC: 3000, ST: 3500, EWS: 1400 },
    fees: "₹45,000/year",
    seats: 260
  },
  {
    name: "Lady Hardinge Medical College, Delhi",
    location: "Delhi",
    type: "Government",
    cutoffRanks: { General: 1500, OBC: 2200, SC: 3500, ST: 4000, EWS: 1700 },
    fees: "₹25,000/year",
    seats: 150
  },
  {
    name: "Bangalore Medical College, Bangalore",
    location: "Karnataka",
    type: "Government",
    cutoffRanks: { General: 2000, OBC: 3000, SC: 5000, ST: 6000, EWS: 2300 },
    fees: "₹40,000/year",
    seats: 250
  },
  {
    name: "Government Medical College, Thiruvananthapuram",
    location: "Kerala",
    type: "Government",
    cutoffRanks: { General: 2500, OBC: 3500, SC: 6000, ST: 7000, EWS: 2800 },
    fees: "₹35,000/year",
    seats: 200
  },
  {
    name: "Madras Medical College, Chennai",
    location: "Tamil Nadu",
    type: "Government",
    cutoffRanks: { General: 3000, OBC: 4500, SC: 7000, ST: 8000, EWS: 3500 },
    fees: "₹30,000/year",
    seats: 250
  },
  {
    name: "Medical College, Kolkata",
    location: "West Bengal",
    type: "Government",
    cutoffRanks: { General: 3500, OBC: 5000, SC: 8000, ST: 9000, EWS: 4000 },
    fees: "₹25,000/year",
    seats: 200
  },
  {
    name: "Government Medical College, Nagpur",
    location: "Maharashtra",
    type: "Government",
    cutoffRanks: { General: 4000, OBC: 6000, SC: 9000, ST: 10000, EWS: 4500 },
    fees: "₹35,000/year",
    seats: 180
  },
  {
    name: "Pt. B.D. Sharma PGIMS, Rohtak",
    location: "Haryana",
    type: "Government",
    cutoffRanks: { General: 4500, OBC: 6500, SC: 10000, ST: 12000, EWS: 5000 },
    fees: "₹40,000/year",
    seats: 150
  },
  {
    name: "Government Medical College, Chandigarh",
    location: "Punjab",
    type: "Government",
    cutoffRanks: { General: 5000, OBC: 7000, SC: 12000, ST: 15000, EWS: 5500 },
    fees: "₹30,000/year",
    seats: 200
  },
  {
    name: "SMS Medical College, Jaipur",
    location: "Rajasthan",
    type: "Government",
    cutoffRanks: { General: 6000, OBC: 8000, SC: 15000, ST: 18000, EWS: 6500 },
    fees: "₹35,000/year",
    seats: 250
  },
  {
    name: "Government Medical College, Kozhikode",
    location: "Kerala",
    type: "Government",
    cutoffRanks: { General: 6500, OBC: 9000, SC: 16000, ST: 20000, EWS: 7000 },
    fees: "₹30,000/year",
    seats: 150
  },
  {
    name: "Stanley Medical College, Chennai",
    location: "Tamil Nadu",
    type: "Government",
    cutoffRanks: { General: 7000, OBC: 10000, SC: 18000, ST: 22000, EWS: 7500 },
    fees: "₹28,000/year",
    seats: 200
  },

  // Private Medical Colleges
  {
    name: "Christian Medical College (CMC), Vellore",
    location: "Tamil Nadu",
    type: "Private",
    cutoffRanks: { General: 500, OBC: 700, SC: 1200, ST: 1500, EWS: 600 },
    fees: "₹6,50,000/year",
    seats: 100
  },
  {
    name: "Kasturba Medical College (KMC), Manipal",
    location: "Karnataka",
    type: "Private",
    cutoffRanks: { General: 8000, OBC: 12000, SC: 18000, ST: 20000, EWS: 9000 },
    fees: "₹24,50,000/year",
    seats: 250
  },
  {
    name: "St. John's Medical College, Bangalore",
    location: "Karnataka",
    type: "Private",
    cutoffRanks: { General: 10000, OBC: 15000, SC: 22000, ST: 25000, EWS: 12000 },
    fees: "₹12,00,000/year",
    seats: 150
  },
  {
    name: "JSS Medical College, Mysore",
    location: "Karnataka",
    type: "Private",
    cutoffRanks: { General: 15000, OBC: 20000, SC: 30000, ST: 35000, EWS: 17000 },
    fees: "₹18,00,000/year",
    seats: 200
  },
  {
    name: "MS Ramaiah Medical College, Bangalore",
    location: "Karnataka",
    type: "Private",
    cutoffRanks: { General: 18000, OBC: 25000, SC: 35000, ST: 40000, EWS: 20000 },
    fees: "₹20,00,000/year",
    seats: 150
  },
  {
    name: "D.Y. Patil Medical College, Pune",
    location: "Maharashtra",
    type: "Private",
    cutoffRanks: { General: 25000, OBC: 35000, SC: 50000, ST: 55000, EWS: 28000 },
    fees: "₹25,00,000/year",
    seats: 150
  },
  {
    name: "Bharati Vidyapeeth Medical College, Pune",
    location: "Maharashtra",
    type: "Private",
    cutoffRanks: { General: 30000, OBC: 40000, SC: 60000, ST: 65000, EWS: 35000 },
    fees: "₹22,00,000/year",
    seats: 120
  },
  {
    name: "SRM Medical College, Chennai",
    location: "Tamil Nadu",
    type: "Private",
    cutoffRanks: { General: 35000, OBC: 45000, SC: 70000, ST: 75000, EWS: 40000 },
    fees: "₹18,50,000/year",
    seats: 150
  },
  {
    name: "Amrita School of Medicine, Kochi",
    location: "Kerala",
    type: "Private",
    cutoffRanks: { General: 12000, OBC: 18000, SC: 25000, ST: 30000, EWS: 14000 },
    fees: "₹16,00,000/year",
    seats: 100
  },
  {
    name: "Kempegowda Institute of Medical Sciences, Bangalore",
    location: "Karnataka",
    type: "Private",
    cutoffRanks: { General: 40000, OBC: 50000, SC: 80000, ST: 85000, EWS: 45000 },
    fees: "₹15,00,000/year",
    seats: 150
  }
];

export const getCollegePredictions = (userRank, category, preferredState) => {
  const predictions = [];

  collegeDatabase.forEach(college => {
    // Skip if state filter is applied and doesn't match
    if (preferredState !== 'All States' && college.location !== preferredState) {
      return;
    }

    const cutoffRank = college.cutoffRanks[category];
    if (!cutoffRank) return;

    // Calculate admission chances based on rank difference
    let admissionChance = 0;
    const rankDifference = userRank - cutoffRank;

    if (userRank <= cutoffRank * 0.7) {
      admissionChance = 95;
    } else if (userRank <= cutoffRank * 0.8) {
      admissionChance = 85;
    } else if (userRank <= cutoffRank * 0.9) {
      admissionChance = 75;
    } else if (userRank <= cutoffRank) {
      admissionChance = 65;
    } else if (userRank <= cutoffRank * 1.1) {
      admissionChance = 50;
    } else if (userRank <= cutoffRank * 1.2) {
      admissionChance = 35;
    } else if (userRank <= cutoffRank * 1.3) {
      admissionChance = 25;
    } else if (userRank <= cutoffRank * 1.5) {
      admissionChance = 15;
    } else if (userRank <= cutoffRank * 2) {
      admissionChance = 5;
    }

    if (admissionChance > 0) {
      predictions.push({
        ...college,
        cutoffRank: cutoffRank,
        admissionChance: admissionChance
      });
    }
  });

  // Sort by admission chances (highest first)
  return predictions.sort((a, b) => b.admissionChance - a.admissionChance);
};

export const getCollegesByRankRange = (minRank, maxRank, category) => {
  return collegeDatabase.filter(college => {
    const cutoffRank = college.cutoffRanks[category];
    return cutoffRank && cutoffRank >= minRank && cutoffRank <= maxRank;
  });
};

export const getTopCollegesByState = (state, category, limit = 10) => {
  return collegeDatabase
    .filter(college => college.location === state)
    .sort((a, b) => (a.cutoffRanks[category] || Infinity) - (b.cutoffRanks[category] || Infinity))
    .slice(0, limit);
};

export const getCollegeRecommendations = (userRank, category, studentState = null) => {
  // Get all predictions
  const allPredictions = getCollegePredictions(userRank, category, 'All States');
  
  // Separate into categories
  const highChance = allPredictions.filter(c => c.admissionChance >= 70);
  const goodChance = allPredictions.filter(c => c.admissionChance >= 40 && c.admissionChance < 70);
  const moderateChance = allPredictions.filter(c => c.admissionChance >= 20 && c.admissionChance < 40);
  
  // Prioritize home state colleges
  const homeStateColleges = studentState ? 
    allPredictions.filter(c => c.location === studentState) : [];
  
  return {
    all: allPredictions,
    highChance,
    goodChance,
    moderateChance,
    homeState: homeStateColleges,
    government: allPredictions.filter(c => c.type === 'Government'),
    private: allPredictions.filter(c => c.type === 'Private')
  };
};