import { Link } from 'react-router-dom'
import './Home.css'

const MODELS = [
  { path: '/fcff-simple', title: 'FCFF Simple DCF', desc: 'DCF valuation using Free Cash Flow to Firm. 10-year model with revenue growth, margin convergence, and terminal value.', tag: 'Most Used' },
  { path: '/fcff-full', title: 'FCFF Full DCF', desc: 'Advanced 15-year FCFF model with R&D capitalization, operating lease conversion, normalized earnings, and beta adjustment.', tag: 'Advanced' },
  { path: '/high-growth', title: 'High Growth Valuation', desc: 'For companies with negative earnings or high growth. Handles NOL carryforward, per-year revenue growth, and margin convergence.', tag: 'Growth' },
  { path: '/wacc', title: 'WACC Calculator', desc: 'Compute Weighted Average Cost of Capital with bottom-up beta, synthetic ratings, operating lease adjustment, and multi-business support.', tag: 'Essential' },
  { path: '/model-selector', title: 'Model Selector', desc: 'Not sure which valuation model to use? Answer questions about your company to find the right approach.', tag: 'Guide' },
  { path: '/implied-roc-roe', title: 'Implied ROC/ROE', desc: 'Sanity check: what return on capital does your terminal value imply? Compare against your cost of capital.', tag: 'Check' },
  { path: '/implied-erp', title: 'Implied Equity Risk Premium', desc: 'Back out the equity risk premium the market is pricing in, based on index level, dividends, and growth expectations.', tag: 'Market' },
  { path: '/rd-converter', title: 'R&D Converter', desc: 'Capitalize R&D expenses into assets and adjust operating income. For tech, pharma, and software companies.', tag: 'Adjustment' },
  { path: '/operating-lease', title: 'Operating Lease Converter', desc: 'Convert operating lease commitments to debt and restate operating income. For retail, airlines, and restaurants.', tag: 'Adjustment' },
  { path: '/normalized-earnings', title: 'Normalized Earnings', desc: 'Normalize earnings using historical averages, sector margins, or historical return on capital.', tag: 'Adjustment' },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero hero-dark">
        <div className="container hero-inner">
          <h1>Damodaran Valuation Toolkit</h1>
          <p className="hero-subtitle">Interactive web implementations of Aswath Damodaran's valuation spreadsheets. Auto-fetch financial data, input your assumptions, get intrinsic value.</p>
          <div className="hero-actions">
            <Link to="/fcff-simple" className="btn-primary">Start DCF Valuation</Link>
            <Link to="/model-selector" className="btn-secondary">Which Model?</Link>
          </div>
        </div>
      </section>

      <section className="models-section">
        <div className="container">
          <div className="models-grid">
            {MODELS.map(model => (
              <Link key={model.path} to={model.path} className="model-card">
                <span className="model-tag">{model.tag}</span>
                <h3>{model.title}</h3>
                <p>{model.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
