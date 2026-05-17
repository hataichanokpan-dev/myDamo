import { Link } from 'react-router-dom'
import './CalculatorPage.css'

export default function FcffFullDcf() {
  return (
    <div className="calc-page"><div className="container">
      <h1>FCFF Full DCF (15-Year)</h1>
      <p className="page-desc">Advanced 15-year FCFF model with R&D capitalization, operating lease conversion, normalized earnings, and beta adjustment.</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Prerequisites</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted-48)', lineHeight: 1.6 }}>
            This model builds on the Simple DCF with additional adjustment layers.
            Complete the prerequisite calculations first, then enter their results here.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <Link to="/fcff-simple" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Simple DCF (Base Model)</Link>
            <Link to="/wacc" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>WACC Calculator</Link>
            <Link to="/rd-converter" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>R&D Converter</Link>
            <Link to="/operating-lease" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Operating Lease Converter</Link>
            <Link to="/normalized-earnings" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Normalized Earnings</Link>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--color-canvas-parchment)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
            <strong>Note:</strong> The FCFF Full DCF uses the same engine as the Simple DCF but with R&D and lease adjustments enabled.
            Use the <Link to="/fcff-simple">Simple DCF</Link> tool with the adjustment checkboxes enabled for the full model experience.
            The 15-year model adds a transition phase between years 5-10 with independent parameter controls.
          </div>
        </div>
      </div>
    </div></div>
  )
}
