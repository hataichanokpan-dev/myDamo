export interface DdmInputs {
  currentDividend: number
  expectedGrowth: number
  stableGrowth: number
  costOfEquity: number
  highGrowthYears: number
}

export interface DdmResult {
  valuePerShare: number
  pvHighGrowthDividends: number
  pvTerminalValue: number
  dividends: { year: number; dividend: number; presentValue: number }[]
}

export function computeTwoStageDdm(inputs: DdmInputs): DdmResult {
  const dividends: DdmResult['dividends'] = []
  let pvHighGrowthDividends = 0
  let lastDividend = inputs.currentDividend

  for (let year = 1; year <= inputs.highGrowthYears; year++) {
    lastDividend *= (1 + inputs.expectedGrowth)
    const presentValue = lastDividend / Math.pow(1 + inputs.costOfEquity, year)
    pvHighGrowthDividends += presentValue
    dividends.push({ year, dividend: lastDividend, presentValue })
  }

  const spread = inputs.costOfEquity - inputs.stableGrowth
  const terminalDividend = lastDividend * (1 + inputs.stableGrowth)
  const terminalValue = spread > 0 ? terminalDividend / spread : 0
  const pvTerminalValue = terminalValue / Math.pow(1 + inputs.costOfEquity, inputs.highGrowthYears)

  return {
    valuePerShare: pvHighGrowthDividends + pvTerminalValue,
    pvHighGrowthDividends,
    pvTerminalValue,
    dividends,
  }
}

export interface FcfeInputs {
  netIncome: number
  reinvestment: number
  debtCashFlow: number
  sharesOutstanding: number
  costOfEquity: number
  expectedGrowth: number
  stableGrowth: number
  stablePayoutRatio: number
  highGrowthYears: number
}

export interface FcfeResult {
  valueOfEquity: number
  valuePerShare: number
  pvFcfe: number
  pvTerminalValue: number
  years: { year: number; fcfe: number; presentValue: number }[]
}

export function computeFcfeValuation(inputs: FcfeInputs): FcfeResult {
  const years: FcfeResult['years'] = []
  let pvFcfe = 0
  let baseFcfe = inputs.netIncome - inputs.reinvestment + inputs.debtCashFlow

  for (let year = 1; year <= inputs.highGrowthYears; year++) {
    baseFcfe *= (1 + inputs.expectedGrowth)
    const presentValue = baseFcfe / Math.pow(1 + inputs.costOfEquity, year)
    pvFcfe += presentValue
    years.push({ year, fcfe: baseFcfe, presentValue })
  }

  const terminalNetIncome = inputs.netIncome * Math.pow(1 + inputs.expectedGrowth, inputs.highGrowthYears) * (1 + inputs.stableGrowth)
  const terminalFcfe = terminalNetIncome * inputs.stablePayoutRatio
  const spread = inputs.costOfEquity - inputs.stableGrowth
  const terminalValue = spread > 0 ? terminalFcfe / spread : 0
  const pvTerminalValue = terminalValue / Math.pow(1 + inputs.costOfEquity, inputs.highGrowthYears)
  const valueOfEquity = pvFcfe + pvTerminalValue

  return {
    valueOfEquity,
    valuePerShare: inputs.sharesOutstanding > 0 ? valueOfEquity / inputs.sharesOutstanding : 0,
    pvFcfe,
    pvTerminalValue,
    years,
  }
}
