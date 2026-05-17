import { Link } from 'react-router-dom'
import './CalculatorPage.css'

export default function FcffFullDcf() {
  return (
    <div className="calc-page"><div className="container">
      <h1>FCFF Full DCF (15-Year)</h1>
      <p className="page-desc">Advanced 15-year FCFF model with R&D capitalization, operating lease conversion, normalized earnings, and beta adjustment.</p>
      <p className="page-desc-thai">โมเดล FCFF ขั้นสูง 15 ปี — ทุนค่า R&D, แปลงสัญญาเช่า, กำไรปกติ และปรับ Beta</p>
      <div className="calc-grid">
        <div className="calc-inputs">
          <h2>Prerequisites <span className="thai-sub">ข้อกำหนดเบื้องต้น</span></h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted-48)', lineHeight: 1.6 }}>
            This model builds on the Simple DCF with additional adjustment layers.
            Complete the prerequisite calculations first, then enter their results here.
          </p>
          <p className="page-desc-thai" style={{ marginTop: -8 }}>โมเดลนี้สร้างบน Simple DCF เพิ่มชั้นการปรับค่า — กรอกข้อมูลจากเครื่องมือด้านล่างก่อน</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <Link to="/fcff-simple" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Simple DCF (Base Model) <span className="thai-sub">โมเดลพื้นฐาน</span></Link>
            <Link to="/wacc" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>WACC Calculator <span className="thai-sub">คำนวณ WACC</span></Link>
            <Link to="/rd-converter" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>R&D Converter <span className="thai-sub">ทุนค่า R&D</span></Link>
            <Link to="/operating-lease" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Operating Lease Converter <span className="thai-sub">แปลงสัญญาเช่า</span></Link>
            <Link to="/normalized-earnings" className="btn-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>Normalized Earnings <span className="thai-sub">กำไรปกติ</span></Link>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--color-canvas-parchment)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
            <strong>Note:</strong> The FCFF Full DCF uses the same engine as the Simple DCF but with R&D and lease adjustments enabled. <span className="thai-sub">โมเดลนี้ใช้เครื่องมือเดียวกับ Simple DCF แต่เปิดใช้การปรับ R&D และสัญญาเช่า</span>
            Use the <Link to="/fcff-simple">Simple DCF</Link> tool with the adjustment checkboxes enabled for the full model experience.
            The 15-year model adds a transition phase between years 5-10 with independent parameter controls.
          </div>
        </div>
      </div>
    </div></div>
  )
}
