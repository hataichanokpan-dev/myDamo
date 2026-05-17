export interface YahooFinanceData {
  symbol: string
  shortName: string
  longName: string
  currency: string
  exchange: string

  price: number
  previousClose: number
  marketCap: number
  sharesOutstanding: number

  revenue: number
  costOfRevenue: number
  grossProfit: number
  operatingIncome: number
  ebit: number
  netIncome: number
  interestExpense: number

  totalAssets: number
  totalLiabilities: number
  totalDebt: number
  totalEquity: number
  totalCash: number
  totalRevenue: number

  beta: number
  effectiveTaxRate: number
  returnOnEquity: number

  sector: string
  industry: string
  country: string

  dividendYield: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

export async function fetchStockData(ticker: string): Promise<YahooFinanceData> {
  const res = await fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}
