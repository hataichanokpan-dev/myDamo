import { useState, useCallback } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import type { WaccInputs } from '../engines/waccCalculator'
import { computeWacc } from '../engines/waccCalculator'
import TickerSearch from '../components/TickerSearch'
import FormField from '../components/FormField'
import { fmtPercent, fmtCompact } from '../utils/format'
import './CalculatorPage.css'

const DEFAULT: WaccInputs = {
  betaApproach: 'bottom-up-single', regressionBeta: 1, directInputBeta: 1.2,
  unleveredBeta: 1, debtToEquityRatio: 0.3, taxRateForBeta: 0.25,
  erpApproach: 'direct', directErp: 0.0575, riskFreeRate: 0.04,
  bookValueOfDebt: 0, interestExpense: 0, averageMaturity: 3,
  costOfDebtApproach: 'direct', directCostOfDebt: 0.04,
  rating: 'Baa2/BBB', syntheticCompanyType: 1, operatingIncome: 0,
  hasLeases: false, leaseCommitments: [], leaseBeyondYear5: 0, preTaxCostOfDebt: 0.04,
  taxRateApproach: 'direct', taxRate: 0.25, marginalTaxRate: 0.25,
  bookValueOfConvertible: 0, interestOnConvertible: 0,
  convertibleMaturity: 0, marketValueOfConvertible: 0,
  preferredShares: 0, preferredPrice: 0, preferredDividend: 0,
  sharesOutstanding: 1, marketPricePerShare: 0,
}

const BETA_OPTIONS = [
  { value: 'direct', label: 'Direct Input' },
  { value: 'bottom-up-single', label: 'Bottom-up (Single Business)' },
  { value: 'regression', label: 'Regression Beta' },
]

export default function WaccCalculator() {
  const [inputs, setInputs] = useState<WaccInputs>(DEFAULT)
  const [result, setResult] = useState<ReturnType<typeof computeWacc> | null>(null)

  const handleAutoFill = useCallback((data: YahooFinanceData) => {
    setInputs(prev => ({
      ...prev,
      sharesOutstanding: data.sharesOutstanding || 1,
      marketPricePerShare: data.price || 0,
      bookValueOfDebt: data.totalDebt || 0,
      operatingIncome: data.operatingIncome || 0,
      interestExpense: data.interestExpense || 0,
      unleveredBeta: data.beta || 1,
      regressionBeta: data.beta || 1,
    }))
  }, [])

  const update = (key: keyof WaccInputs, value: any) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <div className="calc-page"><div className="container">
      <h1>WACC Calculator</h1>
      <p className="page-desc">Compute Weighted Average Cost of Capital with beta estimation, ERP, cost of debt, and operating lease adjustments.</p>
      <p className="page-desc-thai">คำนวณต้นทุนทุนถัวเฉลี่ยถ่วงน้ำหนัก — ประเมิน Beta, ERP, ต้นทุนหนี้ และปรับสัญญาเช่า</p>
      <TickerSearch onData={handleAutoFill} />
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Market Data <span className="thai-sub">ข้อมูลตลาด</span></h2>
          <div className="input-section">
            <FormField label="Shares Outstanding" hint="จำนวนหุ้นที่ชำระแล้ว" source="auto" value={inputs.sharesOutstanding} onChange={v => update('sharesOutstanding', v)} />
            <FormField label="Market Price" hint="ราคาหุ้นในตลาด" source="auto" value={inputs.marketPricePerShare} onChange={v => update('marketPricePerShare', v)} step={0.01} />
            <FormField label="Risk-free Rate" hint="อัตราดอกเบี้ยไม่มีความเสี่ยง" source="default" value={inputs.riskFreeRate} onChange={v => update('riskFreeRate', v)} step={0.01} />
            <FormField label="Equity Risk Premium" hint="ค่าเบี้ยประกันความเสี่ยงหุ้น" source="user" value={inputs.directErp} onChange={v => update('directErp', v)} step={0.01} />
          </div>
          <h2>Beta <span className="thai-sub">ความเสี่ยงเชิงระบบ</span></h2>
          <div className="input-section">
            <FormField label="Approach" hint="วิธีคำนวณ Beta" source="user" type="select" value={BETA_OPTIONS.findIndex(o => o.value === inputs.betaApproach)} onChange={v => {
              const opt = BETA_OPTIONS[v]
              if (opt) update('betaApproach', opt.value)
            }} options={BETA_OPTIONS.map((o, i) => ({ value: String(i), label: o.label }))} />
            <FormField label="Unlevered Beta" hint="Beta ก่อนปรับหนี้ (Bottom-up)" source="user" value={inputs.unleveredBeta} onChange={v => update('unleveredBeta', v)} step={0.01} />
            <FormField label="Debt/Equity Ratio" hint="สัดส่วนหนี้ต่อส่วนของผู้ถือหุ้น" source="user" value={inputs.debtToEquityRatio} onChange={v => update('debtToEquityRatio', v)} step={0.01} />
          </div>
          <h2>Debt <span className="thai-sub">หนี้สิน</span></h2>
          <div className="input-section">
            <FormField label="Book Value of Debt" hint="มูลค่าตามบัญชีของหนี้สิน" source="auto" value={inputs.bookValueOfDebt} onChange={v => update('bookValueOfDebt', v)} />
            <FormField label="Interest Expense" hint="ค่าใช้จ่ายดอกเบี้ย" source="auto" value={inputs.interestExpense} onChange={v => update('interestExpense', v)} />
            <FormField label="Avg Maturity (years)" hint="อายุเฉลี่ยของหนี้ (ปี)" source="user" value={inputs.averageMaturity} onChange={v => update('averageMaturity', v)} />
            <FormField label="Pre-tax Cost of Debt" hint="ต้นทุนหนี้ก่อนภาษี" source="user" value={inputs.directCostOfDebt} onChange={v => update('directCostOfDebt', v)} step={0.01} />
          </div>
          <h2>Tax <span className="thai-sub">ภาษี</span></h2>
          <div className="input-section">
            <FormField label="Tax Rate" hint="อัตราภาษี" source="user" value={inputs.taxRate} onChange={v => update('taxRate', v)} step={0.01} />
          </div>
          <button onClick={() => setResult(computeWacc(inputs))} className="btn-primary calc-btn">Calculate WACC <span className="thai-sub">คำนวณ WACC</span></button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>WACC Result <span className="thai-sub">ผลการคำนวณ WACC</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">WACC <span className="thai-sub">ต้นทุนทุนถัวเฉลี่ยถ่วงน้ำหนัก</span></span>
                <span className="result-value">{fmtPercent(result.wacc)}</span>
                <span></span>
              </div>
              <div className="result-card"><span className="result-label">Cost of Equity <span className="thai-sub">ต้นทุนทุนส่วนของผู้ถือหุ้น</span></span><span className="result-number">{fmtPercent(result.costOfEquity)}</span></div>
              <div className="result-card"><span className="result-label">Levered Beta <span className="thai-sub">Beta หลังปรับหนี้</span></span><span className="result-number">{result.leveredBeta.toFixed(3)}</span></div>
              <div className="result-card"><span className="result-label">After-tax Cost of Debt <span className="thai-sub">ต้นทุนหนี้หลังภาษี</span></span><span className="result-number">{fmtPercent(result.afterTaxCostOfDebt)}</span></div>
              <div className="result-card"><span className="result-label">Equity Weight <span className="thai-sub">น้ำหนักส่วนผู้ถือหุ้น</span></span><span className="result-number">{fmtPercent(result.equityWeight)}</span></div>
              <div className="result-card"><span className="result-label">Debt Weight <span className="thai-sub">น้ำหนักหนี้สิน</span></span><span className="result-number">{fmtPercent(result.debtWeight)}</span></div>
              {result.debtValueOfLeases > 0 && (
                <div className="result-card"><span className="result-label">Lease Debt Value <span className="thai-sub">มูลค่าหนี้สัญญาเช่า</span></span><span className="result-number">{fmtCompact(result.debtValueOfLeases)}</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
