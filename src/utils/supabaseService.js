import { supabase } from '../lib/supabase';

// Student data operations
export const saveStudentPrediction = async (predictionData) => {
  try {
    const { studentInfo, scores, category, expectedRank, minRank, maxRank, percentile } = predictionData;

    const studentData = {
      full_name: studentInfo.fullName,
      email: studentInfo.email,
      phone: studentInfo.phone,
      state: studentInfo.state,
      city: studentInfo.city,
      school_name: studentInfo.schoolName || null,
      current_class: studentInfo.class,
      exam_year: studentInfo.examYear,
      category: category,
      physics_score: parseInt(scores.physics) || 0,
      chemistry_score: parseInt(scores.chemistry) || 0,
      biology_score: parseInt(scores.biology) || 0,
      total_score: scores.total,
      expected_rank: expectedRank,
      min_rank: minRank,
      max_rank: maxRank,
      percentile: percentile,
      created_at: new Date().toISOString()
    };

    console.log('Inserting student data:', studentData);

    const { data, error } = await supabase
      .from('student_predictions')
      .insert([studentData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Student data inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving student prediction:', error);
    throw error;
  }
};

// Email logging
export const logEmailSent = async (emailData) => {
  try {
    const logData = {
      recipient: emailData.to,
      subject: emailData.subject,
      status: emailData.status || 'sent',
      provider: 'simulation',
      message_id: emailData.messageId || null,
      error_message: emailData.error || null,
      sent_at: new Date().toISOString()
    };

    console.log('Logging email:', logData);

    const { data, error } = await supabase
      .from('email_logs')
      .insert([logData]);

    if (error) {
      console.error('Error logging email:', error);
      // Don't throw error for logging failures
    } else {
      console.log('Email logged successfully:', data);
    }

    return data;
  } catch (error) {
    console.error('Error logging email:', error);
    // Don't throw error for logging failures
  }
};

// Analytics queries
export const getStudentAnalytics = async () => {
  try {
    // Get total count
    const { count: totalStudents, error: countError } = await supabase
      .from('student_predictions')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get today's count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await supabase
      .from('student_predictions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) throw todayError;

    // Get category distribution
    const { data: categoryData, error: categoryError } = await supabase
      .from('student_predictions')
      .select('category');

    if (categoryError) throw categoryError;

    const categoryStats = {};
    categoryData?.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });

    return {
      totalStudents: totalStudents || 0,
      todayCount: todayCount || 0,
      categoryDistribution: categoryStats
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Export utilities
export const getFilteredStudents = async (filters) => {
  try {
    let query = supabase.from('student_predictions').select('*');

    if (filters.dateRange && filters.dateRange !== 'all') {
      const date = new Date();
      if (filters.dateRange === 'today') {
        query = query.gte('created_at', date.toISOString().split('T')[0]);
      } else if (filters.dateRange === 'week') {
        date.setDate(date.getDate() - 7);
        query = query.gte('created_at', date.toISOString());
      } else if (filters.dateRange === 'month') {
        date.setDate(date.getDate() - 30);
        query = query.gte('created_at', date.toISOString());
      }
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.state && filters.state !== 'all') {
      query = query.eq('state', filters.state);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching filtered students:', error);
    throw error;
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    const { data, error } = await supabase
      .from('student_predictions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }

    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};