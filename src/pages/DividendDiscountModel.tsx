import { useState } from 'react'
import { computeTwoStageDdm, type DdmInputs } from '../engines/equityModels'
import { fmtCompact, fmtPercent } from '../utils/format'
import useAutoScrollResult from '../hooks/useAutoScrollResult'
import './CalculatorPage.css'

const DEFAULT: DdmInputs = {
  currentDividend: 2,
  expectedGrowth: 0.06,
  stableGrowth: 0.03,
  costOfEquity: 0.085,
  highGrowthYears: 5,
}

export default function DividendDiscountModel() {
  const [inputs, setInputs] = useState<DdmInputs>(DEFAULT)
  const [result, setResult] = useState<ReturnType<typeof computeTwoStageDdm> | null>(null)
  const resultRef = useAutoScrollResult(result)
  const update = (key: keyof DdmInputs, value: number) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <div className="calc-page"><div className="container">
      <h1>Dividend Discount Model</h1>
      <p className="page-desc">Two-stage DDM for mature companies with regular, defensible dividends.</p>
      <p className="page-desc-thai">โมเดลปันผลสองช่วง สำหรับบริษัทที่จ่ายปันผลสม่ำเสมอและคาดการณ์ได้</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Dividend Assumptions <span className="thai-sub">สมมติฐานปันผล</span></h2>
          <div className="input-section">
            <label>Current Dividend / Share <span className="thai-sub">ปันผลต่อหุ้นปัจจุบัน</span></label>
            <input type="number" value={inputs.currentDividend} onChange={e => update('currentDividend', parseFloat(e.target.value) || 0)} />
            <label>High-growth Dividend Growth <span className="thai-sub">อัตราเติบโตปันผลช่วงแรก</span></label>
            <input type="number" step="0.01" value={inputs.expectedGrowth} onChange={e => update('expectedGrowth', parseFloat(e.target.value) || 0)} />
            <label>Stable Growth <span className="thai-sub">อัตราเติบโตระยะยาว</span></label>
            <input type="number" step="0.01" value={inputs.stableGrowth} onChange={e => update('stableGrowth', parseFloat(e.target.value) || 0)} />
            <label>Cost of Equity <span className="thai-sub">ต้นทุนทุนส่วนผู้ถือหุ้น</span></label>
            <input type="number" step="0.01" value={inputs.costOfEquity} onChange={e => update('costOfEquity', parseFloat(e.target.value) || 0)} />
            <label>High-growth Years <span className="thai-sub">จำนวนปีช่วงเติบโต</span></label>
            <input type="number" value={inputs.highGrowthYears} onChange={e => update('highGrowthYears', parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={() => setResult(computeTwoStageDdm(inputs))} className="btn-primary calc-btn">Calculate DDM <span className="thai-sub">คำนวณมูลค่าจากปันผล</span></button>
        </div>
        {result && (
          <div className="calc-results" ref={resultRef}>
            <h2>DDM Result <span className="thai-sub">ผลการประเมินด้วยปันผล</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Value per Share <span className="thai-sub">มูลค่าต่อหุ้น</span></span>
                <span className="result-value">{result.valuePerShare.toFixed(2)}</span>
                <span className="result-compare">CoE {fmtPercent(inputs.costOfEquity)} · g {fmtPercent(inputs.stableGrowth)}</span>
              </div>
              <div className="result-card"><span className="result-label">PV Dividends</span><span className="result-number">{fmtCompact(result.pvHighGrowthDividends)}</span></div>
              <div className="result-card"><span className="result-label">PV Terminal Value</span><span className="result-number">{fmtCompact(result.pvTerminalValue)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
