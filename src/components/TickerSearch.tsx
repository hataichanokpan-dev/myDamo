import { useState } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import { fetchStockData } from '../hooks/useYahooFinance'
import { findCountryRisk, inferCountryFromTicker } from '../engines/countryRisk'
import type { CountryRiskRecord } from '../data/countryRiskLatest'
import CountryRiskPanel from './CountryRiskPanel'
import Icon from './Icon'
import Spinner from './Spinner'
import './TickerSearch.css'

interface Props {
  onData: (data: YahooFinanceData, ticker: string) => void
  onCountryRiskApply?: (risk: CountryRiskRecord, data: YahooFinanceData) => void
}

export default function TickerSearch({ onData, onCountryRiskApply }: Props) {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countryRisk, setCountryRisk] = useState<CountryRiskRecord | null>(null)
  const [lastData, setLastData] = useState<YahooFinanceData | null>(null)
  const [riskApplied, setRiskApplied] = useState(false)

  const handleFetch = async () => {
    const trimmed = ticker.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setSuccess('')
    setCountryRisk(null)
    setLastData(null)
    setRiskApplied(false)
    try {
      const data = await fetchStockData(trimmed)
      onData(data, data.symbol)
      const risk = findCountryRisk(data.country) ?? findCountryRisk(inferCountryFromTicker(trimmed) ?? '')
      setCountryRisk(risk)
      setLastData(data)
      if (risk && onCountryRiskApply) {
        onCountryRiskApply(risk, data)
        setRiskApplied(true)
      }
      setSuccess(`${data.symbol || trimmed} data loaded. Review the assumptions below.`)
      window.setTimeout(() => {
        document.querySelector('.calc-inputs')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 120)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ticker-search">
      <div className="ticker-input-row">
        <input
          type="text"
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="กรอก ticker (เช่น AAPL, MSFT, PTT.BK)"
          className="ticker-input"
        />
        <button onClick={handleFetch} disabled={loading} className="btn-primary ticker-btn">
          {loading ? <><Spinner size="sm" /> Fetching</> : <><Icon name="search" size="sm" /> Auto-Fill</>}
        </button>
      </div>
      {loading && (
        <div className="ticker-loading" role="status" aria-live="polite">
          <div className="ticker-loading__pulse">
            <Spinner size="md" />
          </div>
          <div className="ticker-loading__copy">
            <strong>Loading market data</strong>
            <span>Connecting to Yahoo Finance, reading financials, and preparing assumptions.</span>
          </div>
          <div className="ticker-loading__bar"><i /></div>
        </div>
      )}
      {error && <p className="ticker-error">{error}</p>}
      {success && !loading && <p className="ticker-success"><Icon name="activity" size="sm" /> {success}</p>}
      {countryRisk && lastData && (
        <CountryRiskPanel
          risk={countryRisk}
          marketData={lastData}
          applied={riskApplied}
          note={riskApplied
            ? 'These assumptions were auto-applied from the Damodaran country risk dataset.'
            : 'This page does not auto-apply country risk, but these values can guide your assumptions.'}
          onApply={onCountryRiskApply ? () => {
              onCountryRiskApply(countryRisk, lastData)
              setRiskApplied(true)
            } : undefined}
        />
      )}
      <p className="ticker-hint">หุ้นต่างประเทศ: ใส่สกุลหุ้นด้วยตัวเอง (เช่น PTT.BK, CPALL.BK สำหรับไทย) — ค่าเริ่มต้นคือหุ้นสหรัฐ</p>
    </div>
  )
}
