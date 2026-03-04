export const SAMPLE = [
  {
    date: '2025-01-01',
    digitalTakeUp: 20,
    completionRate: 65,
    costPerTransaction: 3.5,
    userSatisfaction: 4.0
  },
  {
    date: '2025-02-01',
    digitalTakeUp: 24,
    completionRate: 67,
    costPerTransaction: 3.2,
    userSatisfaction: 4.1
  },
  {
    date: '2025-03-01',
    digitalTakeUp: 28,
    completionRate: 70,
    costPerTransaction: 2.9,
    userSatisfaction: 4.2
  },
  {
    date: '2025-04-01',
    digitalTakeUp: 31,
    completionRate: 72,
    costPerTransaction: 2.7,
    userSatisfaction: 4.3
  }
]

export function queryMetrics({ start, end, limit } = {}) {
  let out = SAMPLE.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
  if (start) out = out.filter((r) => new Date(r.date) >= new Date(start))
  if (end) out = out.filter((r) => new Date(r.date) <= new Date(end))
  if (limit) out = out.slice(-Number(limit))
  return out
}

export function getKPIs(data = []) {
  const latest = data[data.length - 1] || {}
  const prev = data[data.length - 2] || {}
  const pctChange = (cur, prevVal) =>
    prevVal != null && prevVal !== 0 ? ((cur - prevVal) / prevVal) * 100 : null

  return {
    digitalTakeUp: latest.digitalTakeUp ?? null,
    digitalTakeUpChange:
      latest.digitalTakeUp != null
        ? pctChange(latest.digitalTakeUp, prev.digitalTakeUp)
        : null,
    completionRate: latest.completionRate ?? null,
    completionRateChange:
      latest.completionRate != null
        ? pctChange(latest.completionRate, prev.completionRate)
        : null,
    costPerTransaction: latest.costPerTransaction ?? null,
    costPerTransactionChange:
      latest.costPerTransaction != null
        ? pctChange(latest.costPerTransaction, prev.costPerTransaction)
        : null,
    userSatisfaction: latest.userSatisfaction ?? null,
    userSatisfactionChange:
      latest.userSatisfaction != null
        ? pctChange(latest.userSatisfaction, prev.userSatisfaction)
        : null
  }
}
