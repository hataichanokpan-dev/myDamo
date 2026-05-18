import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import './Home.css'

const MODELS = [
  { path: '/fcff-simple', title: 'FCFF Simple DCF', desc: '10-year FCFF model with growth, margin convergence, and terminal value.', thai: 'โมเดล FCFF 10 ปี พร้อมการเติบโตและมูลค่าตัวท้าย', tag: 'Most Used', icon: 'chart' },
  { path: '/fcff-full', title: 'FCFF Full DCF', desc: 'Advanced model with R&D, lease, normalized earnings, and beta adjustment.', thai: 'โมเดลขั้นสูง พร้อมปรับ R&D สัญญาเช่า และกำไรปกติ', tag: 'Advanced', icon: 'layers' },
  { path: '/high-growth', title: 'High Growth Valuation', desc: 'For negative earnings or high growth with NOL and yearly growth rates.', thai: 'สำหรับบริษัทขาดทุนหรือโตสูง รองรับ NOL รายปี', tag: 'Growth', icon: 'rocket' },
  { path: '/wacc', title: 'WACC Calculator', desc: 'Cost of capital with beta, ERP, cost of debt, and lease adjustments.', thai: 'คำนวณ WACC พร้อม Beta, ERP และต้นทุนหนี้', tag: 'Essential', icon: 'gauge' },
  { path: '/model-selector', title: 'Model Selector', desc: 'Answer a few questions to choose the right valuation approach.', thai: 'ตอบคำถามเพื่อเลือกโมเดลประเมินมูลค่าที่เหมาะสม', tag: 'Guide', icon: 'compass' },
  { path: '/implied-roc-roe', title: 'Implied ROC/ROE', desc: 'Check terminal return on capital against your cost of capital.', thai: 'ตรวจ ROC/ROE ที่สอดคล้องกับมูลค่าตัวท้าย', tag: 'Check', icon: 'trendingUp' },
  { path: '/implied-erp', title: 'Implied Equity Risk Premium', desc: 'Back out the ERP priced by the market from index assumptions.', thai: 'คำนวณ ERP ที่ตลาดกำลังกำหนดราคา', tag: 'Market', icon: 'percent' },
  { path: '/rd-converter', title: 'R&D Converter', desc: 'Capitalize R&D and adjust operating income.', thai: 'ทุนค่า R&D และปรับกำไรดำเนินงาน', tag: 'Adjustment', icon: 'beaker' },
  { path: '/operating-lease', title: 'Operating Lease Converter', desc: 'Convert lease commitments to debt and restate operating income.', thai: 'แปลงสัญญาเช่าเป็นหนี้สินและปรับกำไรใหม่', tag: 'Adjustment', icon: 'fileText' },
  { path: '/normalized-earnings', title: 'Normalized Earnings', desc: 'Normalize earnings using history, sector margins, or ROC.', thai: 'ปรับกำไรให้เป็นค่าปกติจากอดีตหรืออุตสาหกรรม', tag: 'Adjustment', icon: 'repeat' },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero hero-dark">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-kicker"><Icon name="sparkle" size="sm" /> Professional valuation PWA</span>
            <h1>Damodaran Valuation Toolkit</h1>
            <p className="hero-subtitle">A compact analyst workspace for DCF, WACC, ERP, and valuation adjustments with auto-filled market data.</p>
            <p className="hero-thai">เครื่องมือประเมินมูลค่าธุรกิจแบบมืออาชีพ — ดึงข้อมูลการเงินอัตโนมัติ ใส่สมมติฐาน และอ่านผลลัพธ์แบบ dashboard</p>
            <div className="hero-actions">
              <Link to="/fcff-simple" className="btn-primary"><Icon name="activity" size="sm" /> Start DCF</Link>
              <Link to="/model-selector" className="btn-secondary"><Icon name="compass" size="sm" /> Pick Model</Link>
            </div>
          </div>
          <div className="hero-panel" aria-hidden="true">
            <div className="hero-panel__top">
              <span>Intrinsic Value</span>
              <strong>124.80</strong>
            </div>
            <div className="hero-bars">
              <i style={{ height: '38%' }} />
              <i style={{ height: '52%' }} />
              <i style={{ height: '66%' }} />
              <i style={{ height: '74%' }} />
              <i style={{ height: '86%' }} />
              <i style={{ height: '70%' }} />
            </div>
            <div className="hero-panel__metrics">
              <span><b>9.2%</b> WACC</span>
              <span><b>18.4%</b> ROIC</span>
              <span><b>3.0%</b> g</span>
            </div>
          </div>
        </div>
      </section>

      <section className="models-section">
        <div className="container">
          <div className="models-grid">
            {MODELS.map(model => (
              <Link key={model.path} to={model.path} className="model-card">
                <span className="model-icon"><Icon name={model.icon as any} size="sm" /></span>
                <span className="model-tag">{model.tag}</span>
                <h3>{model.title}</h3>
                <p>{model.desc}</p>
                <p className="model-thai">{model.thai}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
