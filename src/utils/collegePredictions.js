import { supabase } from '../lib/supabase';
import { getCollegesForPredictor } from './collegeDataService';

// Fallback database in case Supabase connection fails
const fallbackCollegeDatabase = [
  // Top Government Medical Colleges
  {
    name: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    location: "Delhi",
    type: "Government",
    quota: "All India Quota",
    cutoffRanks: { General: 50, OBC: 80, SC: 150, ST: 200, EWS: 60 },
    fees: "₹5,856/year",
    seats: 125
  },
  {
    name: "Government Medical College, Mumbai",
    location: "Maharashtra", 
    type: "Government",
    quota: "State Quota",
    cutoffRanks: { General: 2500, OBC: 3500, SC: 5000, ST: 6000, EWS: 2800 },
    fees: "₹50,000/year",
    seats: 150
  },
  {
    name: "Kasturba Medical College (KMC), Manipal",
    location: "Karnataka",
    type: "Private",
    quota: "All India Quota",
    cutoffRanks: { General: 8000, OBC: 12000, SC: 18000, ST: 20000, EWS: 9000 },
    fees: "₹24,50,000/year",
    seats: 250
  },
  // ... more colleges from your previous implementation
  // This is just a fallback - we'll try to fetch from Supabase first
];

// Get colleges from database or use fallback if needed
const getCollegeDatabase = async () => {
  try {
    console.log('Fetching colleges from database...');
    const databaseColleges = await getCollegesForPredictor();
    
    if (databaseColleges && databaseColleges.length > 0) {
      console.log(`Successfully fetched ${databaseColleges.length} colleges from database`);
      return databaseColleges;
    } else {
      console.log('No colleges found in database, using fallback data');
      return fallbackCollegeDatabase;
    }
  } catch (error) {
    console.error('Error fetching colleges from database:', error);
    console.log('Using fallback college data');
    return fallbackCollegeDatabase;
  }
};

export const getCollegePredictions = async (userRank, category, preferredState, quotaPreference = 'All') => {
  const predictions = [];
  
  try {
    const collegeDatabase = await getCollegeDatabase();
    
    collegeDatabase.forEach(college => {
      // Skip if state filter is applied and doesn't match
      if (preferredState !== 'All States' && college.location !== preferredState) {
        return;
      }
      
      // Skip if quota filter is applied and doesn't match
      if (quotaPreference !== 'All' && college.quota !== quotaPreference) {
        return;
      }
      
      const cutoffRank = college.cutoffRanks[category];
      if (!cutoffRank) return;
      
      // Calculate admission chances based on rank difference
      let admissionChance = 0;
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
  } catch (error) {
    console.error('Error in getCollegePredictions:', error);
    return [];
  }
};

export const getCollegesByRankRange = async (minRank, maxRank, category) => {
  try {
    const collegeDatabase = await getCollegeDatabase();
    return collegeDatabase.filter(college => {
      const cutoffRank = college.cutoffRanks[category];
      return cutoffRank && cutoffRank >= minRank && cutoffRank <= maxRank;
    });
  } catch (error) {
    console.error('Error in getCollegesByRankRange:', error);
    return [];
  }
};

export const getTopCollegesByState = async (state, category, limit = 10) => {
  try {
    const collegeDatabase = await getCollegeDatabase();
    return collegeDatabase
      .filter(college => college.location === state)
      .sort((a, b) => (a.cutoffRanks[category] || Infinity) - (b.cutoffRanks[category] || Infinity))
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getTopCollegesByState:', error);
    return [];
  }
};

export const getCollegesByQuota = async (quota, category, userRank) => {
  try {
    const collegeDatabase = await getCollegeDatabase();
    return collegeDatabase
      .filter(college => college.quota === quota)
      .map(college => {
        const cutoffRank = college.cutoffRanks[category];
        let admissionChance = 0;
        
        if (cutoffRank && userRank) {
          if (userRank <= cutoffRank * 0.8) {
            admissionChance = 90;
          } else if (userRank <= cutoffRank) {
            admissionChance = 70;
          } else if (userRank <= cutoffRank * 1.2) {
            admissionChance = 40;
          } else if (userRank <= cutoffRank * 1.5) {
            admissionChance = 20;
          }
        }
        
        return {
          ...college,
          cutoffRank,
          admissionChance
        };
      })
      .filter(college => college.admissionChance > 0)
      .sort((a, b) => b.admissionChance - a.admissionChance);
  } catch (error) {
    console.error('Error in getCollegesByQuota:', error);
    return [];
  }
};

export const getCollegeRecommendations = async (userRank, category, studentState = null, quotaPreference = 'All') => {
  try {
    // Get all predictions
    const allPredictions = await getCollegePredictions(userRank, category, 'All States', quotaPreference);
    
    // Separate into categories
    const highChance = allPredictions.filter(c => c.admissionChance >= 70);
    const goodChance = allPredictions.filter(c => c.admissionChance >= 40 && c.admissionChance < 70);
    const moderateChance = allPredictions.filter(c => c.admissionChance >= 20 && c.admissionChance < 40);
    
    // Prioritize home state colleges
    const homeStateColleges = studentState ? 
      allPredictions.filter(c => c.location === studentState) : [];
    
    // Separate by quota type
    const allIndiaQuota = allPredictions.filter(c => c.quota === 'All India Quota');
    const stateQuota = allPredictions.filter(c => c.quota === 'State Quota');
    const managementQuota = allPredictions.filter(c => c.quota === 'Management Quota');
    
    return {
      all: allPredictions,
      highChance,
      goodChance,
      moderateChance,
      homeState: homeStateColleges,
      government: allPredictions.filter(c => c.type === 'Government'),
      private: allPredictions.filter(c => c.type === 'Private'),
      deemed: allPredictions.filter(c => c.type === 'Deemed University'),
      allIndiaQuota,
      stateQuota,
      managementQuota
    };
  } catch (error) {
    console.error('Error in getCollegeRecommendations:', error);
    return {
      all: [],
      highChance: [],
      goodChance: [],
      moderateChance: [],
      homeState: [],
      government: [],
      private: [],
      deemed: [],
      allIndiaQuota: [],
      stateQuota: [],
      managementQuota: []
    };
  }
};