// Historical cutoff data and trend analysis

const cutoffDatabase = {
  'General': {
    'All India': [
      {
        name: "AIIMS New Delhi",
        location: "New Delhi",
        years: [
          { year: "2022", cutoff: 45, score: 685 },
          { year: "2023", cutoff: 50, score: 680 },
          { year: "2024", cutoff: 55, score: 675 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 60
      },
      {
        name: "AFMC Pune",
        location: "Maharashtra",
        years: [
          { year: "2022", cutoff: 140, score: 650 },
          { year: "2023", cutoff: 150, score: 645 },
          { year: "2024", cutoff: 155, score: 642 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 165
      },
      {
        name: "KGMU Lucknow",
        location: "Uttar Pradesh",
        years: [
          { year: "2022", cutoff: 750, score: 600 },
          { year: "2023", cutoff: 800, score: 595 },
          { year: "2024", cutoff: 820, score: 592 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 850
      },
      {
        name: "Grant Medical College",
        location: "Maharashtra",
        years: [
          { year: "2022", cutoff: 1150, score: 580 },
          { year: "2023", cutoff: 1200, score: 575 },
          { year: "2024", cutoff: 1220, score: 573 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 1250
      },
      {
        name: "Lady Hardinge Medical College",
        location: "Delhi",
        years: [
          { year: "2022", cutoff: 1400, score: 565 },
          { year: "2023", cutoff: 1500, score: 560 },
          { year: "2024", cutoff: 1520, score: 558 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 1580
      }
    ]
  },
  'OBC': {
    'All India': [
      {
        name: "AIIMS New Delhi",
        location: "New Delhi",
        years: [
          { year: "2022", cutoff: 70, score: 665 },
          { year: "2023", cutoff: 80, score: 660 },
          { year: "2024", cutoff: 85, score: 655 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 90
      },
      {
        name: "AFMC Pune",
        location: "Maharashtra",
        years: [
          { year: "2022", cutoff: 230, score: 620 },
          { year: "2023", cutoff: 250, score: 615 },
          { year: "2024", cutoff: 260, score: 612 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 275
      },
      {
        name: "KGMU Lucknow",
        location: "Uttar Pradesh",
        years: [
          { year: "2022", cutoff: 1100, score: 570 },
          { year: "2023", cutoff: 1200, score: 565 },
          { year: "2024", cutoff: 1220, score: 563 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 1280
      }
    ]
  },
  'SC': {
    'All India': [
      {
        name: "AIIMS New Delhi",
        location: "New Delhi",
        years: [
          { year: "2022", cutoff: 135, score: 635 },
          { year: "2023", cutoff: 150, score: 630 },
          { year: "2024", cutoff: 155, score: 628 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 165
      },
      {
        name: "AFMC Pune",
        location: "Maharashtra",
        years: [
          { year: "2022", cutoff: 380, score: 580 },
          { year: "2023", cutoff: 400, score: 575 },
          { year: "2024", cutoff: 410, score: 573 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 430
      }
    ]
  },
  'ST': {
    'All India': [
      {
        name: "AIIMS New Delhi",
        location: "New Delhi",
        years: [
          { year: "2022", cutoff: 180, score: 615 },
          { year: "2023", cutoff: 200, score: 610 },
          { year: "2024", cutoff: 205, score: 608 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 220
      },
      {
        name: "AFMC Pune",
        location: "Maharashtra",
        years: [
          { year: "2022", cutoff: 480, score: 560 },
          { year: "2023", cutoff: 500, score: 555 },
          { year: "2024", cutoff: 510, score: 553 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 530
      }
    ]
  },
  'EWS': {
    'All India': [
      {
        name: "AIIMS New Delhi",
        location: "New Delhi",
        years: [
          { year: "2022", cutoff: 55, score: 675 },
          { year: "2023", cutoff: 60, score: 670 },
          { year: "2024", cutoff: 65, score: 665 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 70
      },
      {
        name: "KGMU Lucknow",
        location: "Uttar Pradesh",
        years: [
          { year: "2022", cutoff: 900, score: 590 },
          { year: "2023", cutoff: 950, score: 585 },
          { year: "2024", cutoff: 970, score: 583 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 1000
      }
    ]
  }
};

// State-specific data
const stateSpecificData = {
  'Delhi': {
    'General': [
      {
        name: "Lady Hardinge Medical College",
        location: "Delhi",
        years: [
          { year: "2022", cutoff: 800, score: 595 },
          { year: "2023", cutoff: 850, score: 590 },
          { year: "2024", cutoff: 870, score: 588 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 900
      },
      {
        name: "Maulana Azad Medical College",
        location: "Delhi",
        years: [
          { year: "2022", cutoff: 1200, score: 575 },
          { year: "2023", cutoff: 1300, score: 570 },
          { year: "2024", cutoff: 1320, score: 568 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 1380
      }
    ]
  },
  'Maharashtra': {
    'General': [
      {
        name: "Grant Medical College",
        location: "Mumbai",
        years: [
          { year: "2022", cutoff: 2500, score: 550 },
          { year: "2023", cutoff: 2800, score: 545 },
          { year: "2024", cutoff: 2900, score: 543 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 3100
      },
      {
        name: "Seth GS Medical College",
        location: "Mumbai",
        years: [
          { year: "2022", cutoff: 3000, score: 540 },
          { year: "2023", cutoff: 3200, score: 535 },
          { year: "2024", cutoff: 3300, score: 533 }
        ],
        trend: "up",
        trendText: "Increasing",
        predicted2024: 3500
      }
    ]
  }
};

export const getCutoffTrends = (category, state) => {
  // Return state-specific data if available
  if (state !== 'All India' && stateSpecificData[state] && stateSpecificData[state][category]) {
    return stateSpecificData[state][category];
  }
  
  // Return All India data
  return cutoffDatabase[category]?.[state] || cutoffDatabase[category]?.['All India'] || [];
};

export const getCutoffByCollege = (collegeName, category) => {
  const allData = cutoffDatabase[category]?.['All India'] || [];
  return allData.find(college => college.name.includes(collegeName));
};

export const getTrendAnalysis = (category, state) => {
  const data = getCutoffTrends(category, state);
  
  const analysis = {
    totalColleges: data.length,
    increasingTrend: data.filter(c => c.trend === 'up').length,
    decreasingTrend: data.filter(c => c.trend === 'down').length,
    stableTrend: data.filter(c => c.trend === 'stable').length,
    averageIncrease: 0
  };
  
  // Calculate average cutoff increase
  const increases = data
    .filter(c => c.trend === 'up')
    .map(c => {
      const latest = c.years[c.years.length - 1];
      const previous = c.years[c.years.length - 2];
      return latest.cutoff - previous.cutoff;
    });
  
  if (increases.length > 0) {
    analysis.averageIncrease = Math.round(increases.reduce((a, b) => a + b, 0) / increases.length);
  }
  
  return analysis;
};