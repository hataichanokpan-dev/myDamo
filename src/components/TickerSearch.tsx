import { useState } from 'react'
import type { YahooFinanceData } from '../hooks/useYahooFinance'
import { fetchStockData } from '../hooks/useYahooFinance'
import './TickerSearch.css'

interface Props {
  onData: (data: YahooFinanceData, ticker: string) => void
}

export default function TickerSearch({ onData }: Props) {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFetch = async () => {
    const trimmed = ticker.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchStockData(trimmed)
      onData(data, data.symbol)
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
          placeholder="Enter ticker (e.g. AAPL, MSFT, PTT.BK)"
          className="ticker-input"
        />
        <button onClick={handleFetch} disabled={loading} className="btn-primary ticker-btn">
          {loading ? 'Loading...' : 'Auto-Fill'}
        </button>
      </div>
      {error && <p className="ticker-error">{error}</p>}
      <p className="ticker-hint">International stocks: add exchange suffix manually (e.g. PTT.BK, CPALL.BK for Thailand)</p>
    </div>
  )
}
