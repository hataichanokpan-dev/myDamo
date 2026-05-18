import { useState } from 'react'
import { computeFcfeValuation, type FcfeInputs } from '../engines/equityModels'
import { fmtCompact, fmtPercent } from '../utils/format'
import useAutoScrollResult from '../hooks/useAutoScrollResult'
import './CalculatorPage.css'

const DEFAULT: FcfeInputs = {
  netIncome: 1000,
  reinvestment: 400,
  debtCashFlow: 0,
  sharesOutstanding: 100,
  costOfEquity: 0.09,
  expectedGrowth: 0.06,
  stableGrowth: 0.03,
  stablePayoutRatio: 0.6,
  highGrowthYears: 5,
}

export default function FcfeValuation() {
  const [inputs, setInputs] = useState<FcfeInputs>(DEFAULT)
  const [result, setResult] = useState<ReturnType<typeof computeFcfeValuation> | null>(null)
  const resultRef = useAutoScrollResult(result)
  const update = (key: keyof FcfeInputs, value: number) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <div className="calc-page"><div className="container">
      <h1>FCFE Valuation</h1>
      <p className="page-desc">Free Cash Flow to Equity model for companies where equity cash flows are more natural than firm cash flows.</p>
      <p className="page-desc-thai">โมเดลกระแสเงินสดอิสระต่อผู้ถือหุ้น เหมาะกับบริษัทที่ประเมินจากเงินสดถึงผู้ถือหุ้นโดยตรง</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Equity Cash Flow <span className="thai-sub">กระแสเงินสดถึงผู้ถือหุ้น</span></h2>
          <div className="input-section">
            <label>Net Income <span className="thai-sub">กำไรสุทธิ</span></label>
            <input type="number" value={inputs.netIncome} onChange={e => update('netIncome', parseFloat(e.target.value) || 0)} />
            <label>Reinvestment <span className="thai-sub">เงินลงทุนสุทธิ</span></label>
            <input type="number" value={inputs.reinvestment} onChange={e => update('reinvestment', parseFloat(e.target.value) || 0)} />
            <label>Net Debt Cash Flow <span className="thai-sub">เงินสดสุทธิจากหนี้ใหม่/ชำระหนี้</span></label>
            <input type="number" value={inputs.debtCashFlow} onChange={e => update('debtCashFlow', parseFloat(e.target.value) || 0)} />
            <label>Shares Outstanding <span className="thai-sub">จำนวนหุ้น</span></label>
            <input type="number" value={inputs.sharesOutstanding} onChange={e => update('sharesOutstanding', parseFloat(e.target.value) || 1)} />
          </div>
          <h2>Discount & Growth <span className="thai-sub">อัตราคิดลดและเติบโต</span></h2>
          <div className="input-section">
            <label>Cost of Equity <span className="thai-sub">ต้นทุนทุนส่วนผู้ถือหุ้น</span></label>
            <input type="number" step="0.01" value={inputs.costOfEquity} onChange={e => update('costOfEquity', parseFloat(e.target.value) || 0)} />
            <label>High-growth FCFE Growth <span className="thai-sub">อัตราเติบโต FCFE ช่วงแรก</span></label>
            <input type="number" step="0.01" value={inputs.expectedGrowth} onChange={e => update('expectedGrowth', parseFloat(e.target.value) || 0)} />
            <label>Stable Growth <span className="thai-sub">อัตราเติบโตระยะยาว</span></label>
            <input type="number" step="0.01" value={inputs.stableGrowth} onChange={e => update('stableGrowth', parseFloat(e.target.value) || 0)} />
            <label>Stable Payout Ratio <span className="thai-sub">อัตราจ่ายคืนช่วงคงที่</span></label>
            <input type="number" step="0.01" value={inputs.stablePayoutRatio} onChange={e => update('stablePayoutRatio', parseFloat(e.target.value) || 0)} />
            <label>High-growth Years <span className="thai-sub">จำนวนปีช่วงเติบโต</span></label>
            <input type="number" value={inputs.highGrowthYears} onChange={e => update('highGrowthYears', parseInt(e.target.value) || 1)} />
          </div>
          <button onClick={() => setResult(computeFcfeValuation(inputs))} className="btn-primary calc-btn">Calculate FCFE <span className="thai-sub">คำนวณ FCFE</span></button>
        </div>
        {result && (
          <div className="calc-results" ref={resultRef}>
            <h2>FCFE Result <span className="thai-sub">ผลการประเมิน FCFE</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Value per Share <span className="thai-sub">มูลค่าต่อหุ้น</span></span>
                <span className="result-value">{result.valuePerShare.toFixed(2)}</span>
                <span className="result-compare">CoE {fmtPercent(inputs.costOfEquity)} · stable g {fmtPercent(inputs.stableGrowth)}</span>
              </div>
              <div className="result-card"><span className="result-label">Equity Value</span><span className="result-number">{fmtCompact(result.valueOfEquity)}</span></div>
              <div className="result-card"><span className="result-label">PV FCFE</span><span className="result-number">{fmtCompact(result.pvFcfe)}</span></div>
              <div className="result-card"><span className="result-label">PV Terminal</span><span className="result-number">{fmtCompact(result.pvTerminalValue)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
