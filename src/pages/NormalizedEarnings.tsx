import { useState } from 'react'
import type { NormalizedEarningsInputs } from '../engines/leaseConverter'
import { computeNormalizedEarnings } from '../engines/leaseConverter'
import { fmtCompact } from '../utils/format'
import './CalculatorPage.css'

export default function NormalizedEarnings() {
  const [inputs, setInputs] = useState<NormalizedEarningsInputs>({
    approach: 1, currentRevenue: 10000, currentCapital: 15000,
    historicalAverageEbit: 2000, historicalAverageRoc: 0.15, sectorMargin: 0.12,
  })
  const [result, setResult] = useState<ReturnType<typeof computeNormalizedEarnings> | null>(null)
  const update = (key: keyof NormalizedEarningsInputs, value: any) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <div className="calc-page"><div className="container">
      <h1>Normalized Earnings</h1>
      <p className="page-desc">Normalize earnings using historical averages, sector margins, or historical ROC.</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Approach</h2>
          <div className="input-section">
            <label><input type="radio" name="approach" checked={inputs.approach === 1} onChange={() => update('approach', 1)} /> Historical Average EBIT</label>
            <label><input type="radio" name="approach" checked={inputs.approach === 2} onChange={() => update('approach', 2)} /> Historical Average ROC × Current Capital</label>
            <label><input type="radio" name="approach" checked={inputs.approach === 3} onChange={() => update('approach', 3)} /> Sector Margin × Current Revenue</label>
          </div>
          <h2>Company Data</h2>
          <div className="input-section">
            <label>Current Revenue</label>
            <input type="number" value={inputs.currentRevenue} onChange={e => update('currentRevenue', parseFloat(e.target.value) || 0)} />
            <label>Current Invested Capital</label>
            <input type="number" value={inputs.currentCapital} onChange={e => update('currentCapital', parseFloat(e.target.value) || 0)} />
            <label>Historical Average EBIT</label>
            <input type="number" value={inputs.historicalAverageEbit} onChange={e => update('historicalAverageEbit', parseFloat(e.target.value) || 0)} />
            <label>Historical Average Pre-tax ROC</label>
            <input type="number" step="0.01" value={inputs.historicalAverageRoc} onChange={e => update('historicalAverageRoc', parseFloat(e.target.value) || 0)} />
            <label>Sector Pre-tax Operating Margin</label>
            <input type="number" step="0.01" value={inputs.sectorMargin} onChange={e => update('sectorMargin', parseFloat(e.target.value) || 0)} />
          </div>
          <button onClick={() => setResult(computeNormalizedEarnings(inputs))} className="btn-primary calc-btn">Normalize Earnings</button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>Normalized Earnings</h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Normalized EBIT ({result.approach})</span>
                <span className="result-value">{fmtCompact(result.normalizedEbit)}</span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div></div>
  )
}
