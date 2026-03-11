/* global localStorage, FileReader */
import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'

import * as XLSX from 'xlsx'

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

// ============================================
// User Satisfaction Excel Processing
// ============================================

function normaliseResponse(response) {
  if (!response) {
    return null
  }
  const normalised = response.toString().trim().toLowerCase()

  if (normalised === 'very satisfied') {
    return 'very-satisfied'
  }
  if (normalised === 'satisfied') {
    return 'satisfied'
  }
  if (
    normalised === 'neither satisfied or dissatisfied' ||
    normalised === 'neither satisfied nor dissatisfied'
  ) {
    return 'neither'
  }
  if (normalised === 'dissatisfied') {
    return 'dissatisfied'
  }
  if (normalised === 'very dissatisfied') {
    return 'very-dissatisfied'
  }
  if (normalised === 'prefer not to say') {
    return 'prefer-not'
  }
  if (
    normalised === "i don't know" ||
    normalised === 'i dont know' ||
    normalised === "don't know"
  ) {
    return 'dont-know'
  }
  return null
}

function parseExcelDate(value) {
  if (!value) {
    return null
  }

  // Excel stores dates as serial numbers (days since 1900-01-01)
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + value * 86400000)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Try parsing as a string date
  const str = value.toString().trim()
  if (!str) {
    return null
  }

  // Handle M/D/YYYY or MM/DD/YYYY format
  const slashParts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashParts) {
    const date = new Date(slashParts[3], slashParts[1] - 1, slashParts[2])
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Handle DD-MM-YYYY or YYYY-MM-DD
  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

function dateToInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + '-' + month + '-' + day
}

function processSatisfactionFile(file) {
  const reader = new FileReader()

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array', cellDates: false })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

    const counts = {
      'very-satisfied': 0,
      satisfied: 0,
      neither: 0,
      dissatisfied: 0,
      'very-dissatisfied': 0,
      'prefer-not': 0,
      'dont-know': 0
    }

    // Auto-detect which column contains satisfaction responses
    let responseCol = -1

    for (let i = 1; i < jsonData.length && responseCol === -1; i++) {
      const row = jsonData[i]
      if (!row) {
        continue
      }
      for (let c = 0; c < row.length; c++) {
        if (row[c] && normaliseResponse(row[c]) !== null) {
          responseCol = c
          break
        }
      }
    }

    // Fallback to column B if nothing detected
    if (responseCol === -1) {
      responseCol = 1
    }

    // Track earliest and latest dates from column A
    let earliestDate = null
    let latestDate = null

    // Count responses and extract dates starting from row 2 (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row) {
        continue
      }

      // Extract date from column A (index 0)
      const parsedDate = parseExcelDate(row[0])
      if (parsedDate) {
        if (!earliestDate || parsedDate < earliestDate) {
          earliestDate = parsedDate
        }
        if (!latestDate || parsedDate > latestDate) {
          latestDate = parsedDate
        }
      }

      // Count satisfaction response
      if (row[responseCol] === undefined || row[responseCol] === null) {
        continue
      }
      const cellValue = row[responseCol].toString().trim()
      if (!cellValue) {
        continue
      }
      const response = normaliseResponse(cellValue)
      if (response && counts[response] !== undefined) {
        counts[response]++
      }
    }

    // Store date range for use when submitting
    const dateFrom = earliestDate ? dateToInputValue(earliestDate) : ''
    const dateTo = latestDate ? dateToInputValue(latestDate) : ''

    const satisfactionDateFromInput = document.getElementById(
      'input-satisfaction-date-from'
    )
    if (satisfactionDateFromInput) {
      satisfactionDateFromInput.value = dateFrom
    }

    const satisfactionDateToInput = document.getElementById(
      'input-satisfaction-date-to'
    )
    if (satisfactionDateToInput) {
      satisfactionDateToInput.value = dateTo
    }

    updateSatisfactionPreview(counts, dateFrom, dateTo)
  }

  reader.readAsArrayBuffer(file)
}

function updateSatisfactionPreview(counts, dateFrom, dateTo) {
  document.getElementById('count-very-satisfied').textContent =
    counts['very-satisfied']
  document.getElementById('count-satisfied').textContent = counts['satisfied']
  document.getElementById('count-neither').textContent = counts['neither']
  document.getElementById('count-dissatisfied').textContent =
    counts['dissatisfied']
  document.getElementById('count-very-dissatisfied').textContent =
    counts['very-dissatisfied']
  document.getElementById('count-prefer-not').textContent = counts['prefer-not']
  document.getElementById('count-dont-know').textContent = counts['dont-know']

  const satisfiedCount = counts['very-satisfied'] + counts['satisfied']
  const validResponses =
    counts['very-satisfied'] +
    counts['satisfied'] +
    counts['neither'] +
    counts['dissatisfied'] +
    counts['very-dissatisfied']

  const satisfactionRate =
    validResponses > 0
      ? ((satisfiedCount / validResponses) * 100).toFixed(1)
      : '0.0'

  document.getElementById('count-total-satisfied').textContent = satisfiedCount
  document.getElementById('count-total-valid').textContent = validResponses
  document.getElementById('preview-satisfaction-rate').textContent =
    satisfactionRate + '%'

  document.getElementById('input-satisfied-responses').value = satisfiedCount
  document.getElementById('input-total-responses').value = validResponses
  document.getElementById('input-user-satisfaction').value = satisfactionRate

  // Show date range in preview if available
  const dateRangeEl = document.getElementById('preview-satisfaction-date-range')
  if (dateRangeEl && dateFrom && dateTo) {
    dateRangeEl.textContent = formatDateRange(dateFrom, dateTo)
    showElement(dateRangeEl)
  }

  const preview = document.getElementById('satisfaction-preview')
  if (preview) {
    preview.classList.remove('settings-hidden')
    preview.classList.add('settings-visible')
  }
}

// ============================================
// KPI Calculations
// ============================================

function calculateKpis(inputs) {
  const started = parseFloat(inputs.started) || 0
  const completed = parseFloat(inputs.completed) || 0
  const totalRunCost = parseFloat(inputs.totalRunCost) || 0
  const totalTransactions = parseFloat(inputs.totalTransactions) || 0
  const satisfiedResponses = parseFloat(inputs.satisfiedResponses) || 0
  const totalResponses = parseFloat(inputs.totalResponses) || 0

  const completionRate =
    started > 0 ? ((completed / started) * 100).toFixed(1) : '0.0'

  const costPerTransaction =
    totalTransactions > 0
      ? (totalRunCost / totalTransactions).toFixed(2)
      : '0.00'

  const userSatisfaction =
    totalResponses > 0
      ? ((satisfiedResponses / totalResponses) * 100).toFixed(1)
      : '0.0'

  return {
    completionRate,
    costPerTransaction,
    userSatisfaction,
    started,
    completed,
    totalRunCost,
    totalTransactions,
    satisfiedResponses,
    totalResponses,
    completionDateFrom: inputs.completionDateFrom || '',
    completionDateTo: inputs.completionDateTo || '',
    costDateFrom: inputs.costDateFrom || '',
    costDateTo: inputs.costDateTo || '',
    satisfactionDateFrom: inputs.satisfactionDateFrom || '',
    satisfactionDateTo: inputs.satisfactionDateTo || ''
  }
}

function submitKpi() {
  const inputs = {
    started: document.getElementById('input-started').value,
    completed: document.getElementById('input-completed').value,
    totalRunCost: document.getElementById('input-total-run-cost').value,
    totalTransactions: document.getElementById('input-total-transactions')
      .value,
    satisfiedResponses: document.getElementById('input-satisfied-responses')
      .value,
    totalResponses: document.getElementById('input-total-responses').value,
    completionDateFrom: document.getElementById('input-completion-date-from')
      .value,
    completionDateTo: document.getElementById('input-completion-date-to').value,
    costDateFrom: document.getElementById('input-cost-date-from').value,
    costDateTo: document.getElementById('input-cost-date-to').value,
    satisfactionDateFrom:
      (document.getElementById('input-satisfaction-date-from') || {}).value ||
      '',
    satisfactionDateTo:
      (document.getElementById('input-satisfaction-date-to') || {}).value || ''
  }

  const results = calculateKpis(inputs)
  localStorage.setItem('kpi_results', JSON.stringify(results))
  window.location.href = '/kpi-dashboard'
}

// ============================================
// Dashboard Update Functions
// ============================================

function showElement(el) {
  if (el) {
    el.classList.remove('settings-hidden')
    el.classList.add('settings-visible')
  }
}

function updateElement(id, textContent) {
  const el = document.getElementById(id)
  if (el) {
    el.textContent = textContent
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
    showElement(sourceCompletion)
  }

  const completionRange = formatDateRange(
    kpi.completionDateFrom,
    kpi.completionDateTo
  )
  if (completionRange) {
    const dateEl = document.getElementById('date-completion-rate')
    if (dateEl) {
      dateEl.textContent = completionRange
      showElement(dateEl)
    }
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
    showElement(sourceCost)
  }

  const costRange = formatDateRange(kpi.costDateFrom, kpi.costDateTo)
  if (costRange) {
    const dateEl = document.getElementById('date-cost-per-transaction')
    if (dateEl) {
      dateEl.textContent = costRange
      showElement(dateEl)
    }
  }

  const cardCost = document.getElementById('card-cost-per-transaction')
  if (cardCost) {
    cardCost.classList.add('kpi-card--active')
  }
}

function updateSatisfactionCard(kpi) {
  const satisfactionEl = document.getElementById('display-user-satisfaction')
  if (!satisfactionEl) {
    return
  }

  satisfactionEl.textContent = kpi.userSatisfaction + '%'

  const sourceSatisfaction = document.getElementById('source-user-satisfaction')
  if (sourceSatisfaction) {
    updateElement('source-satisfied-responses', kpi.satisfiedResponses)
    updateElement('source-total-responses', kpi.totalResponses)
    showElement(sourceSatisfaction)
  }

  const satisfactionRange = formatDateRange(
    kpi.satisfactionDateFrom,
    kpi.satisfactionDateTo
  )
  if (satisfactionRange) {
    const dateEl = document.getElementById('date-user-satisfaction')
    if (dateEl) {
      dateEl.textContent = satisfactionRange
      showElement(dateEl)
    }
  }

  const cardSatisfaction = document.getElementById('card-user-satisfaction')
  if (cardSatisfaction) {
    cardSatisfaction.classList.add('kpi-card--active')
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
  updateSatisfactionCard(kpi)
}

// ============================================
// Event Listeners
// ============================================

function initApp() {
  const btnSubmit = document.getElementById('btn-submit')
  if (btnSubmit) {
    btnSubmit.addEventListener('click', submitKpi)
  }

  const btnCalculate = document.getElementById('btn-calculate-costs')
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculateCostBreakdown)
  }

  const costItems = document.querySelectorAll('.cost-item')
  costItems.forEach(function (input) {
    input.addEventListener('input', calculateCostBreakdown)
  })

  const satisfactionFileInput = document.getElementById(
    'input-satisfaction-file'
  )
  if (satisfactionFileInput) {
    satisfactionFileInput.addEventListener('change', function (e) {
      const file = e.target.files[0]
      if (file) {
        processSatisfactionFile(file)
      }
    })
  }

  const completionEl = document.getElementById('display-completion-rate')
  if (completionEl) {
    loadDashboardKpis()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
