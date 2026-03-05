// All mock data imports removed as files are deleted

export const metricsPage = {
  handler(request, h) {
    // We send an empty object so the frontend script has a valid structure to read,
    // even if it starts with 0 values.
    const initialData = JSON.stringify({ data: {}, kpis: {} })

    return h.view('metrics/kpi-dashboard', {
      pageTitle: 'Overview',
      heading: 'KPI Dashboard',
      initialData,
      activePage: 'overview'
    })
  }
}

export const settingsPage = {
  handler(request, h) {
    return h.view('metrics/settingsPage', {
      pageTitle: 'Settings',
      heading: 'Update KPI Parameters',
      activePage: 'settings'
    })
  }
}

// Simplified handlers for other pages since mock data is gone
export const analyticsPage = {
  handler(request, h) {
    return h.view('metrics/analyticsPage', {
      pageTitle: 'Analytics',
      heading: 'Analytics Dashboard',
      activePage: 'analytics',
      stats: {} // Empty state
    })
  }
}

export const performancePage = {
  handler(request, h) {
    return h.view('metrics/performancePage', {
      pageTitle: 'Performance',
      heading: 'Performance Insights',
      activePage: 'performance',
      stats: {} // Empty state
    })
  }
}

export const userFeedbackPage = {
  handler(request, h) {
    return h.view('metrics/userFeedbackPage', {
      pageTitle: 'User Feedback',
      heading: 'User Feedback',
      activePage: 'user-feedback',
      feedback: [] // Empty state
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
