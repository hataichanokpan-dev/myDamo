import { useState } from 'react'
import type { RdInputs } from '../engines/leaseConverter'
import { computeRdConversion } from '../engines/leaseConverter'
import { fmtCompact } from '../utils/format'
import './CalculatorPage.css'

export default function RdConverter() {
  const [inputs, setInputs] = useState<RdInputs>({
    currentYearRd: 5000,
    amortizableLife: 5,
    historicalRd: [
      { yearsAgo: 5, rdExpense: 3000 },
      { yearsAgo: 4, rdExpense: 3500 },
      { yearsAgo: 3, rdExpense: 4000 },
      { yearsAgo: 2, rdExpense: 4500 },
      { yearsAgo: 1, rdExpense: 4800 },
    ],
    taxRate: 0.25,
  })
  const [result, setResult] = useState<ReturnType<typeof computeRdConversion> | null>(null)

  const update = (key: keyof RdInputs, value: any) => setInputs(prev => ({ ...prev, [key]: value }))
  const updateHistorical = (idx: number, value: number) => {
    const newHist = [...inputs.historicalRd]
    newHist[idx] = { ...newHist[idx], rdExpense: value }
    update('historicalRd', newHist)
  }

  return (
    <div className="calc-page"><div className="container">
      <h1>R&D Converter</h1>
      <p className="page-desc">Capitalize R&D expenses into assets. Adjusts operating income upward by (Current R&D - Amortization).</p>
      <p className="page-desc-thai">ทุนค่าใช้จ่าย R&D เป็นสินทรัพย์ — ปรับกำไรจากการดำเนินงานตาม (R&D ปัจจุบัน - ค่าเสื่อมราคา)</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>R&D Inputs <span className="thai-sub">ข้อมูล R&D</span></h2>
          <div className="input-section">
            <label>Current Year R&D Expense <span className="thai-sub">ค่าใช้จ่าย R&D ปีปัจจุบัน</span></label>
            <input type="number" value={inputs.currentYearRd} onChange={e => update('currentYearRd', parseFloat(e.target.value) || 0)} />
            <label>Amortizable Life (years) <span className="thai-sub">อายุการผ่อนหนี้ (ปี)</span></label>
            <input type="number" value={inputs.amortizableLife} onChange={e => update('amortizableLife', parseInt(e.target.value) || 1)} />
          </div>
          <h2>Historical R&D <span className="thai-sub">R&D ย้อนหลัง</span></h2>
          <div className="input-section">
            {inputs.historicalRd.map((h, i) => (
              <div key={i}>
                <label>{h.yearsAgo} year(s) ago <span className="thai-sub">เมื่อ {h.yearsAgo} ปีก่อน</span></label>
                <input type="number" value={h.rdExpense} onChange={e => updateHistorical(i, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>
          <button onClick={() => setResult(computeRdConversion(inputs))} className="btn-primary calc-btn">Convert R&D <span className="thai-sub">แปลง R&D</span></button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>R&D Conversion Result <span className="thai-sub">ผลการแปลง R&D</span></h2>
            <div className="result-summary">
              <div className="result-card"><span className="result-label">Unamortized R&D Asset <span className="thai-sub">สินทรัพย์ R&D ที่ยังไม่หมดอายุ</span></span><span className="result-number">{fmtCompact(result.totalUnamortizedRd)}</span></div>
              <div className="result-card"><span className="result-label">Annual Amortization <span className="thai-sub">ค่าผ่อนประจำปี</span></span><span className="result-number">{fmtCompact(result.currentYearAmortization)}</span></div>
              <div className="result-card result-card-main">
                <span className="result-label">Adjustment to Operating Income <span className="thai-sub">การปรับกำไรจากการดำเนินงาน</span></span>
                <span className="result-value">{result.adjustmentToOperatingIncome > 0 ? '+' : ''}{fmtCompact(result.adjustmentToOperatingIncome)}</span>
                <span className="result-compare">Current R&D - Amortization</span>
              </div>
              <div className="result-card"><span className="result-label">Adjustment to Equity <span className="thai-sub">การปรับส่วนของผู้ถือหุ้น</span></span><span className="result-number">{fmtCompact(result.adjustmentToEquity)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
