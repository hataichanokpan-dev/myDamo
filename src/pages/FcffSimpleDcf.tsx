import { useState, useCallback } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import type { FcffSimpleInputs } from '../engines/fcffSimpleDcf'
import { computeFcffSimpleDcf } from '../engines/fcffSimpleDcf'
import TickerSearch from '../components/TickerSearch'
import FormField from '../components/FormField'
import { fmtNumber, fmtPercent, fmtCompact } from '../utils/format'
import './CalculatorPage.css'

const DEFAULT_INPUTS: FcffSimpleInputs = {
  revenue: 0, operatingIncome: 0, interestExpense: 0,
  bookValueOfEquity: 0, bookValueOfDebt: 0,
  cashAndMarketableSecurities: 0, crossHoldings: 0,
  minorityInterests: 0, sharesOutstanding: 1,
  currentStockPrice: 0, effectiveTaxRate: 0.15,
  marginalTaxRate: 0.25,
  revenueGrowthYear1: 0.05, revenueGrowthYears2to5: 0.05,
  operatingMarginNextYear: 0.15, targetOperatingMargin: 0.20,
  yearOfConvergence: 5,
  salesToCapitalRatioYears1to5: 2.5, salesToCapitalRatioYears6to10: 2.5,
  riskFreeRate: 0.04, costOfCapital: 0.09,
  overrideStableCostOfCapital: false, stableCostOfCapital: 0.085,
  overrideStableRoc: false, stableRoc: 0.12,
  overrideFailure: false, probabilityOfFailure: 0,
  distressProceedsPercent: 0.5, distressProceedsBasis: 'V',
  overrideGrowthPerpetuity: false, growthInPerpetuity: -0.05,
  overrideRiskFreeAfter10: false, riskFreeRateAfter10: 0.02,
  overrideTaxAdjustment: false,
  overrideNol: false, nolCarryForward: 0,
  hasRd: false, hasLease: false,
  rdAdjustment: 0, leaseAdjustment: 0,
  hasOptions: false, optionCount: 0, optionStrike: 0,
  optionMaturity: 5, optionVolatility: 0.4,
}

export default function FcffSimpleDcf() {
  const [inputs, setInputs] = useState<FcffSimpleInputs>(DEFAULT_INPUTS)
  const [result, setResult] = useState<ReturnType<typeof computeFcffSimpleDcf> | null>(null)

  const handleAutoFill = useCallback((data: YahooFinanceData) => {
    setInputs(prev => ({
      ...prev,
      revenue: data.totalRevenue || data.revenue || 0,
      operatingIncome: data.operatingIncome || data.ebit || 0,
      interestExpense: data.interestExpense || 0,
      bookValueOfEquity: data.totalEquity || 0,
      bookValueOfDebt: data.totalDebt || 0,
      cashAndMarketableSecurities: data.totalCash || 0,
      sharesOutstanding: data.sharesOutstanding || 1,
      currentStockPrice: data.price || 0,
      effectiveTaxRate: data.effectiveTaxRate || 0.15,
    }))
  }, [])

  const update = (key: keyof FcffSimpleInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const compute = () => {
    setResult(computeFcffSimpleDcf(inputs))
  }

  return (
    <div className="calc-page">
      <div className="container">
        <h1>FCFF Simple DCF Valuation</h1>
        <p className="page-desc">10-year Free Cash Flow to Firm model. Auto-fetch financials, set your assumptions, get intrinsic value per share.</p>

        <TickerSearch onData={(data) => handleAutoFill(data)} />

        <div className="calc-grid">
          <div className="calc-inputs">
            <h2>Financial Data</h2>
            <div className="input-section">
              <FormField label="Revenue" source="auto" value={inputs.revenue} onChange={v => update('revenue', v)} />
              <FormField label="Operating Income (EBIT)" source="auto" value={inputs.operatingIncome} onChange={v => update('operatingIncome', v)} />
              <FormField label="Interest Expense" source="auto" value={inputs.interestExpense} onChange={v => update('interestExpense', v)} />
              <FormField label="Book Value of Equity" source="auto" value={inputs.bookValueOfEquity} onChange={v => update('bookValueOfEquity', v)} />
              <FormField label="Book Value of Debt" source="auto" value={inputs.bookValueOfDebt} onChange={v => update('bookValueOfDebt', v)} />
              <FormField label="Cash & Securities" source="auto" value={inputs.cashAndMarketableSecurities} onChange={v => update('cashAndMarketableSecurities', v)} />
              <FormField label="Shares Outstanding" source="auto" value={inputs.sharesOutstanding} onChange={v => update('sharesOutstanding', v)} />
              <FormField label="Stock Price" source="auto" value={inputs.currentStockPrice} onChange={v => update('currentStockPrice', v)} step={0.01} />
              <FormField label="Effective Tax Rate" source="default" value={inputs.effectiveTaxRate} onChange={v => update('effectiveTaxRate', v)} step={0.01} />
            </div>

            <h2>Growth Assumptions</h2>
            <div className="input-section">
              <FormField label="Revenue Growth - Year 1" source="user" value={inputs.revenueGrowthYear1} onChange={v => update('revenueGrowthYear1', v)} step={0.01} />
              <FormField label="Revenue Growth - Years 2-5" source="user" value={inputs.revenueGrowthYears2to5} onChange={v => update('revenueGrowthYears2to5', v)} step={0.01} />
              <FormField label="Operating Margin - Next Year" source="default" value={inputs.operatingMarginNextYear} onChange={v => update('operatingMarginNextYear', v)} step={0.01} />
              <FormField label="Target Operating Margin" source="default" value={inputs.targetOperatingMargin} onChange={v => update('targetOperatingMargin', v)} step={0.01} />
              <FormField label="Year of Convergence" source="user" value={inputs.yearOfConvergence} onChange={v => update('yearOfConvergence', v)} />
              <FormField label="Sales/Capital Ratio (Yr 1-5)" source="user" value={inputs.salesToCapitalRatioYears1to5} onChange={v => update('salesToCapitalRatioYears1to5', v)} step={0.1} />
              <FormField label="Sales/Capital Ratio (Yr 6-10)" source="user" value={inputs.salesToCapitalRatioYears6to10} onChange={v => update('salesToCapitalRatioYears6to10', v)} step={0.1} />
            </div>

            <h2>Discount Rate</h2>
            <div className="input-section">
              <FormField label="Risk-free Rate" source="default" value={inputs.riskFreeRate} onChange={v => update('riskFreeRate', v)} step={0.01} />
              <FormField label="Cost of Capital (from WACC)" source="user" value={inputs.costOfCapital} onChange={v => update('costOfCapital', v)} step={0.01} />
              <FormField label="Marginal Tax Rate" source="default" value={inputs.marginalTaxRate} onChange={v => update('marginalTaxRate', v)} step={0.01} />
            </div>

            <div className="input-section">
              <FormField label="Employee Options Outstanding" source="user" type="checkbox" value={inputs.hasOptions ? 1 : 0} onChange={v => update('hasOptions', v === 1)} checked={inputs.hasOptions} />
              {inputs.hasOptions && <>
                <FormField label="Number of Options" source="user" value={inputs.optionCount} onChange={v => update('optionCount', v)} />
                <FormField label="Avg Strike Price" source="user" value={inputs.optionStrike} onChange={v => update('optionStrike', v)} step={0.01} />
              </>}
            </div>

            <button onClick={compute} className="btn-primary calc-btn">Calculate Valuation</button>
          </div>

          {result && (
            <div className="calc-results">
              <h2>Valuation Result</h2>
              <div className="result-summary">
                <div className="result-card result-card-main">
                  <span className="result-label">Value per Share</span>
                  <span className="result-value">{result.valuePerShare.toFixed(2)}</span>
                  <span className="result-compare">
                    vs. Market Price: {inputs.currentStockPrice.toFixed(2)}
                    {' '}({fmtPercent(result.valuePerShare / inputs.currentStockPrice - 1)} {result.valuePerShare > inputs.currentStockPrice ? 'undervalued' : 'overvalued'})
                  </span>
                </div>
                <div className="result-card">
                  <span className="result-label">PV of Cash Flows</span>
                  <span className="result-number">{fmtCompact(result.pvCashFlows)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">PV of Terminal Value</span>
                  <span className="result-number">{fmtCompact(result.pvTerminalValue)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">Operating Asset Value</span>
                  <span className="result-number">{fmtCompact(result.valueOfOperatingAssets)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">Equity Value</span>
                  <span className="result-number">{fmtCompact(result.valueOfEquity)}</span>
                </div>
              </div>

              <h3>Diagnostics</h3>
              <div className="diagnostics">
                <div className="diag-item"><span>Revenue Y10</span><span>{fmtCompact(result.diagnostics.revenueYear10)}</span></div>
                <div className="diag-item"><span>EBIT Y10</span><span>{fmtCompact(result.diagnostics.ebitYear10)}</span></div>
                <div className="diag-item"><span>ROIC Y10</span><span>{fmtPercent(result.diagnostics.roicYear10)}</span></div>
                <div className="diag-item"><span>Cost of Capital Y10</span><span>{fmtPercent(result.diagnostics.costOfCapitalYear10)}</span></div>
                <div className="diag-item"><span>Terminal Growth</span><span>{fmtPercent(result.diagnostics.terminalGrowthRate)}</span></div>
              </div>

              <h3>10-Year Projection</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th></th><th>Y1</th><th>Y2</th><th>Y3</th><th>Y4</th><th>Y5</th>
                      <th>Y6</th><th>Y7</th><th>Y8</th><th>Y9</th><th>Y10</th><th>Terminal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="row-label">Rev Growth</td>
                      {result.years.map(y => <td key={y.year}>{fmtPercent(y.revenueGrowth)}</td>)}
                      <td>{fmtPercent(result.terminalYear.revenueGrowth)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">Revenue</td>
                      {result.years.map(y => <td key={y.year}>{fmtCompact(y.revenue)}</td>)}
                      <td>{fmtCompact(result.terminalYear.revenue)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">Op Margin</td>
                      {result.years.map(y => <td key={y.year}>{fmtPercent(y.operatingMargin)}</td>)}
                      <td>{fmtPercent(result.terminalYear.operatingMargin)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">EBIT</td>
                      {result.years.map(y => <td key={y.year}>{fmtCompact(y.ebit)}</td>)}
                      <td>{fmtCompact(result.terminalYear.ebit)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">EBIT(1-t)</td>
                      {result.years.map(y => <td key={y.year}>{fmtCompact(y.ebitAfterTax)}</td>)}
                      <td>{fmtCompact(result.terminalYear.ebitAfterTax)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">Reinvestment</td>
                      {result.years.map(y => <td key={y.year}>{fmtCompact(y.reinvestment)}</td>)}
                      <td>{fmtCompact(result.terminalYear.reinvestment)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">FCFF</td>
                      {result.years.map(y => <td key={y.year}>{fmtCompact(y.fcff)}</td>)}
                      <td>{fmtCompact(result.terminalYear.fcff)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">Cost of Capital</td>
                      {result.years.map(y => <td key={y.year}>{fmtPercent(y.costOfCapital)}</td>)}
                      <td>{fmtPercent(result.terminalYear.costOfCapital)}</td>
                    </tr>
                    <tr>
                      <td className="row-label">ROIC</td>
                      {result.years.map(y => <td key={y.year}>{fmtPercent(y.roic)}</td>)}
                      <td>{fmtPercent(result.terminalYear.roic)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
