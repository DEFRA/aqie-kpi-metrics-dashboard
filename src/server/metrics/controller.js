import { queryMetrics, getKPIs } from '../../data/mock-metrics.js'
import { queryAnalytics } from '../../data/mock-analytics.js'
import performanceData from '../../data/mock-performance.js'
import feedbackData from '../../data/mock-feedback.js'

// Helper for Overview/Metrics data
function buildContext(request) {
  const params = {
    start: request.query.start,
    end: request.query.end,
    limit: request.query.limit
  }
  const data = queryMetrics(params)
  const kpis = getKPIs(data)
  return { data, kpis, initialData: JSON.stringify({ data, kpis }) }
}

export const metricsPage = {
  handler(request, h) {
    const { data, kpis, initialData } = buildContext(request)
    return h.view('metrics/kpi-dashboard', {
      pageTitle: 'Overview',
      heading: 'KPI Dashboard',
      data,
      kpis,
      initialData,
      activePage: 'overview'
    })
  }
}

export const analyticsPage = {
  handler(request, h) {
    const analyticsData = queryAnalytics()

    return h.view('metrics/analyticsPage', {
      pageTitle: 'Analytics',
      heading: 'Analytics Dashboard',
      activePage: 'analytics',
      stats: analyticsData.summary
    })
  }
}

export const performancePage = {
  handler(request, h) {
    return h.view('metrics/performancePage', {
      pageTitle: 'Performance',
      heading: 'Performance Insights',
      activePage: 'performance',
      stats: performanceData.stats
    })
  }
}

export const userFeedbackPage = {
  handler(request, h) {
    return h.view('metrics/userFeedbackPage', {
      pageTitle: 'User Feedback',
      heading: 'User Feedback',
      activePage: 'user-feedback',
      feedback: feedbackData.comments
    })
  }
}

export const reportsPage = {
  handler(request, h) {
    return h.view('metrics/reportsPage', {
      pageTitle: 'Reports',
      heading: 'Reports',
      activePage: 'reports'
    })
  }
}

export const settingsPage = {
  handler(request, h) {
    return h.view('metrics/settings', {
      pageTitle: 'Settings',
      heading: 'Account Settings',
      activePage: 'settings'
    })
  }
}
