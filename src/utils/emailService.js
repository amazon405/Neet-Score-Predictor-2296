// Email service for sending prediction reports

export const sendPredictionEmail = async (predictionData) => {
  const { studentInfo, scores, category, expectedRank, minRank, maxRank, percentile } = predictionData;

  // Create email template
  const emailTemplate = createEmailTemplate(predictionData);

  // In a real application, you would send this to your backend API
  // For demo purposes, we'll simulate the email sending
  try {
    // Simulate API call to send email
    const response = await simulateEmailSend({
      to: studentInfo.email,
      subject: `🎯 Your NEET Rank Prediction Report - ${studentInfo.fullName}`,
      html: emailTemplate,
      studentInfo,
      predictionData
    });

    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const createEmailTemplate = (predictionData) => {
  const { studentInfo, scores, category, expectedRank, minRank, maxRank, percentile } = predictionData;

  const getAdmissionChances = (rank) => {
    if (rank <= 1000) return { text: 'Excellent', color: '#22c55e', percentage: 95 };
    if (rank <= 5000) return { text: 'Very Good', color: '#3b82f6', percentage: 85 };
    if (rank <= 15000) return { text: 'Good', color: '#eab308', percentage: 70 };
    if (rank <= 50000) return { text: 'Moderate', color: '#f97316', percentage: 50 };
    return { text: 'Low', color: '#ef4444', percentage: 25 };
  };

  const chances = getAdmissionChances(expectedRank);
  const currentDate = new Date().toLocaleDateString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NEET Rank Prediction Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .student-info {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
        }
        .student-info h3 {
          margin-top: 0;
          color: #1e40af;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: 600;
          color: #64748b;
        }
        .prediction-card {
          background: linear-gradient(135deg, #dbeafe, #e0e7ff);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
          border-left: 5px solid #3b82f6;
        }
        .prediction-card h3 {
          margin-top: 0;
          color: #1e40af;
          font-size: 20px;
        }
        .score-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .score-item {
          background: white;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .score-value {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        .score-label {
          font-size: 14px;
          color: #64748b;
        }
        .rank-section {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .rank-highlight {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .rank-number {
          font-size: 36px;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 5px;
        }
        .admission-chances {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          border-left: 5px solid #22c55e;
        }
        .chance-percentage {
          font-size: 28px;
          font-weight: bold;
          color: ${chances.color};
          text-align: center;
          margin-bottom: 10px;
        }
        .recommendations {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
        }
        .recommendations ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .recommendations li {
          margin-bottom: 8px;
          color: #475569;
        }
        .footer {
          background: #1e293b;
          color: white;
          padding: 25px;
          text-align: center;
        }
        .footer p {
          margin: 5px 0;
        }
        .disclaimer {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 15px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .score-grid {
            grid-template-columns: 1fr 1fr;
          }
          .rank-number {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🎯 NEET Rank Prediction Report</h1>
          <p>Personalized Analysis for ${studentInfo.fullName}</p>
        </div>

        <div class="content">
          <!-- Student Information -->
          <div class="student-info">
            <h3>Student Information</h3>
            <div class="info-row">
              <span class="info-label">Full Name:</span>
              <span>${studentInfo.fullName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${studentInfo.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span>${studentInfo.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Location:</span>
              <span>${studentInfo.city}, ${studentInfo.state}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span>${category}</span>
            </div>
            <div class="info-row">
              <span class="info-label">NEET Year:</span>
              <span>${studentInfo.examYear}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Report Date:</span>
              <span>${currentDate}</span>
            </div>
          </div>

          <!-- Score Analysis -->
          <div class="prediction-card">
            <h3>📊 Your Score Analysis</h3>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-value">${scores.physics}</div>
                <div class="score-label">Physics (180)</div>
              </div>
              <div class="score-item">
                <div class="score-value">${scores.chemistry}</div>
                <div class="score-label">Chemistry (180)</div>
              </div>
              <div class="score-item">
                <div class="score-value">${scores.biology}</div>
                <div class="score-label">Biology (360)</div>
              </div>
              <div class="score-item">
                <div class="score-value">${scores.total}</div>
                <div class="score-label">Total (720)</div>
              </div>
            </div>
            <div style="text-align: center; padding: 15px; background: rgba(59,130,246,0.1); border-radius: 8px;">
              <strong>Overall Percentage: ${((scores.total / 720) * 100).toFixed(1)}%</strong> |
              <strong>Percentile: ${percentile}%</strong>
            </div>
          </div>

          <!-- Rank Prediction -->
          <div class="rank-section">
            <h3 style="color: #1e40af; margin-bottom: 20px;">🏆 Rank Prediction</h3>
            <div class="rank-highlight">
              <div class="rank-number">${expectedRank}</div>
              <div style="font-weight: 600; color: #92400e;">Expected Rank</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
              <div style="padding: 15px; background: #f0fdf4; border-radius: 8px;">
                <div style="font-size: 20px; font-weight: bold; color: #22c55e;">${minRank}</div>
                <div style="font-size: 14px; color: #16a34a;">Best Case</div>
              </div>
              <div style="padding: 15px; background: #fef2f2; border-radius: 8px;">
                <div style="font-size: 20px; font-weight: bold; color: #ef4444;">${maxRank}</div>
                <div style="font-size: 14px; color: #dc2626;">Worst Case</div>
              </div>
            </div>
          </div>

          <!-- Admission Chances -->
          <div class="admission-chances">
            <h3 style="color: #166534; margin-bottom: 15px;">🎓 Government Medical College Admission Chances</h3>
            <div class="chance-percentage">${chances.percentage}% - ${chances.text}</div>
            <div style="text-align: center; color: #059669;">
              Based on your predicted rank and historical cutoff data
            </div>
          </div>

          <!-- Recommendations -->
          <div class="recommendations">
            <h3 style="color: #1e40af; margin-bottom: 15px;">💡 Personalized Recommendations</h3>
            <ul>
              ${expectedRank <= 15000 ? 
                '<li><strong>Excellent Position!</strong> You have high chances for top government medical colleges</li><li>Apply for AIIMS, JIPMER, and state government colleges</li>' : 
                expectedRank <= 50000 ? 
                '<li>Focus on state quota counseling for better opportunities</li><li>Consider deemed universities and private colleges as backup</li>' : 
                '<li>Explore private medical colleges and management quota seats</li><li>Consider improving scores for next attempt if possible</li>'
              }
              <li>Apply for both All India Quota and State Quota counseling</li>
              <li>Keep multiple state preferences to maximize admission chances</li>
              <li>Prepare required documents for counseling process in advance</li>
              <li>Stay updated with official counseling schedules and notifications</li>
            </ul>
          </div>

          <!-- Next Steps -->
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">📋 Next Steps</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px; color: #475569;">Visit our College Predictor to find suitable colleges</li>
              <li style="margin-bottom: 8px; color: #475569;">Analyze cutoff trends for your target colleges</li>
              <li style="margin-bottom: 8px; color: #475569;">Register for NEET counseling when it opens</li>
              <li style="margin-bottom: 8px; color: #475569;">Keep all required documents ready</li>
              <li style="margin-bottom: 8px; color: #475569;">Stay connected with us for updates and guidance</li>
            </ol>
          </div>

          <div class="disclaimer">
            <strong>Disclaimer:</strong> This prediction is based on historical data and statistical analysis. 
            Actual results may vary depending on various factors including exam difficulty, number of applicants, 
            and seat matrix changes. Use this as a guidance tool for your preparation and college selection strategy.
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>NEET Predictor</strong> - Your Medical Career Guidance Partner</p>
          <p>📧 info@neetpredictor.com | 📱 +91 98765 43210</p>
          <p>Made with ❤️ for NEET Aspirants</p>
          <p style="font-size: 12px; opacity: 0.8; margin-top: 15px;">
            © 2024 NEET Predictor. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Simulate email sending (replace with actual email service)
const simulateEmailSend = async (emailData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        console.log('Email sent successfully to:', emailData.to);
        console.log('Email subject:', emailData.subject);
        resolve({
          success: true,
          messageId: `msg_${Date.now()}`,
          recipient: emailData.to
        });
      } else {
        reject(new Error('Email service temporarily unavailable'));
      }
    }, 2000); // Simulate 2-second delay
  });
};

// In a real application, you would integrate with services like:
// - SendGrid
// - AWS SES  
// - Mailgun
// - Nodemailer with SMTP

// Example with SendGrid:
/*
import sgMail from '@sendgrid/mail';

export const sendPredictionEmail = async (predictionData) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: predictionData.studentInfo.email,
    from: 'noreply@neetpredictor.com',
    subject: `🎯 Your NEET Rank Prediction Report - ${predictionData.studentInfo.fullName}`,
    html: createEmailTemplate(predictionData),
  };
  
  return await sgMail.send(msg);
};
*/