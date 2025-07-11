import { supabase } from '../lib/supabase';

// Function to get all colleges from the database
export const fetchCollegesFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching colleges from database:', error);
    throw error;
  }
};

// Function to get colleges for predictor (transform data to match the expected format)
export const getCollegesForPredictor = async () => {
  try {
    const colleges = await fetchCollegesFromDatabase();
    
    // Transform database format to predictor format
    return colleges.map(college => ({
      name: college.name,
      location: college.location,
      type: college.type,
      quota: college.quota || 'All India Quota', // Include quota field
      cutoffRanks: college.cutoff_ranks,
      fees: college.fees,
      seats: college.seats
    }));
  } catch (error) {
    console.error('Error getting colleges for predictor:', error);
    // Return empty array on error
    return [];
  }
};

// Function to upload colleges from CSV
export const uploadCollegesFromCSV = async (collegesData) => {
  try {
    // First delete all existing colleges
    const { error: deleteError } = await supabase
      .from('colleges')
      .delete()
      .neq('id', 0); // This will delete all records
    
    if (deleteError) throw deleteError;
    
    // Insert new colleges
    const { data, error } = await supabase
      .from('colleges')
      .insert(collegesData)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error uploading colleges:', error);
    return { success: false, error: error.message };
  }
};

// Function to add a single college
export const addCollege = async (collegeData) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .insert([collegeData])
      .select();
    
    if (error) throw error;
    
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error adding college:', error);
    return { success: false, error: error.message };
  }
};

// Function to update a college
export const updateCollege = async (id, collegeData) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .update(collegeData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating college:', error);
    return { success: false, error: error.message };
  }
};

// Function to delete a college
export const deleteCollege = async (id) => {
  try {
    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting college:', error);
    return { success: false, error: error.message };
  }
};

// Function to get colleges by type
export const getCollegesByType = async (type) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('type', type)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${type} colleges:`, error);
    return [];
  }
};

// Function to get colleges by location
export const getCollegesByLocation = async (location) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('location', location)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching colleges in ${location}:`, error);
    return [];
  }
};

// Function to get colleges by quota
export const getCollegesByQuota = async (quota) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('quota', quota)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching colleges with ${quota}:`, error);
    return [];
  }
};

// Function to get college statistics
export const getCollegeStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('type, quota, location');
    
    if (error) throw error;
    
    const colleges = data || [];
    const stats = {
      total: colleges.length,
      government: colleges.filter(c => c.type === 'Government').length,
      private: colleges.filter(c => c.type === 'Private').length,
      deemed: colleges.filter(c => c.type === 'Deemed University').length,
      allIndiaQuota: colleges.filter(c => c.quota === 'All India Quota').length,
      stateQuota: colleges.filter(c => c.quota === 'State Quota').length,
      managementQuota: colleges.filter(c => c.quota === 'Management Quota').length,
      nriQuota: colleges.filter(c => c.quota === 'NRI Quota').length,
      locations: {} // Count by location
    };
    
    // Count colleges by location
    colleges.forEach(college => {
      if (!stats.locations[college.location]) {
        stats.locations[college.location] = 0;
      }
      stats.locations[college.location]++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting college statistics:', error);
    return {
      total: 0,
      government: 0,
      private: 0,
      deemed: 0,
      allIndiaQuota: 0,
      stateQuota: 0,
      managementQuota: 0,
      nriQuota: 0,
      locations: {}
    };
  }
};