// data/mock-analytics.js

export const queryAnalytics = () => {
  return {
    summary: {
      pageViews: '18,750',
      uniqueVisitors: '3,420',
      bounceRate: '28%'
    },
    // This represents the daily breakdown of the 18,750 total page views
    trafficData: [
      { day: 'Mon', views: 2100 },
      { day: 'Tue', views: 2800 },
      { day: 'Wed', views: 3200 },
      { day: 'Thu', views: 2700 },
      { day: 'Fri', views: 3900 },
      { day: 'Sat', views: 1800 },
      { day: 'Sun', views: 2250 }
    ]
  }
}
