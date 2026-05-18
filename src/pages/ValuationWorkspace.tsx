import { Link } from 'react-router-dom'
import CountryRiskPanel from '../components/CountryRiskPanel'
import Icon from '../components/Icon'
import { useValuationCase } from '../context/ValuationCaseContext'
import { buildSensitivityTable, getInvestmentDecision, runAssumptionAudit } from '../engines/valuationCase'
import { fmtCompact, fmtPercent } from '../utils/format'
import './ValuationWorkspace.css'

const GROWTH_LABELS = ['g - 0.5%', 'Base g', 'g + 0.5%']

export default function ValuationWorkspace() {
  const { caseData, updateCase, resetCase, exportCase } = useValuationCase()
  const audit = runAssumptionAudit(caseData)
  const decision = getInvestmentDecision(caseData)
  const sensitivity = buildSensitivityTable(caseData.dcf.inputs)
  const company = caseData.company

  return (
    <div className="workspace-page">
      <div className="container">
        <section className="workspace-hero">
          <div>
            <span className="workspace-kicker"><Icon name="wallet" size="sm" /> Valuation Case Workspace</span>
            <h1>{company?.ticker ? `${company.ticker} Valuation Case` : 'Build a Damodaran Valuation Case'}</h1>
            <p className="page-desc">
              One place for the story, country risk, WACC, DCF, sanity checks, sensitivity, and exportable valuation memo.
            </p>
            <p className="page-desc-thai">รวม narrative, country risk, WACC, DCF, sanity check, sensitivity และรายงานไว้ในเคสเดียว</p>
          </div>
          <div className="workspace-actions">
            <Link to="/wacc" className="btn-secondary"><Icon name="gauge" size="sm" /> WACC</Link>
            <Link to="/fcff-simple" className="btn-primary"><Icon name="chart" size="sm" /> DCF</Link>
            <button type="button" onClick={exportCase}><Icon name="fileText" size="sm" /> Export</button>
            <button type="button" onClick={resetCase}><Icon name="repeat" size="sm" /> Reset</button>
          </div>
        </section>

        <section className="workspace-grid">
          <div className={`workspace-decision workspace-decision--${decision.recommendation.toLowerCase().replace(' ', '-')}`}>
            <div className="workspace-decision__main">
              <span>Recommendation</span>
              <strong>{decision.recommendation}</strong>
              <p>{decision.rationale}</p>
            </div>
            <div className="workspace-decision__metrics">
              <span><b>{decision.fairValue == null ? '-' : decision.fairValue.toFixed(2)}</b> Fair value</span>
              <span><b>{decision.marketPrice == null ? '-' : decision.marketPrice.toFixed(2)}</b> Market price</span>
              <span><b>{decision.upsideDownside == null ? '-' : fmtPercent(decision.upsideDownside)}</b> Upside / downside</span>
              <span><b>{decision.marginOfSafety == null ? '-' : fmtPercent(decision.marginOfSafety)}</b> MOS</span>
            </div>
          </div>

          <div className="workspace-panel workspace-company">
            <h2>Company Snapshot</h2>
            {company ? (
              <div className="workspace-company__grid">
                <span><b>{company.name || company.ticker}</b> Company</span>
                <span><b>{company.country || '-'}</b> Country</span>
                <span><b>{company.currency || '-'}</b> Currency</span>
                <span><b>{company.price ? fmtCompact(company.price) : '-'}</b> Price</span>
                <span><b>{company.sector || '-'}</b> Sector</span>
                <span><b>{company.industry || '-'}</b> Industry</span>
              </div>
            ) : (
              <p className="workspace-empty">Auto-fill a ticker from WACC or DCF to seed this case.</p>
            )}
          </div>

          <div className="workspace-panel">
            <h2>Valuation Summary</h2>
            <div className="workspace-metrics">
              <span><b>{caseData.wacc.result ? fmtPercent(caseData.wacc.result.wacc) : '-'}</b> WACC</span>
              <span><b>{caseData.dcf.result ? caseData.dcf.result.valuePerShare.toFixed(2) : '-'}</b> Value/share</span>
              <span><b>{caseData.dcf.result ? fmtCompact(caseData.dcf.result.valueOfEquity) : '-'}</b> Equity value</span>
              <span><b>{caseData.dcf.result ? fmtPercent(caseData.dcf.result.diagnostics.roicYear10) : '-'}</b> Terminal ROIC</span>
            </div>
          </div>

          <div className="workspace-panel workspace-narrative">
            <h2>Story To Numbers</h2>
            <label>
              Story
              <textarea value={caseData.narrative.story} onChange={(event) => updateCase({ narrative: { ...caseData.narrative, story: event.target.value } })} placeholder="What is the business story that justifies your growth, margin, and reinvestment assumptions?" />
            </label>
            <label>
              Moat / Competitive Advantage
              <textarea value={caseData.narrative.moat} onChange={(event) => updateCase({ narrative: { ...caseData.narrative, moat: event.target.value } })} placeholder="Why can this firm earn excess returns, and for how long?" />
            </label>
            <label>
              Key Risks
              <textarea value={caseData.narrative.risks} onChange={(event) => updateCase({ narrative: { ...caseData.narrative, risks: event.target.value } })} placeholder="What can break the valuation?" />
            </label>
          </div>

          <div className="workspace-panel">
            <h2>Country Risk</h2>
            <CountryRiskPanel
              weightedRisk={caseData.countryRisk}
              applied={!!caseData.countryRisk}
              compact
              note={caseData.countryRisk ? 'Saved from WACC country exposure.' : 'Use WACC or Country Risk to save country exposure into this case.'}
            />
          </div>

          <div className="workspace-panel workspace-audit">
            <h2>Professor Check</h2>
            <div className="audit-list">
              {audit.map((item, index) => (
                <div className={`audit-item audit-item--${item.severity}`} key={`${item.title}-${index}`}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
              {audit.length === 0 && <p className="workspace-empty">No major issues detected. The case is internally consistent.</p>}
            </div>
          </div>

          <div className="workspace-panel workspace-sensitivity">
            <h2>Sensitivity</h2>
            {sensitivity.length > 0 ? (
              <div className="sensitivity-table">
                <table>
                  <thead>
                    <tr>
                      <th>WACC \\ g</th>
                      {GROWTH_LABELS.map((label) => <th key={label}>{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivity.map((row) => (
                      <tr key={row.costOfCapital}>
                        <td>{fmtPercent(row.costOfCapital)}</td>
                        {row.values.map((value, index) => (
                          <td key={index}>{value == null ? 'Invalid' : value.toFixed(2)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="workspace-empty">Run FCFF Simple DCF to generate sensitivity.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
