import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CalculatorPage.css'

interface Answers {
  dividends: string
  leverage: string
  cashFlowStability: string
  control: string
}

const RECOMMENDATIONS: Record<string, { model: string; path: string; reason: string; reasonThai: string }> = {
  'dividend-y-stable-y': { model: 'Dividend Discount Model', path: '/ddm', reason: 'Stable dividends and cash flows. Use DDM if dividend policy is consistent and predictable.', reasonThai: 'ปันผลและกระแสเงินสดคงที่ — ใช้ DDM ได้หากนโยบายปันผลสม่ำเสมอ' },
  'dividend-y-stable-n': { model: 'FCFF DCF', path: '/fcff-simple', reason: 'Dividends exist but cash flows are volatile. FCFF captures the true cash generation better.', reasonThai: 'มีปันผลแต่กระแสเงินสดผันผวน — FCFF จับภาพเงินสดจริงได้ดีกว่า' },
  'dividend-n-leverage-high': { model: 'FCFF DCF', path: '/fcff-simple', reason: 'No dividends and high leverage. FCFF is preferred because it values the firm before debt payments.', reasonThai: 'ไม่มีปันผลและมีหนี้สินสูง — FCFF เหมาะเพราะประเมินมูลค่าก่อนหักหนี้' },
  'dividend-n-leverage-low': { model: 'FCFE Model', path: '/fcfe', reason: 'No dividends but low leverage. FCFE gives equity value directly. Use FCFF as alternative.', reasonThai: 'ไม่มีปันผลแต่หนี้ต่ำ — FCFE ให้มูลค่าหุ้นโดยตรง' },
  'dividend-n-negative': { model: 'High Growth Valuation', path: '/high-growth', reason: 'Negative or very low earnings. Use the high growth model which handles NOL and margin convergence.', reasonThai: 'กำไรติดลบหรือต่ำมาก — ใช้โมเดลเติบโตสูงที่รองรับ NOL และอัตรากำไรลู่เข้า' },
}

export default function ModelSelector() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Answers>>({})

  const getResult = () => {
    const key = `dividend-${answers.dividends}-${answers.leverage === 'high' ? 'leverage-high' : answers.leverage === 'low' ? 'leverage-low' : 'negative'}`
    return RECOMMENDATIONS[key] || { model: 'FCFF Simple DCF', path: '/fcff-simple', reason: 'FCFF is the most versatile model and works for most companies.' }
  }

  return (
    <div className="calc-page"><div className="container">
      <h1>Model Selector</h1>
      <p className="page-desc">Answer a few questions about your company to find the right valuation model.</p>
      <p className="page-desc-thai">ตอบคำถามไม่กี่ข้อเกี่ยวกับบริษัทของคุณ เพื่อเลือกโมเดลประเมินมูลค่าที่เหมาะสม</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          {step === 0 && (
            <>
              <h2>Does your company pay dividends? <span className="thai-sub">บริษัทจ่ายปันผลหรือไม่?</span></h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, dividends: 'y' })); setStep(1) }} style={{ width: '100%' }}>Yes, regular dividends <span className="thai-sub">มีปันผลสม่ำเสมอ</span></button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, dividends: 'n' })); setStep(2) }} style={{ width: '100%' }}>No dividends <span className="thai-sub">ไม่จ่ายปันผล</span></button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Are cash flows stable and predictable? <span className="thai-sub">กระแสเงินสดคงที่และคาดเดาได้หรือไม่?</span></h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, cashFlowStability: 'stable' })); setStep(3) }} style={{ width: '100%' }}>Yes, stable cash flows <span className="thai-sub">คงที่ คาดเดาได้</span></button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, cashFlowStability: 'volatile' })); setStep(3) }} style={{ width: '100%' }}>No, cash flows are volatile <span className="thai-sub">ผันผวน ไม่แน่นอน</span></button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>What is the company's leverage situation? <span className="thai-sub">สถานะหนี้สินของบริษัทเป็นอย่างไร?</span></h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'high' })); setStep(3) }} style={{ width: '100%' }}>High debt / significant leverage <span className="thai-sub">หนี้สินสูง / มีหนี้มาก</span></button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'low' })); setStep(3) }} style={{ width: '100%' }}>Low debt / stable finances <span className="thai-sub">หนี้ต่ำ / การเงินมั่นคง</span></button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'negative' })); setStep(3) }} style={{ width: '100%' }}>Negative earnings / startup <span className="thai-sub">ขาดทุน / สตาร์ทอัพ</span></button>
              </div>
            </>
          )}
          {step >= 3 && (() => {
            const rec = getResult()
            return (
              <div className="calc-results calc-results--recommend">
                <h2 className="recommend-title">Recommended: {rec.model}</h2>
                <p className="recommend-reason">{rec.reason}</p>
                <p className="recommend-reason-thai">{rec.reasonThai}</p>
                <Link to={rec.path} className="btn-primary">Go to {rec.model}</Link>
                <div className="recommend-tools">
                  <strong>Other tools you may need:</strong>
                  <span className="thai-sub">เครื่องมืออื่นที่อาจต้องใช้:</span>
                  <div className="recommend-links">
                    <Link to="/wacc">WACC Calculator</Link>
                    <Link to="/implied-roc-roe">Implied ROC/ROE Check</Link>
                    <Link to="/rd-converter">R&D Converter</Link>
                    <Link to="/operating-lease">Operating Lease Converter</Link>
                  </div>
                </div>
                <button className="btn-secondary" onClick={() => { setStep(0); setAnswers({}) }}>Start Over <span className="thai-sub">เริ่มใหม่</span></button>
              </div>
            )
          })()}
        </div>
      </div>
    </div></div>
  )
}
