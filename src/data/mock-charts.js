/**
 * Mock data for the KPI Dashboard charts
 */
const dashboardData = {
  // 1. User Satisfaction (Bar)
  satisfaction: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [88, 85, 82, 80, 78, 75] // Showing the declining trend mentioned in hint
  },
  // 2. Completion Rate (Bar)
  completion: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [95, 92, 90, 88, 85, 82]
  },
  // 3. Cost per Transaction (Line)
  cost: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [1.2, 1.35, 1.5, 1.8, 2.1, 2.45] // Rising costs
  },
  // 4. Digital Take Up (Line)
  digitalTakeUp: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [100, 100, 100, 100, 100, 100] // Maintaining 100%
  }
}

export default dashboardData
