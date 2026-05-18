import { useState } from 'react'
import type { LeaseInputs } from '../engines/leaseConverter'
import { computeLeaseConversion } from '../engines/leaseConverter'
import { fmtCompact } from '../utils/format'
import useAutoScrollResult from '../hooks/useAutoScrollResult'
import './CalculatorPage.css'

export default function OperatingLeaseConverter() {
  const [inputs, setInputs] = useState<LeaseInputs>({
    leaseCommitments: [156, 150, 145, 143, 140],
    leaseBeyondYear5: 600,
    preTaxCostOfDebt: 0.035,
  })
  const [result, setResult] = useState<ReturnType<typeof computeLeaseConversion> | null>(null)
  const resultRef = useAutoScrollResult(result)

  const updateCommitment = (idx: number, value: number) => {
    const newComm = [...inputs.leaseCommitments]
    newComm[idx] = value
    setInputs(prev => ({ ...prev, leaseCommitments: newComm }))
  }

  return (
    <div className="calc-page"><div className="container">
      <h1>Operating Lease Converter</h1>
      <p className="page-desc">Convert operating lease commitments to debt using PV calculation. Adjusts operating income and total debt.</p>
      <p className="page-desc-thai">แปลงสัญญาเช่าดำเนินงานเป็นหนี้สินด้วยมูลค่าปัจจุบัน — ปรับกำไรจากการดำเนินงานและหนี้รวม</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Lease Commitments <span className="thai-sub">สัญญาเช่า</span></h2>
          <div className="input-section">
            {inputs.leaseCommitments.map((c, i) => (
              <div key={i}>
                <label>Year {i + 1} Commitment <span className="thai-sub">สัญญาเช่าปีที่ {i + 1}</span></label>
                <input type="number" value={c} onChange={e => updateCommitment(i, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
            <label>Commitments Beyond Year 5 <span className="thai-sub">สัญญาเช่าหลังปีที่ 5</span></label>
            <input type="number" value={inputs.leaseBeyondYear5} onChange={e => setInputs(prev => ({ ...prev, leaseBeyondYear5: parseFloat(e.target.value) || 0 }))} />
            <label>Pre-tax Cost of Debt <span className="thai-sub">ต้นทุนหนี้ก่อนภาษี</span></label>
            <input type="number" step="0.01" value={inputs.preTaxCostOfDebt} onChange={e => setInputs(prev => ({ ...prev, preTaxCostOfDebt: parseFloat(e.target.value) || 0 }))} />
          </div>
          <button onClick={() => setResult(computeLeaseConversion(inputs))} className="btn-primary calc-btn">Convert Leases <span className="thai-sub">แปลงสัญญาเช่า</span></button>
        </div>
        {result && (
          <div className="calc-results" ref={resultRef}>
            <h2>Lease Conversion Result <span className="thai-sub">ผลการแปลงสัญญาเช่า</span></h2>
            <div className="result-summary">
              <div className="result-card"><span className="result-label">Debt Value of Leases <span className="thai-sub">มูลค่าหนี้ของสัญญาเช่า</span></span><span className="result-number">{fmtCompact(result.debtValueOfLeases)}</span></div>
              <div className="result-card"><span className="result-label">Depreciation on Lease Asset <span className="thai-sub">ค่าเสื่อมสินทรัพย์เช่า</span></span><span className="result-number">{fmtCompact(result.depreciationOnLeaseAsset)}</span></div>
              <div className="result-card result-card-main">
                <span className="result-label">Adjustment to Operating Income <span className="thai-sub">การปรับกำไรจากการดำเนินงาน</span></span>
                <span className="result-value">{result.adjustmentToOperatingIncome > 0 ? '+' : ''}{fmtCompact(result.adjustmentToOperatingIncome)}</span>
                <span className="result-compare">Lease Expense - Depreciation</span>
              </div>
            </div>
            <h3>PV of Commitments <span className="thai-sub">มูลค่าปัจจุบันของสัญญาเช่า</span></h3>
            <div className="table-scroll"><table>
              <thead><tr><th>Year</th><th>Commitment</th><th>Present Value</th></tr></thead>
              <tbody>
                {result.leasePv.map((row, i) => (
                  <tr key={i}><td>{row.year}</td><td>{fmtCompact(row.commitment)}</td><td>{fmtCompact(row.presentValue)}</td></tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </div></div>
  )
}
