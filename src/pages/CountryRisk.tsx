import { useMemo, useState } from 'react'
import CountryRiskPanel from '../components/CountryRiskPanel'
import { getCountryRiskDatasetMeta, listCountryRiskRecords } from '../engines/countryRisk'
import { fmtCompact, fmtPercent } from '../utils/format'
import './CountryRisk.css'

const COUNTRIES = listCountryRiskRecords()
const REGIONS = Array.from(new Set(COUNTRIES.map((item) => item.region))).sort()
const META = getCountryRiskDatasetMeta()

export default function CountryRisk() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')
  const [selectedCountry, setSelectedCountry] = useState('Thailand')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COUNTRIES.filter((item) => (
      (region === 'All' || item.region === region) &&
      (!q || item.country.toLowerCase().includes(q) || item.region.toLowerCase().includes(q) || item.moodyRating?.toLowerCase().includes(q))
    ))
  }, [query, region])

  const selected = COUNTRIES.find((item) => item.country === selectedCountry) ?? filtered[0] ?? COUNTRIES[0]

  const regionSummary = useMemo(() => {
    return REGIONS.map((name) => {
      const records = COUNTRIES.filter((item) => item.region === name)
      const erp = records.reduce((sum, item) => sum + item.totalEquityRiskPremium, 0) / records.length
      const crp = records.reduce((sum, item) => sum + item.countryRiskPremium, 0) / records.length
      return { region: name, count: records.length, erp, crp }
    }).sort((a, b) => b.erp - a.erp)
  }, [])

  return (
    <div className="country-risk-page">
      <div className="container">
        <div className="country-risk-hero">
          <div>
            <span className="country-risk-kicker">Damodaran dataset · {META.version}</span>
            <h1>Country Risk Premiums</h1>
            <p className="page-desc">Search country ERP, country risk premium, tax rate, rating, and regional risk from the latest imported workbook.</p>
            <p className="page-desc-thai">ค้นหา ERP, CRP, ภาษี, rating และความเสี่ยงรายภูมิภาคจากไฟล์ Damodaran ที่ import ล่าสุด</p>
          </div>
          <div className="country-risk-meta">
            <span><b>{fmtPercent(META.matureMarketPremium)}</b> Mature ERP</span>
            <span><b>{fmtPercent(META.usErp)}</b> US ERP</span>
            <span><b>{META.relativeEquityVolatility.toFixed(2)}x</b> Rel. vol</span>
          </div>
        </div>

        <div className="country-risk-layout">
          <aside className="country-risk-sidebar">
            <div className="country-risk-search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country, region, rating"
              />
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                <option value="All">All regions</option>
                {REGIONS.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="country-risk-list">
              {filtered.map((item) => (
                <button
                  type="button"
                  key={item.country}
                  className={selected.country === item.country ? 'active' : ''}
                  onClick={() => setSelectedCountry(item.country)}
                >
                  <span>
                    <strong>{item.country}</strong>
                    <small>{item.region} · {item.moodyRating ?? 'No rating'}</small>
                  </span>
                  <b>{fmtPercent(item.totalEquityRiskPremium)}</b>
                </button>
              ))}
            </div>
          </aside>

          <main className="country-risk-detail">
            <CountryRiskPanel
              risk={selected}
              title="Selected country risk"
              note="Use this ERP for local-market exposure, or build a revenue-weighted ERP in the WACC calculator."
            />
            <section className="country-risk-data-card">
              <h2>Country Detail <span className="thai-sub">รายละเอียดประเทศ</span></h2>
              <div className="country-risk-facts">
                <span><b>{selected.moodyRating ?? '-'}</b> Moody's</span>
                <span><b>{selected.sovereignCds == null ? '-' : fmtPercent(selected.sovereignCds)}</b> Sovereign CDS</span>
                <span><b>{fmtPercent(selected.adjustedDefaultSpread)}</b> Default spread</span>
                <span><b>{selected.taxRate == null ? '-' : fmtPercent(selected.taxRate)}</b> Tax rate</span>
                <span><b>{selected.gdpMillions == null ? '-' : fmtCompact(selected.gdpMillions * 1_000_000)}</b> GDP</span>
              </div>
            </section>

            <section className="country-risk-data-card">
              <h2>Regional Risk <span className="thai-sub">ความเสี่ยงรายภูมิภาค</span></h2>
              <div className="region-risk-bars">
                {regionSummary.map((item) => (
                  <div className="region-risk-row" key={item.region}>
                    <div>
                      <strong>{item.region}</strong>
                      <span>{item.count} countries · ERP {fmtPercent(item.erp)}</span>
                    </div>
                    <i style={{ width: `${Math.min(item.erp / 0.16, 1) * 100}%` }} />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
