/* global localStorage */
import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

// ============================================
// KPI Calculation Functions
// ============================================

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }
  const parts = dateString.split('-')
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatDateRange(from, to) {
  if (!from && !to) {
    return ''
  }
  if (from && to) {
    return formatDate(from) + ' to ' + formatDate(to)
  }
  if (from) {
    return 'From ' + formatDate(from)
  }
  return 'To ' + formatDate(to)
}

function calculateCostBreakdown() {
  const costItems = document.querySelectorAll('.cost-item')
  let total = 0
  costItems.forEach(function (input) {
    total += parseFloat(input.value) || 0
  })

  const totalDisplay = document.getElementById('cost-breakdown-total')
  if (totalDisplay) {
    totalDisplay.textContent = total.toFixed(2)
  }

  const totalRunCostInput = document.getElementById('input-total-run-cost')
  if (totalRunCostInput) {
    totalRunCostInput.value = total.toFixed(2)
  }
}

function calculateKpis(inputs) {
  const started = parseFloat(inputs.started) || 0
  const completed = parseFloat(inputs.completed) || 0
  const totalRunCost = parseFloat(inputs.totalRunCost) || 0
  const totalTransactions = parseFloat(inputs.totalTransactions) || 0

  const completionRate =
    started > 0 ? ((completed / started) * 100).toFixed(1) : '0.0'

  const costPerTransaction =
    totalTransactions > 0
      ? (totalRunCost / totalTransactions).toFixed(2)
      : '0.00'

  return {
    completionRate,
    costPerTransaction,
    started,
    completed,
    totalRunCost,
    totalTransactions,
    completionDateFrom: inputs.completionDateFrom || '',
    completionDateTo: inputs.completionDateTo || '',
    costDateFrom: inputs.costDateFrom || '',
    costDateTo: inputs.costDateTo || ''
  }
}

function submitKpi() {
  const inputs = {
    started: document.getElementById('input-started').value,
    completed: document.getElementById('input-completed').value,
    totalRunCost: document.getElementById('input-total-run-cost').value,
    totalTransactions: document.getElementById('input-total-transactions')
      .value,
    completionDateFrom: document.getElementById('input-completion-date-from')
      .value,
    completionDateTo: document.getElementById('input-completion-date-to').value,
    costDateFrom: document.getElementById('input-cost-date-from').value,
    costDateTo: document.getElementById('input-cost-date-to').value
  }

  const results = calculateKpis(inputs)
  localStorage.setItem('kpi_results', JSON.stringify(results))
  window.location.href = '/kpi-dashboard'
}

function updateElement(id, textContent, displayStyle) {
  const el = document.getElementById(id)
  if (el) {
    el.textContent = textContent
    if (displayStyle !== undefined) {
      el.style.display = displayStyle
    }
  }
  return el
}

function updateCompletionCard(kpi) {
  const completionEl = document.getElementById('display-completion-rate')
  if (!completionEl) {
    return
  }

  completionEl.textContent = kpi.completionRate + '%'

  const sourceCompletion = document.getElementById('source-completion-rate')
  if (sourceCompletion) {
    updateElement('source-completed', kpi.completed)
    updateElement('source-started', kpi.started)
    sourceCompletion.style.display = 'block'
  }

  const completionRange = formatDateRange(
    kpi.completionDateFrom,
    kpi.completionDateTo
  )
  if (completionRange) {
    updateElement('date-completion-rate', completionRange, 'block')
  }

  const cardCompletion = document.getElementById('card-completion-rate')
  if (cardCompletion) {
    cardCompletion.classList.add('kpi-card--active')
  }
}

function updateCostCard(kpi) {
  const costEl = document.getElementById('display-cost-per-transaction')
  if (!costEl) {
    return
  }

  costEl.textContent = '\u00A3' + kpi.costPerTransaction

  const sourceCost = document.getElementById('source-cost-per-transaction')
  if (sourceCost) {
    updateElement('source-total-run-cost', kpi.totalRunCost)
    updateElement('source-total-transactions', kpi.totalTransactions)
    sourceCost.style.display = 'block'
  }

  const costRange = formatDateRange(kpi.costDateFrom, kpi.costDateTo)
  if (costRange) {
    updateElement('date-cost-per-transaction', costRange, 'block')
  }

  const cardCost = document.getElementById('card-cost-per-transaction')
  if (cardCost) {
    cardCost.classList.add('kpi-card--active')
  }
}

function loadDashboardKpis() {
  const raw = localStorage.getItem('kpi_results')
  if (!raw) {
    return
  }

  const kpi = JSON.parse(raw)
  updateCompletionCard(kpi)
  updateCostCard(kpi)
}

// Attach event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const btnSubmit = document.getElementById('btn-submit')
  if (btnSubmit) {
    btnSubmit.addEventListener('click', submitKpi)
  }

  const btnCalculate = document.getElementById('btn-calculate-costs')
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculateCostBreakdown)
  }

  const completionEl = document.getElementById('display-completion-rate')
  if (completionEl) {
    loadDashboardKpis()
  }
})
