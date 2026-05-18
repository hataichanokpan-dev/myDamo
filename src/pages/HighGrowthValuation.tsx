import { useState, useCallback } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import type { CountryRiskRecord } from '../data/countryRiskLatest'
import type { HighGrowthInputs } from '../engines/highGrowthValuation'
import { computeHighGrowthValuation } from '../engines/highGrowthValuation'
import TickerSearch from '../components/TickerSearch'
import FormField from '../components/FormField'
import ProjectionChart from '../components/ProjectionChart'
import CountryRiskPanel from '../components/CountryRiskPanel'
import { fmtNumber, fmtPercent, fmtCompact } from '../utils/format'
import useAutoScrollResult from '../hooks/useAutoScrollResult'
import './CalculatorPage.css'

const DEFAULT: HighGrowthInputs = {
  currentEbit: 0, currentInterestExpense: 0, currentCapex: 0,
  currentDepreciation: 0, currentRevenue: 0,
  currentWorkingCapital: 0, priorWorkingCapital: 0,
  bookValueOfDebt: 0, bookValueOfEquity: 0, cash: 0, nonOperatingAssets: 0,
  sharesOutstanding: 1, currentStockPrice: 0,
  nolCarryForward: 0, marginalTaxRate: 0.25,
  hasLease: false, hasRd: false, leaseDebtValue: 0, leaseOpIncomeAdjustment: 0, rdOpIncomeAdjustment: 0,
  currentBeta: 1.2, currentCostOfDebt: 0.05, currentMarketValueOfDebt: 0,
  riskFreeRate: 0.04, marketRiskPremium: 0.05,
  enterGrowthPerYear: true,
  revenueGrowthByYear: [0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.05],
  compoundedAnnualGrowth: 0.25,
  useCurrentWcPercent: false, workingCapitalPercentOfRevenue: 5,
  capexApproach: 3, salesToCapitalRatio: 3,
  stableGrowthRate: 0.03, stableOperatingMargin: 0.15,
  stableDebtRatio: 0.3, stableBeta: 1.1, stableCostOfDebt: 0.05, stableRoc: 0.15,
  hasOptions: false, optionCount: 0, optionStrike: 0, optionMaturity: 5, optionVolatility: 0.5,
  convergenceSpeed: 1.5,
}

export default function HighGrowthValuation() {
  const [inputs, setInputs] = useState<HighGrowthInputs>(DEFAULT)
  const [selectedCountryRisk, setSelectedCountryRisk] = useState<CountryRiskRecord | null>(null)
  const [result, setResult] = useState<ReturnType<typeof computeHighGrowthValuation> | null>(null)
  const resultRef = useAutoScrollResult(result)

  const handleAutoFill = useCallback((data: YahooFinanceData) => {
    setInputs(prev => ({
      ...prev,
      currentRevenue: data.totalRevenue || data.revenue || 0,
      currentEbit: data.operatingIncome || data.ebit || 0,
      currentInterestExpense: data.interestExpense || 0,
      bookValueOfDebt: data.totalDebt || 0,
      bookValueOfEquity: data.totalEquity || 0,
      cash: data.totalCash || 0,
      sharesOutstanding: data.sharesOutstanding || 1,
      currentStockPrice: data.price || 0,
      currentBeta: data.beta || 1.2,
    }))
  }, [])

  const handleCountryRiskApply = useCallback((risk: CountryRiskRecord) => {
    setSelectedCountryRisk(risk)
    setInputs(prev => ({
      ...prev,
      marketRiskPremium: risk.totalEquityRiskPremium,
      marginalTaxRate: risk.taxRate ?? prev.marginalTaxRate,
    }))
  }, [])

  const update = (key: keyof HighGrowthInputs, value: any) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <div className="calc-page"><div className="container">
      <h1>High Growth Valuation</h1>
      <p className="page-desc">For companies with negative earnings or high growth. 10-year DCF with NOL carryforward and per-year growth rates.</p>
      <p className="page-desc-thai">สำหรับบริษัทที่ขาดทุนหรือเติบโตสูง — โมเดล DCF 10 ปี พร้อม NOL และอัตราเติบโตรายปี</p>
      <TickerSearch onData={handleAutoFill} onCountryRiskApply={handleCountryRiskApply} />
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Current Financials <span className="thai-sub">ข้อมูลการเงินปัจจุบัน</span></h2>
          <div className="input-section">
            <FormField label="Revenue" hint="รายได้จากการขาย" source="auto" value={inputs.currentRevenue} onChange={v => update('currentRevenue', v)} />
            <FormField label="EBIT" hint="กำไรจากการดำเนินงานก่อนดอกเบี้ยและภาษี" source="auto" value={inputs.currentEbit} onChange={v => update('currentEbit', v)} />
            <FormField label="Depreciation" hint="ค่าเสื่อมราคา" source="user" value={inputs.currentDepreciation} onChange={v => update('currentDepreciation', v)} />
            <FormField label="CapEx" hint="ค่าใช้จ่ายลงทุน" source="user" value={inputs.currentCapex} onChange={v => update('currentCapex', v)} />
            <FormField label="BV of Equity" hint="มูลค่าตามบัญชีส่วนผู้ถือหุ้น" source="auto" value={inputs.bookValueOfEquity} onChange={v => update('bookValueOfEquity', v)} />
            <FormField label="BV of Debt" hint="มูลค่าตามบัญชีหนี้สิน" source="auto" value={inputs.bookValueOfDebt} onChange={v => update('bookValueOfDebt', v)} />
            <FormField label="Cash" hint="เงินสด" source="auto" value={inputs.cash} onChange={v => update('cash', v)} />
            <FormField label="Shares" hint="จำนวนหุ้นที่ชำระแล้ว" source="auto" value={inputs.sharesOutstanding} onChange={v => update('sharesOutstanding', v)} />
            <FormField label="Stock Price" hint="ราคาหุ้นปัจจุบัน" source="auto" value={inputs.currentStockPrice} onChange={v => update('currentStockPrice', v)} step={0.01} />
          </div>
          <CountryRiskPanel
            risk={selectedCountryRisk}
            applied={!!selectedCountryRisk}
            compact
            note="Country ERP and tax rate were applied to the high-growth assumptions."
          />
          <h2>Growth Assumptions <span className="thai-sub">สมมติฐานการเติบโต</span></h2>
          <div className="input-section">
            <FormField label="Enter growth per year" hint="ระบุอัตราเติบโตทีละปี" source="user" type="checkbox" value={inputs.enterGrowthPerYear ? 1 : 0} onChange={v => update('enterGrowthPerYear', v === 1)} checked={inputs.enterGrowthPerYear} />
            {inputs.enterGrowthPerYear && inputs.revenueGrowthByYear.map((g, i) => (
              <div key={i}>
                <FormField label={`Year ${i + 1} Revenue Growth`} hint={`อัตราเติบโตรายได้ปีที่ ${i + 1}`} source="user" value={g} onChange={v => {
                  const newGrowth = [...inputs.revenueGrowthByYear]
                  newGrowth[i] = v
                  update('revenueGrowthByYear', newGrowth)
                }} step={0.01} />
              </div>
            ))}
            <FormField label="Target Operating Margin" hint="อัตรากำไรจากการดำเนินงานเป้าหมาย" source="user" value={inputs.stableOperatingMargin} onChange={v => update('stableOperatingMargin', v)} step={0.01} />
            <FormField label="NOL Carryforward" hint="ขาดทุนสะสมที่นำไปลดหย่อนภาษีได้" source="user" value={inputs.nolCarryForward} onChange={v => update('nolCarryForward', v)} />
            <FormField label="Sales/Capital Ratio" hint="อัตราส่วนรายได้ต่อเงินลงทุน" source="user" value={inputs.salesToCapitalRatio} onChange={v => update('salesToCapitalRatio', v)} step={0.1} />
          </div>
          <h2>Stable Growth <span className="thai-sub">ช่วงเติบโตคงที่</span></h2>
          <div className="input-section">
            <FormField label="Perpetual Growth Rate" hint="อัตราเติบโตตลอดกาล" source="user" value={inputs.stableGrowthRate} onChange={v => update('stableGrowthRate', v)} step={0.01} />
            <FormField label="Stable Beta" hint="ค่า Beta ในช่วงคงที่" source="user" value={inputs.stableBeta} onChange={v => update('stableBeta', v)} step={0.01} />
            <FormField label="Stable Debt Ratio" hint="สัดส่วนหนี้ในช่วงคงที่" source="user" value={inputs.stableDebtRatio} onChange={v => update('stableDebtRatio', v)} step={0.01} />
            <FormField label="Stable ROC" hint="อัตราผลตอบแทนเงินลงทุนในช่วงคงที่" source="user" value={inputs.stableRoc} onChange={v => update('stableRoc', v)} step={0.01} />
            <FormField label="Risk-free Rate" hint="อัตราดอกเบี้ยไม่มีความเสี่ยง" source="default" value={inputs.riskFreeRate} onChange={v => update('riskFreeRate', v)} step={0.01} />
            <FormField label="Market Risk Premium" hint="ค่าเบี้ยประกันความเสี่ยงตลาด" source="user" value={inputs.marketRiskPremium} onChange={v => update('marketRiskPremium', v)} step={0.01} />
          </div>
          <button onClick={() => setResult(computeHighGrowthValuation(inputs))} className="btn-primary calc-btn">Calculate Valuation <span className="thai-sub">คำนวณมูลค่า</span></button>
        </div>
        {result && (
          <div className="calc-results" ref={resultRef}>
            <h2>Valuation Result <span className="thai-sub">ผลการประเมินมูลค่า</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Value per Share <span className="thai-sub">มูลค่าต่อหุ้น</span></span>
                <span className="result-value">{result.valuePerShare.toFixed(2)}</span>
                <span className="result-compare">vs. Market: {inputs.currentStockPrice.toFixed(2)}</span>
              </div>
              <div className="result-card"><span className="result-label">PV of Cash Flows <span className="thai-sub">มูลค่าปัจจุบันกระแสเงินสด</span></span><span className="result-number">{fmtCompact(result.pvCashFlows)}</span></div>
              <div className="result-card"><span className="result-label">PV of Terminal Value <span className="thai-sub">มูลค่าปัจจุบันมูลค่าตัวท้าย</span></span><span className="result-number">{fmtCompact(result.pvTerminalValue)}</span></div>
              <div className="result-card"><span className="result-label">Operating Asset Value <span className="thai-sub">มูลค่าสินทรัพย์ดำเนินงาน</span></span><span className="result-number">{fmtCompact(result.valueOfOperatingAssets)}</span></div>
            </div>
            <ProjectionChart data={result.years} title="High-Growth Fade Forecast" />
            <h3>10-Year Projection <span className="thai-sub">โปรเจคชัน 10 ปี</span></h3>
            <div className="table-scroll">
              <table>
                <thead><tr><th></th><th>Y1</th><th>Y2</th><th>Y3</th><th>Y4</th><th>Y5</th><th>Y6</th><th>Y7</th><th>Y8</th><th>Y9</th><th>Y10</th></tr></thead>
                <tbody>
                  <tr><td className="row-label">Revenue</td>{result.years.map(y => <td key={y.year}>{fmtCompact(y.revenue)}</td>)}</tr>
                  <tr><td className="row-label">Op Margin</td>{result.years.map(y => <td key={y.year}>{fmtPercent(y.operatingMargin)}</td>)}</tr>
                  <tr><td className="row-label">EBIT</td>{result.years.map(y => <td key={y.year}>{fmtCompact(y.ebit)}</td>)}</tr>
                  <tr><td className="row-label">EBIT(1-t)</td>{result.years.map(y => <td key={y.year}>{fmtCompact(y.ebitAfterTax)}</td>)}</tr>
                  <tr><td className="row-label">NOL</td>{result.years.map(y => <td key={y.year}>{fmtCompact(y.nol)}</td>)}</tr>
                  <tr><td className="row-label">FCFF</td>{result.years.map(y => <td key={y.year}>{fmtCompact(y.fcff)}</td>)}</tr>
                  <tr><td className="row-label">Cost of Capital</td>{result.years.map(y => <td key={y.year}>{fmtPercent(y.costOfCapital)}</td>)}</tr>
                  <tr><td className="row-label">ROIC</td>{result.years.map(y => <td key={y.year}>{fmtPercent(y.roic)}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
