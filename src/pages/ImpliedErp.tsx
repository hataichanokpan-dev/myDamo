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
      <p className="page-desc-thai">คำนวณหาค่าเบี้ยประกันความเสี่ยงหุ้นที่ตลาดกำลังกำหนดราคา จากระดับดัชนี ปันผล และความคาดหวังการเติบโต</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Market Inputs <span className="thai-sub">ข้อมูลตลาด</span></h2>
          <div className="input-section">
            <label>Index Level (e.g. S&P 500) <span className="thai-sub">ระดับดัชนี (เช่น S&P 500)</span></label>
            <input type="number" value={indexLevel} onChange={e => setIndexLevel(parseFloat(e.target.value) || 0)} />
            <label>Current Dividend Yield <span className="thai-sub">อัตราผลตอบแทนจากปันผลปัจจุบัน</span></label>
            <input type="number" step="0.001" value={divYield} onChange={e => setDivYield(parseFloat(e.target.value) || 0)} />
            <label>Expected Earnings Growth (5yr) <span className="thai-sub">คาดการณ์อัตราเติบโตกำไร 5 ปี</span></label>
            <input type="number" step="0.01" value={growth5yr} onChange={e => setGrowth5yr(parseFloat(e.target.value) || 0)} />
            <label>Risk-free Rate <span className="thai-sub">อัตราดอกเบี้ยไม่มีความเสี่ยง</span></label>
            <input type="number" step="0.01" value={riskFreeRate} onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 0)} />
            <label>Long-term Growth Rate <span className="thai-sub">อัตราเติบโตระยะยาว</span></label>
            <input type="number" step="0.01" value={longTermGrowth} onChange={e => setLongTermGrowth(parseFloat(e.target.value) || 0)} />
          </div>
          <button onClick={compute} className="btn-primary calc-btn">Calculate ERP <span className="thai-sub">คำนวณ ERP</span></button>
        </div>
        {result && (
          <div className="calc-results">
            <h2>Implied ERP <span className="thai-sub">ค่า ERP ที่คำนวณได้</span></h2>
            <div className="result-summary">
              <div className="result-card result-card-main">
                <span className="result-label">Implied Equity Risk Premium <span className="thai-sub">ค่าเบี้ยประกันความเสี่ยงหุ้นที่สื่อถึง</span></span>
                <span className="result-value">{fmtPercent(result.impliedErp)}</span>
                <span></span>
              </div>
              <div className="result-card"><span className="result-label">Intrinsic Value <span className="thai-sub">มูลค่าที่แท้จริง</span></span><span className="result-number">{fmtNumber(result.intrinsicValue)}</span></div>
            </div>
            <h3>Expected Dividends (5 years) <span className="thai-sub">ปันผลคาดการณ์ (5 ปี)</span></h3>
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
