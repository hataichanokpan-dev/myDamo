export interface YearlyData {
  year: number
  revenueGrowth: number
  revenue: number
  operatingMargin: number
  ebit: number
  taxRate: number
  ebitAfterTax: number
  reinvestment: number
  fcff: number
  costOfCapital: number
  cumulatedWacc: number
  presentValueFcff: number
  investedCapital: number
  salesToCapital: number
  roic: number
}

export interface DcfResult {
  years: YearlyData[]
  terminalYear: YearlyData
  terminalValue: number
  pvTerminalValue: number
  pvCashFlows: number
  valueOfOperatingAssets: number
  adjustmentForDistress: number
  valueOfEquity: number
  valuePerShare: number
  diagnostics: {
    revenueYear10: number
    ebitYear10: number
    roicYear10: number
    costOfCapitalYear10: number
    terminalGrowthRate: number
  }
}

export interface WaccResult {
  unleveredBeta: number
  leveredBeta: number
  costOfEquity: number
  preTaxCostOfDebt: number
  afterTaxCostOfDebt: number
  marketValueOfEquity: number
  marketValueOfDebt: number
  totalCapital: number
  equityWeight: number
  debtWeight: number
  wacc: number
  debtValueOfLeases: number
}

export interface ImpliedRocResult {
  reinvestmentRate: number
  impliedRoc: number
  reinvestmentRateIfRocEqualsWacc: number
}

export interface ImpliedErpResult {
  expectedDividends: number[]
  presentValues: number[]
  intrinsicValue: number
  impliedErp: number
}

export interface RdConversionResult {
  annualRd: { year: number; rdExpense: number; amortization: number; unamortizedValue: number }[]
  totalUnamortizedRd: number
  currentYearAmortization: number
  adjustmentToOperatingIncome: number
  adjustmentToEquity: number
}

export interface LeaseConversionResult {
  leasePv: { year: number; commitment: number; presentValue: number }[]
  debtValueOfLeases: number
  depreciationOnLeaseAsset: number
  adjustmentToOperatingIncome: number
  adjustmentToDebt: number
}

export interface NormalizedEarningsResult {
  approach: string
  normalizedEbit: number
  historicalAverageEbit?: number
  historicalAverageRoc?: number
  sectorMargin?: number
}

export interface HighGrowthResult {
  years: HighGrowthYear[]
  terminalValue: number
  pvTerminalValue: number
  pvCashFlows: number
  valueOfOperatingAssets: number
  valueOfEquity: number
  valuePerShare: number
}

export interface HighGrowthYear {
  year: number
  revenueGrowth: number
  revenue: number
  operatingMargin: number
  ebit: number
  taxRate: number
  ebitAfterTax: number
  depreciation: number
  capex: number
  changeInWc: number
  fcff: number
  nol: number
  costOfCapital: number
  cumulatedWacc: number
  pvFcff: number
  investedCapital: number
  reinvestmentRate: number
  roic: number
}
