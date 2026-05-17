import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CalculatorPage.css'

interface Answers {
  dividends: string
  leverage: string
  cashFlowStability: string
  control: string
}

const RECOMMENDATIONS: Record<string, { model: string; path: string; reason: string }> = {
  'dividend-y-stable-y': { model: 'Dividend Discount Model', path: '/fcff-simple', reason: 'Stable dividends and cash flows. Use DDM if dividend policy is consistent and predictable.' },
  'dividend-y-stable-n': { model: 'FCFF DCF', path: '/fcff-simple', reason: 'Dividends exist but cash flows are volatile. FCFF captures the true cash generation better.' },
  'dividend-n-leverage-high': { model: 'FCFF DCF', path: '/fcff-simple', reason: 'No dividends and high leverage. FCFF is preferred because it values the firm before debt payments.' },
  'dividend-n-leverage-low': { model: 'FCFE Model', path: '/fcff-simple', reason: 'No dividends but low leverage. FCFE gives equity value directly. Use FCFF as alternative.' },
  'dividend-n-negative': { model: 'High Growth Valuation', path: '/high-growth', reason: 'Negative or very low earnings. Use the high growth model which handles NOL and margin convergence.' },
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
      <div className="calc-grid">
        <div className="calc-inputs">
          {step === 0 && (
            <>
              <h2>Does your company pay dividends?</h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, dividends: 'y' })); setStep(1) }} style={{ width: '100%' }}>Yes, regular dividends</button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, dividends: 'n' })); setStep(2) }} style={{ width: '100%' }}>No dividends</button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Are cash flows stable and predictable?</h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, cashFlowStability: 'stable' })); setStep(3) }} style={{ width: '100%' }}>Yes, stable cash flows</button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, cashFlowStability: 'volatile' })); setStep(3) }} style={{ width: '100%' }}>No, cash flows are volatile</button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>What is the company's leverage situation?</h2>
              <div className="input-section" style={{ gap: '12px' }}>
                <button className="btn-primary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'high' })); setStep(3) }} style={{ width: '100%' }}>High debt / significant leverage</button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'low' })); setStep(3) }} style={{ width: '100%' }}>Low debt / stable finances</button>
                <button className="btn-secondary" onClick={() => { setAnswers(a => ({ ...a, leverage: 'negative' })); setStep(3) }} style={{ width: '100%' }}>Negative earnings / startup</button>
              </div>
            </>
          )}
          {step >= 3 && (() => {
            const rec = getResult()
            return (
              <div className="calc-results calc-results--recommend">
                <h2 className="recommend-title">Recommended: {rec.model}</h2>
                <p className="recommend-reason">{rec.reason}</p>
                <Link to={rec.path} className="btn-primary">Go to {rec.model}</Link>
                <div className="recommend-tools">
                  <strong>Other tools you may need:</strong>
                  <div className="recommend-links">
                    <Link to="/wacc">WACC Calculator</Link>
                    <Link to="/implied-roc-roe">Implied ROC/ROE Check</Link>
                    <Link to="/rd-converter">R&D Converter</Link>
                    <Link to="/operating-lease">Operating Lease Converter</Link>
                  </div>
                </div>
                <button className="btn-secondary" onClick={() => { setStep(0); setAnswers({}) }}>Start Over</button>
              </div>
            )
          })()}
        </div>
      </div>
    </div></div>
  )
}
