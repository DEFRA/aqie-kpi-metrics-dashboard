import {
  metricsPage,
  analyticsPage,
  performancePage,
  userFeedbackPage,
  reportsPage,
  settingsPage
} from './controller.js'

export const metrics = {
  plugin: {
    name: 'metrics-ui',
    register(server) {
      server.route([
        { method: 'GET', path: '/kpi-dashboard', ...metricsPage },
        { method: 'GET', path: '/analytics', ...analyticsPage },
        { method: 'GET', path: '/performance', ...performancePage },
        { method: 'GET', path: '/user-feedback', ...userFeedbackPage },
        { method: 'GET', path: '/reports', ...reportsPage },
        { method: 'GET', path: '/settings', ...settingsPage }
      ])
    }
  }
}
