import { useState, useCallback } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import type { CountryRiskRecord } from '../data/countryRiskLatest'
import type { FcffSimpleInputs } from '../engines/fcffSimpleDcf'
import { computeFcffSimpleDcf } from '../engines/fcffSimpleDcf'
import TickerSearch from '../components/TickerSearch'
import FormField from '../components/FormField'
import ProjectionChart from '../components/ProjectionChart'
import CountryRiskPanel from '../components/CountryRiskPanel'
import { fmtNumber, fmtPercent, fmtCompact } from '../utils/format'
import useAutoScrollResult from '../hooks/useAutoScrollResult'
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
  const [selectedCountryRisk, setSelectedCountryRisk] = useState<CountryRiskRecord | null>(null)
  const [result, setResult] = useState<ReturnType<typeof computeFcffSimpleDcf> | null>(null)
  const resultRef = useAutoScrollResult(result)

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

  const handleCountryRiskApply = useCallback((risk: CountryRiskRecord) => {
    setSelectedCountryRisk(risk)
    setInputs(prev => ({
      ...prev,
      effectiveTaxRate: risk.taxRate ?? prev.effectiveTaxRate,
      marginalTaxRate: risk.taxRate ?? prev.marginalTaxRate,
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
        <p className="page-desc-thai">โมเดลกระแสเงินสดอิสระของบริษัท 10 ปี — ดึงข้อมูลการเงินอัตโนมัติ ตั้งสมมติฐาน คำนวณมูลค่าหุ้นที่แท้จริง</p>

        <TickerSearch onData={(data) => handleAutoFill(data)} onCountryRiskApply={handleCountryRiskApply} />

        <div className="calc-grid">
          <div className="calc-inputs">
            <h2>Financial Data <span className="thai-sub">ข้อมูลการเงิน</span></h2>
            <div className="input-section">
              <FormField label="Revenue" hint="รายได้จากการขาย" source="auto" value={inputs.revenue} onChange={v => update('revenue', v)} />
              <FormField label="Operating Income (EBIT)" hint="กำไรจากการดำเนินงานก่อนดอกเบี้ยและภาษี" source="auto" value={inputs.operatingIncome} onChange={v => update('operatingIncome', v)} />
              <FormField label="Interest Expense" hint="ค่าใช้จ่ายดอกเบี้ย" source="auto" value={inputs.interestExpense} onChange={v => update('interestExpense', v)} />
              <FormField label="Book Value of Equity" hint="มูลค่าตามบัญชีของส่วนของผู้ถือหุ้น" source="auto" value={inputs.bookValueOfEquity} onChange={v => update('bookValueOfEquity', v)} />
              <FormField label="Book Value of Debt" hint="มูลค่าตามบัญชีของหนี้สิน" source="auto" value={inputs.bookValueOfDebt} onChange={v => update('bookValueOfDebt', v)} />
              <FormField label="Cash & Securities" hint="เงินสดและหลักทรัพย์ที่ลงทุนได้" source="auto" value={inputs.cashAndMarketableSecurities} onChange={v => update('cashAndMarketableSecurities', v)} />
              <FormField label="Shares Outstanding" hint="จำนวนหุ้นที่ออกและชำระแล้ว" source="auto" value={inputs.sharesOutstanding} onChange={v => update('sharesOutstanding', v)} />
              <FormField label="Stock Price" hint="ราคาหุ้นปัจจุบัน" source="auto" value={inputs.currentStockPrice} onChange={v => update('currentStockPrice', v)} step={0.01} />
              <FormField label="Effective Tax Rate" hint="อัตราภาษีเฉลี่ยที่จ่ายจริง" source="default" value={inputs.effectiveTaxRate} onChange={v => update('effectiveTaxRate', v)} step={0.01} />
            </div>
            <CountryRiskPanel
              risk={selectedCountryRisk}
              applied={!!selectedCountryRisk}
              compact
              note="Country tax rate was applied. Run WACC Calculator for a full country-adjusted ERP and cost of capital."
            />

            <h2>Growth Assumptions <span className="thai-sub">สมมติฐานการเติบโต</span></h2>
            <div className="input-section">
              <FormField label="Revenue Growth - Year 1" hint="อัตราเติบโตของรายได้ปีแรก" source="user" value={inputs.revenueGrowthYear1} onChange={v => update('revenueGrowthYear1', v)} step={0.01} />
              <FormField label="Revenue Growth - Years 2-5" hint="อัตราเติบโตของรายได้ปีที่ 2-5" source="user" value={inputs.revenueGrowthYears2to5} onChange={v => update('revenueGrowthYears2to5', v)} step={0.01} />
              <FormField label="Operating Margin - Next Year" hint="อัตรากำไรจากการดำเนินงานปีถัดไป" source="default" value={inputs.operatingMarginNextYear} onChange={v => update('operatingMarginNextYear', v)} step={0.01} />
              <FormField label="Target Operating Margin" hint="อัตรากำไรจากการดำเนินงานเป้าหมาย" source="default" value={inputs.targetOperatingMargin} onChange={v => update('targetOperatingMargin', v)} step={0.01} />
              <FormField label="Year of Convergence" hint="จำนวนปีที่อัตรากำไรจะลู่เข้าสู่เป้าหมาย" source="user" value={inputs.yearOfConvergence} onChange={v => update('yearOfConvergence', v)} />
              <FormField label="Sales/Capital Ratio (Yr 1-5)" hint="อัตราส่วนรายได้ต่อเงินลงทุนปีที่ 1-5" source="user" value={inputs.salesToCapitalRatioYears1to5} onChange={v => update('salesToCapitalRatioYears1to5', v)} step={0.1} />
              <FormField label="Sales/Capital Ratio (Yr 6-10)" hint="อัตราส่วนรายได้ต่อเงินลงทุนปีที่ 6-10" source="user" value={inputs.salesToCapitalRatioYears6to10} onChange={v => update('salesToCapitalRatioYears6to10', v)} step={0.1} />
            </div>

            <h2>Discount Rate <span className="thai-sub">อัตราคิดลด</span></h2>
            <div className="input-section">
              <FormField label="Risk-free Rate" hint="อัตราดอกเบี้ยไม่มีความเสี่ยง (พันธบัตรรัฐบาล)" source="default" value={inputs.riskFreeRate} onChange={v => update('riskFreeRate', v)} step={0.01} />
              <FormField label="Cost of Capital (from WACC)" hint="ต้นทุนทุนถัวเฉลี่ยถ่วงน้ำหนัก" source="user" value={inputs.costOfCapital} onChange={v => update('costOfCapital', v)} step={0.01} />
              <FormField label="Marginal Tax Rate" hint="อัตราภาษีขั้นสูง" source="default" value={inputs.marginalTaxRate} onChange={v => update('marginalTaxRate', v)} step={0.01} />
            </div>

            <div className="input-section">
              <FormField label="Employee Options Outstanding" hint="สิทธิ์ซื้อหุ้นพนักงานที่ยังไม่ได้ใช้" source="user" type="checkbox" value={inputs.hasOptions ? 1 : 0} onChange={v => update('hasOptions', v === 1)} checked={inputs.hasOptions} />
              {inputs.hasOptions && <>
                <FormField label="Number of Options" hint="จำนวนสิทธิ์ซื้อหุ้น" source="user" value={inputs.optionCount} onChange={v => update('optionCount', v)} />
                <FormField label="Avg Strike Price" hint="ราคาใช้สิทธิ์เฉลี่ย" source="user" value={inputs.optionStrike} onChange={v => update('optionStrike', v)} step={0.01} />
              </>}
            </div>

            <button onClick={compute} className="btn-primary calc-btn">Calculate Valuation <span className="thai-sub">คำนวณมูลค่า</span></button>
          </div>

          {result && (
            <div className="calc-results" ref={resultRef}>
              <h2>Valuation Result <span className="thai-sub">ผลการประเมินมูลค่า</span></h2>
              <div className="result-summary">
                <div className="result-card result-card-main">
                  <span className="result-label">Value per Share <span className="thai-sub">มูลค่าต่อหุ้น</span></span>
                  <span className="result-value">{result.valuePerShare.toFixed(2)}</span>
                  <span className="result-compare">
                    vs. Market Price: {inputs.currentStockPrice.toFixed(2)}
                    {' '}({fmtPercent(result.valuePerShare / inputs.currentStockPrice - 1)} {result.valuePerShare > inputs.currentStockPrice ? 'undervalued' : 'overvalued'})
                  </span>
                </div>
                <div className="result-card">
                  <span className="result-label">PV of Cash Flows <span className="thai-sub">มูลค่าปัจจุบันของกระแสเงินสด</span></span>
                  <span className="result-number">{fmtCompact(result.pvCashFlows)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">PV of Terminal Value <span className="thai-sub">มูลค่าปัจจุบันของมูลค่าตัวท้าย</span></span>
                  <span className="result-number">{fmtCompact(result.pvTerminalValue)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">Operating Asset Value <span className="thai-sub">มูลค่าสินทรัพย์จากการดำเนินงาน</span></span>
                  <span className="result-number">{fmtCompact(result.valueOfOperatingAssets)}</span>
                </div>
                <div className="result-card">
                  <span className="result-label">Equity Value <span className="thai-sub">มูลค่าส่วนของผู้ถือหุ้น</span></span>
                  <span className="result-number">{fmtCompact(result.valueOfEquity)}</span>
                </div>
              </div>

              <ProjectionChart data={result.years} title="10-Year Operating Forecast" />

              <h3>Diagnostics <span className="thai-sub">การวิเคราะห์เชิงลึก</span></h3>
              <div className="diagnostics">
                <div className="diag-item"><span>Revenue Y10 <span className="thai-sub">รายได้ปีที่ 10</span></span><span>{fmtCompact(result.diagnostics.revenueYear10)}</span></div>
                <div className="diag-item"><span>EBIT Y10 <span className="thai-sub">กำไรดำเนินงานปีที่ 10</span></span><span>{fmtCompact(result.diagnostics.ebitYear10)}</span></div>
                <div className="diag-item"><span>ROIC Y10 <span className="thai-sub">อัตราผลตอบแทนเงินลงทุนปีที่ 10</span></span><span>{fmtPercent(result.diagnostics.roicYear10)}</span></div>
                <div className="diag-item"><span>Cost of Capital Y10 <span className="thai-sub">ต้นทุนทุนปีที่ 10</span></span><span>{fmtPercent(result.diagnostics.costOfCapitalYear10)}</span></div>
                <div className="diag-item"><span>Terminal Growth <span className="thai-sub">อัตราเติบโตตัวท้าย</span></span><span>{fmtPercent(result.diagnostics.terminalGrowthRate)}</span></div>
              </div>

              <h3>10-Year Projection <span className="thai-sub">โปรเจคชัน 10 ปี</span></h3>
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
