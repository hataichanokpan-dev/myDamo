import { useState } from 'react'
import { computeImpliedErp } from '../engines/leaseConverter'
import { fmtCompact, fmtPercent, fmtNumber } from '../utils/format'
import './CalculatorPage.css'

export default function ImpliedErp() {
  const [indexLevel, setIndexLevel] = useState(5000)
  const [divYield, setDivYield] = useState(0.015)
  const [growth5yr, setGrowth5yr] = useState(0.06)
  const [riskFreeRate, setRiskFreeRate] = useState(0.04)
  const [longTermGrowth, setLongTermGrowth] = useState(0.04)
  const [result, setResult] = useState<ReturnType<typeof computeImpliedErp> | null>(null)

  const compute = () => setResult(computeImpliedErp(indexLevel, divYield, growth5yr, riskFreeRate, longTermGrowth))

  return (
    <div className="calc-page"><div className="container">
      <h1>Implied Equity Risk Premium</h1>
      <p className="page-desc">Back out the ERP the market is pricing in from index level, dividends, and growth expectations.</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Market Inputs</h2>
          <div className="input-section">
            <label>Index Level (e.g. S&P 500)</label>
            <input type="number" value={indexLevel} onChange={e => setIndexLevel(parseFloat(e.target.value) || 0)} />
            <label>Current Dividend Yield</label>
            <input type="number" step="0.001" value={divYield} onChange={e => setDivYield(parseFloat(e.target.value) || 0)} />
            <label>Expected Earnings Growth (5yr)</label>
            <input type="number" step="0.01" value={growth5yr} onChange={e => setGrowth5yr(parseFloat(e.target.value) || 0)} />
            <label>Risk-free Rate</label>
            <input type="number" step="0.01" value={riskFreeRate} onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 0)} />
            <label>Long-term Growth Rate</label>
            <input type="number" step="0.01" value={longTermGrowth} onChange={e => setLongTermGrowth(parseFloat(e.target.value) || 0)} />
          </div>
          <button onClick={compute} className="btn-primary calc-btn">Calculate ERP</button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>Implied ERP</h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Implied Equity Risk Premium</span>
                <span className="result-value">{fmtPercent(result.impliedErp)}</span>
                <span></span>
              </div>
              <div className="result-card"><span className="result-label">Intrinsic Value</span><span className="result-number">{fmtNumber(result.intrinsicValue)}</span></div>
            </div>
            <h3>Expected Dividends (5 years)</h3>
            <div className="table-scroll"><table>
              <thead><tr><th>Year</th><th>Expected Div</th><th>PV</th></tr></thead>
              <tbody>
                {result.expectedDividends.map((d, i) => (
                  <tr key={i}><td>{i + 1}</td><td>{fmtCompact(d)}</td><td>{result.presentValues[i] != null ? fmtCompact(result.presentValues[i]) : '-'}</td></tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </div></div>
  )
}
