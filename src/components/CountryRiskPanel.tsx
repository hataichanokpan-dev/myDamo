import type { YahooFinanceData } from '../hooks/useYahooFinance'
import type { CountryRiskRecord } from '../data/countryRiskLatest'
import type { WeightedCountryRisk } from '../engines/countryRisk'
import { getCountryRiskDatasetMeta } from '../engines/countryRisk'
import { fmtPercent } from '../utils/format'
import Icon from './Icon'
import './CountryRiskPanel.css'

interface Props {
  risk?: CountryRiskRecord | null
  weightedRisk?: WeightedCountryRisk | null
  marketData?: YahooFinanceData | null
  applied?: boolean
  title?: string
  note?: string
  compact?: boolean
  onApply?: () => void
}

const datasetMeta = getCountryRiskDatasetMeta()

export default function CountryRiskPanel({
  risk,
  weightedRisk,
  marketData,
  applied,
  title,
  note,
  compact = false,
  onApply,
}: Props) {
  const primary = risk ?? weightedRisk?.records[0]?.risk ?? null
  const erp = weightedRisk ? weightedRisk.totalEquityRiskPremium : primary?.totalEquityRiskPremium
  const crp = weightedRisk ? weightedRisk.countryRiskPremium : primary?.countryRiskPremium
  const taxRate = weightedRisk ? weightedRisk.taxRate : primary?.taxRate

  if (!primary || erp == null || crp == null) return null

  const isWeighted = !!weightedRisk && weightedRisk.records.length > 1

  return (
    <section className={`country-risk-panel ${compact ? 'country-risk-panel--compact' : ''}`}>
      <div className="country-risk-panel__head">
        <span><Icon name="shield" size="sm" /> {title ?? (applied ? 'Country risk applied' : 'Country risk recommendation')}</span>
        <small>{datasetMeta.version}</small>
      </div>
      <div className="country-risk-panel__body">
        <strong>{isWeighted ? 'Weighted operating exposure' : primary.country}</strong>
        <span>
          {isWeighted
            ? `${weightedRisk?.records.length ?? 0} countries · Damodaran country risk`
            : `${primary.region} · ${primary.moodyRating ?? 'No rating'}`}
          {marketData?.country ? ` · Yahoo: ${marketData.country}` : ''}
        </span>
      </div>
      <div className="country-risk-panel__metrics">
        <span><b>{fmtPercent(erp)}</b> ERP</span>
        <span><b>{fmtPercent(crp)}</b> CRP</span>
        {taxRate != null && <span><b>{fmtPercent(taxRate)}</b> Tax</span>}
      </div>
      {weightedRisk && weightedRisk.records.length > 0 && (
        <div className="country-risk-panel__exposures">
          {weightedRisk.records.map((item) => (
            <span key={item.country}>
              {item.country} <b>{fmtPercent(item.weight)}</b>
            </span>
          ))}
        </div>
      )}
      {note && <p>{note}</p>}
      {onApply && (
        <button type="button" className="country-risk-panel__btn" onClick={onApply}>
          {applied ? 'Apply again' : 'Apply assumptions'}
        </button>
      )}
    </section>
  )
}
