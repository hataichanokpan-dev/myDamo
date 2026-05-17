import { useState } from 'react'
import { computeImpliedRoc } from '../engines/leaseConverter'
import { fmtPercent } from '../utils/format'
import './CalculatorPage.css'

export default function ImpliedRocRoe() {
  const [ebitAfterTax, setEbitAfterTax] = useState(1035)
  const [fcff, setFcff] = useState(750)
  const [growthRate, setGrowthRate] = useState(0.04)
  const [costOfCapital, setCostOfCapital] = useState(0.0935)
  const [result, setResult] = useState<ReturnType<typeof computeImpliedRoc> | null>(null)

  const compute = () => setResult(computeImpliedRoc(ebitAfterTax, fcff, growthRate, costOfCapital))

  return (
    <div className="calc-page"><div className="container">
      <h1>Implied ROC/ROE</h1>
      <p className="page-desc">Sanity check: what return on capital does your terminal value imply?</p>
      <p className="page-desc-thai">ตรวจสอบ: มูลค่าตัวท้ายของคุณสื่อถึงอัตราผลตอบแทนเงินลงทุนเท่าไหร่?</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Terminal Year Inputs <span className="thai-sub">ข้อมูลปีตัวท้าย</span></h2>
          <div className="input-section">
            <label>EBIT(1-t) in Terminal Year <span className="thai-sub">กำไรดำเนินงานหลังภาษีปีตัวท้าย</span></label>
            <input type="number" value={ebitAfterTax} onChange={e => setEbitAfterTax(parseFloat(e.target.value) || 0)} />
            <label>FCFF in Terminal Year <span className="thai-sub">กระแสเงินสดอิสระปีตัวท้าย</span></label>
            <input type="number" value={fcff} onChange={e => setFcff(parseFloat(e.target.value) || 0)} />
            <label>Perpetual Growth Rate <span className="thai-sub">อัตราเติบโตตลอดกาล</span></label>
            <input type="number" step="0.01" value={growthRate} onChange={e => setGrowthRate(parseFloat(e.target.value) || 0)} />
            <label>Cost of Capital (perpetuity) <span className="thai-sub">ต้นทุนทุน (ตลอดกาล)</span></label>
            <input type="number" step="0.01" value={costOfCapital} onChange={e => setCostOfCapital(parseFloat(e.target.value) || 0)} />
          </div>
          <button onClick={compute} className="btn-primary calc-btn">Calculate <span className="thai-sub">คำนวณ</span></button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>Result <span className="thai-sub">ผลลัพธ์</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Implied ROC <span className="thai-sub">อัตราผลตอบแทนเงินลงทุนที่สื่อถึง</span></span>
                <span className="result-value">{fmtPercent(result.impliedRoc)}</span>
                <span className="result-compare">vs WACC: {fmtPercent(costOfCapital)}</span>
              </div>
              <div className="result-card"><span className="result-label">Reinvestment Rate <span className="thai-sub">อัตราการลงทุนซ้ำ</span></span><span className="result-number">{fmtPercent(result.reinvestmentRate)}</span></div>
              <div className="result-card"><span className="result-label">If ROC = WACC, Reinvestment <span className="thai-sub">ถ้า ROC = WACC อัตราลงทุนซ้ำ</span></span><span className="result-number">{fmtPercent(result.reinvestmentRateIfRocEqualsWacc)}</span></div>
            </div>
            <div className="roc-insight-box">
              {result.impliedRoc > costOfCapital
                ? `Your implied ROC (${fmtPercent(result.impliedRoc)}) exceeds your cost of capital (${fmtPercent(costOfCapital)}). This assumes perpetual competitive advantages. If ROC = WACC, reinvestment rate would be ${fmtPercent(result.reinvestmentRateIfRocEqualsWacc)}.`
                : `Your implied ROC (${fmtPercent(result.impliedRoc)}) is at or below your cost of capital (${fmtPercent(costOfCapital)}). This is conservative and assumes no competitive advantages in perpetuity.`}
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
