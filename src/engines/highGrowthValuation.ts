import type { HighGrowthResult, HighGrowthYear } from './types'

export interface HighGrowthInputs {
  // Current financials (auto-fetchable)
  currentEbit: number
  currentInterestExpense: number
  currentCapex: number
  currentDepreciation: number
  currentRevenue: number
  currentWorkingCapital: number
  priorWorkingCapital: number
  bookValueOfDebt: number
  bookValueOfEquity: number
  cash: number
  nonOperatingAssets: number
  sharesOutstanding: number
  currentStockPrice: number

  // Tax
  nolCarryForward: number
  marginalTaxRate: number

  // Adjustments
  hasLease: boolean
  hasRd: boolean
  leaseDebtValue: number
  leaseOpIncomeAdjustment: number
  rdOpIncomeAdjustment: number

  // Discount rate
  currentBeta: number
  currentCostOfDebt: number
  currentMarketValueOfDebt: number
  riskFreeRate: number
  marketRiskPremium: number

  // Growth assumptions
  enterGrowthPerYear: boolean
  revenueGrowthByYear: number[]
  compoundedAnnualGrowth: number
  useCurrentWcPercent: boolean
  workingCapitalPercentOfRevenue: number
  capexApproach: 1 | 2 | 3
  salesToCapitalRatio: number

  // Stable growth
  stableGrowthRate: number
  stableOperatingMargin: number
  stableDebtRatio: number
  stableBeta: number
  stableCostOfDebt: number
  stableRoc: number

  // Options
  hasOptions: boolean
  optionCount: number
  optionStrike: number
  optionMaturity: number
  optionVolatility: number

  // Convergence speed
  convergenceSpeed: number
}

export function computeHighGrowthValuation(inputs: HighGrowthInputs): HighGrowthResult {
  const {
    currentEbit, currentDepreciation, currentCapex, currentRevenue,
    currentWorkingCapital, priorWorkingCapital,
    bookValueOfDebt, bookValueOfEquity, cash, nonOperatingAssets,
    sharesOutstanding, currentStockPrice,
    nolCarryForward, marginalTaxRate,
    hasLease, hasRd, leaseDebtValue, leaseOpIncomeAdjustment, rdOpIncomeAdjustment,
    currentBeta, currentCostOfDebt, currentMarketValueOfDebt,
    riskFreeRate, marketRiskPremium,
    enterGrowthPerYear, revenueGrowthByYear, compoundedAnnualGrowth,
    useCurrentWcPercent, workingCapitalPercentOfRevenue,
    capexApproach, salesToCapitalRatio,
    stableGrowthRate, stableOperatingMargin, stableDebtRatio, stableBeta, stableCostOfDebt, stableRoc,
    hasOptions, optionCount, optionStrike, optionVolatility,
    convergenceSpeed,
  } = inputs

  const adjustedEbit = currentEbit + (hasLease ? leaseOpIncomeAdjustment : 0) + (hasRd ? rdOpIncomeAdjustment : 0)
  const currentOpMargin = currentRevenue > 0 ? adjustedEbit / currentRevenue : 0
  const currentWcPercent = useCurrentWcPercent
    ? (currentWorkingCapital - priorWorkingCapital) / currentRevenue
    : workingCapitalPercentOfRevenue / 100

  const years: HighGrowthYear[] = []
  let prevRevenue = currentRevenue
  let prevWc = currentWorkingCapital
  let prevInvestedCapital = bookValueOfEquity + bookValueOfDebt + (hasLease ? leaseDebtValue : 0) - cash
  let cumulatedWacc = 1
  let remainingNol = nolCarryForward

  let pvCashFlows = 0

  for (let yr = 1; yr <= 10; yr++) {
    // Revenue growth
    let revGrowth: number
    if (enterGrowthPerYear && revenueGrowthByYear[yr - 1] !== undefined) {
      revGrowth = revenueGrowthByYear[yr - 1]
    } else {
      revGrowth = compoundedAnnualGrowth
    }

    const revenue = prevRevenue * (1 + revGrowth)

    // Operating margin convergence
    let margin: number
    if (yr <= 5) {
      margin = currentOpMargin + (stableOperatingMargin - currentOpMargin) * (yr / 10) * convergenceSpeed
    } else {
      const midMargin = currentOpMargin + (stableOperatingMargin - currentOpMargin) * 0.5 * convergenceSpeed
      margin = midMargin + (stableOperatingMargin - midMargin) * ((yr - 5) / 5) * convergenceSpeed
    }

    const ebit = revenue * margin

    // NOL and taxes
    let taxRate = 0
    let taxes = 0
    if (remainingNol > 0) {
      if (ebit > 0) {
        if (ebit <= remainingNol) {
          remainingNol -= ebit
          taxRate = 0
        } else {
          taxes = (ebit - remainingNol) * marginalTaxRate
          remainingNol = 0
          taxRate = taxes / ebit
        }
      }
    } else {
      taxRate = marginalTaxRate
      taxes = ebit > 0 ? ebit * marginalTaxRate : 0
    }

    const ebitAfterTax = ebit - taxes

    // Depreciation
    const depreciation = currentDepreciation * Math.pow(1 + revGrowth * 0.5, yr)

    // Capex
    let capex: number
    if (capexApproach === 1) {
      capex = currentCapex * Math.pow(1 + revGrowth * 0.3, yr)
    } else if (capexApproach === 2) {
      capex = revenue * (currentCapex / currentRevenue)
    } else {
      capex = (revenue - prevRevenue) / salesToCapitalRatio
    }

    // Working capital change
    const newWc = revenue * currentWcPercent
    const changeInWc = newWc - prevWc

    // FCFF
    const fcff = ebitAfterTax + depreciation - capex - changeInWc

    // Cost of capital transition
    let debtRatio: number
    let beta: number
    let costOfDebt: number

    if (yr <= 5) {
      debtRatio = currentMarketValueOfDebt / (currentMarketValueOfDebt + sharesOutstanding * currentStockPrice)
      beta = currentBeta
      costOfDebt = currentCostOfDebt
    } else {
      const progress = (yr - 5) / 5
      const baseDebtRatio = currentMarketValueOfDebt / (currentMarketValueOfDebt + sharesOutstanding * currentStockPrice)
      debtRatio = baseDebtRatio + (stableDebtRatio - baseDebtRatio) * progress
      beta = currentBeta + (stableBeta - currentBeta) * progress
      costOfDebt = currentCostOfDebt + (stableCostOfDebt - currentCostOfDebt) * progress
    }

    const costOfEquity = riskFreeRate + beta * marketRiskPremium
    const afterTaxCostOfDebt = costOfDebt * (1 - (taxRate > 0 ? taxRate : marginalTaxRate))
    const costOfCapital = (1 - debtRatio) * costOfEquity + debtRatio * afterTaxCostOfDebt

    cumulatedWacc *= (1 + costOfCapital)
    const pvFcff = fcff / cumulatedWacc
    pvCashFlows += pvFcff

    // Invested capital
    const reinvestment = capex - depreciation + changeInWc
    const investedCapital = prevInvestedCapital + reinvestment
    const reinvestmentRate = ebitAfterTax !== 0 ? reinvestment / ebitAfterTax : 0
    const roic = prevInvestedCapital > 0 ? ebitAfterTax / prevInvestedCapital : 0

    years.push({
      year: yr,
      revenueGrowth: revGrowth,
      revenue,
      operatingMargin: margin,
      ebit,
      taxRate,
      ebitAfterTax,
      depreciation,
      capex,
      changeInWc,
      fcff,
      nol: remainingNol,
      costOfCapital,
      cumulatedWacc,
      pvFcff,
      investedCapital,
      reinvestmentRate,
      roic,
    })

    prevRevenue = revenue
    prevWc = newWc
    prevInvestedCapital = investedCapital
  }

  // Terminal year
  const lastYear = years[9]
  const terminalRevenue = lastYear.revenue * (1 + stableGrowthRate)
  const terminalEbit = terminalRevenue * stableOperatingMargin
  const terminalEbitAfterTax = terminalEbit * (1 - marginalTaxRate)
  const terminalReinvestmentRate = stableGrowthRate / stableRoc
  const terminalFcff = terminalEbitAfterTax * (1 - terminalReinvestmentRate)

  const stableCostOfEquity = riskFreeRate + stableBeta * marketRiskPremium
  const stableAfterTaxCostOfDebt = stableCostOfDebt * (1 - marginalTaxRate)
  const stableWacc = (1 - stableDebtRatio) * stableCostOfEquity + stableDebtRatio * stableAfterTaxCostOfDebt

  const terminalValue = terminalFcff / (stableWacc - stableGrowthRate)
  const pvTerminalValue = terminalValue / cumulatedWacc

  // Total value
  const valueOfOperatingAssets = pvCashFlows + pvTerminalValue
  const valueOfFirm = valueOfOperatingAssets + cash + nonOperatingAssets
  const valueOfEquity = valueOfFirm - (bookValueOfDebt + (hasLease ? leaseDebtValue : 0))

  // Option value (treasury stock)
  let optionValue = 0
  if (hasOptions && optionCount > 0) {
    const intrinsicValue = Math.max(0, currentStockPrice - optionStrike)
    // Simplified Black-Scholes for warrant dilution
    optionValue = optionCount * intrinsicValue * 0.7 // approximation
  }

  const equityAfterOptions = valueOfEquity - optionValue
  const dilutedShares = sharesOutstanding + (hasOptions && optionValue > 0 ? optionCount : 0)
  const valuePerShare = dilutedShares > 0 ? equityAfterOptions / dilutedShares : 0

  return {
    years,
    terminalValue,
    pvTerminalValue,
    pvCashFlows,
    valueOfOperatingAssets,
    valueOfEquity: equityAfterOptions,
    valuePerShare,
  }
}
