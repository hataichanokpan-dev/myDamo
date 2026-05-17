import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function curlPage(url: string): string {
  try {
    return execSync(
      `curl -s --compressed -H "User-Agent: ${UA}" -H "Accept: text/html" "${url}"`,
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8', timeout: 15000 }
    )
  } catch { return '' }
}

function raw(obj: any, key: string): number {
  const v = obj?.[key]
  if (v == null) return 0
  if (typeof v === 'object' && 'raw' in v) return v.raw
  if (typeof v === 'number') return v
  return 0
}

function extractQuoteSummary(html: string) {
  const regex = /<script type="application\/json" data-sveltekit-fetched[^>]*data-url="([^"]*quoteSummary[^"]*)"[^>]*>([\s\S]*?)<\/script>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      let d = JSON.parse(match[2])
      if (d.body && typeof d.body === 'string') d = JSON.parse(d.body)
      if (d?.quoteSummary?.result?.[0]) return d.quoteSummary.result[0]
    } catch { /* try next */ }
  }
  return null
}

async function fetchStockData(ticker: string) {
  const chartPromise = fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`, { headers: { 'User-Agent': UA } })
    .then(r => r.ok ? r.json() : null).catch(() => null)
  const pagePromise = Promise.resolve(curlPage(`https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/`))

  const [chartData, html] = await Promise.all([chartPromise, pagePromise])

  let meta: any = {}
  if (chartData) {
    try { meta = chartData?.chart?.result?.[0]?.meta || {} } catch { /* */ }
  }

  let summaryData: any = null
  if (html) {
    try { summaryData = extractQuoteSummary(html) } catch { /* */ }
  }

  const fd = summaryData?.financialData || {}
  const dk = summaryData?.defaultKeyStatistics || {}
  const sd = summaryData?.summaryDetail || {}
  const sp = summaryData?.summaryProfile || {}

  const totalRevenue = raw(fd, 'totalRevenue')
  const operatingMargins = raw(fd, 'operatingMargins')
  const operatingIncome = totalRevenue > 0 && operatingMargins > 0 ? totalRevenue * operatingMargins : 0
  const grossProfits = raw(fd, 'grossProfits')
  const netIncome = raw(dk, 'netIncomeToCommon')
  const bookValuePerShare = raw(dk, 'bookValue')
  const sharesOutstanding = raw(dk, 'sharesOutstanding')
  const totalDebt = raw(fd, 'totalDebt')
  const debtToEquity = raw(fd, 'debtToEquity')
  const totalEquity = bookValuePerShare > 0 && sharesOutstanding > 0
    ? bookValuePerShare * sharesOutstanding
    : (debtToEquity > 0 ? totalDebt / (debtToEquity / 100) : 0)
  const effectiveTaxRate = operatingIncome > 0 && netIncome > 0
    ? 1 - (netIncome / operatingIncome) : 0

  return {
    symbol: meta.symbol || ticker,
    shortName: meta.shortName || ticker,
    longName: meta.longName || meta.shortName || ticker,
    currency: meta.currency || 'USD',
    exchange: meta.fullExchangeName || meta.exchangeName || '',
    price: meta.regularMarketPrice || raw(sd, 'regularMarketPrice') || 0,
    previousClose: meta.chartPreviousClose || 0,
    marketCap: raw(sd, 'marketCap') || raw(dk, 'enterpriseValue') || 0,
    sharesOutstanding,
    revenue: totalRevenue, totalRevenue,
    costOfRevenue: totalRevenue > 0 && grossProfits > 0 ? totalRevenue - grossProfits : 0,
    grossProfit: grossProfits,
    operatingIncome, ebit: operatingIncome, netIncome,
    interestExpense: 0,
    totalAssets: raw(dk, 'totalAssets'), totalLiabilities: 0,
    totalDebt, totalEquity: Math.round(totalEquity), totalCash: raw(fd, 'totalCash'),
    beta: raw(dk, 'beta') || 1,
    effectiveTaxRate: Math.max(0, Math.min(effectiveTaxRate, 0.5)),
    returnOnEquity: raw(fd, 'returnOnEquity'),
    sector: sp?.sector || '', industry: sp?.industry || '', country: sp?.country || '',
    dividendYield: raw(sd, 'dividendYield'),
    fiftyTwoWeekHigh: raw(sd, 'fiftyTwoWeekHigh') || meta.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: raw(sd, 'fiftyTwoWeekLow') || meta.fiftyTwoWeekLow || 0,
  }
}

function yahooFinanceProxy(): Plugin {
  return {
    name: 'yahoo-finance-proxy',
    configureServer(server) {
      server.middlewares.use('/api/stock', async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost')
        const ticker = url.searchParams.get('ticker')
        if (!ticker) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Missing ticker' }))
          return
        }
        try {
          const result = await fetchStockData(ticker)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err: any) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          { urlPattern: /\/api\/.*/, handler: 'NetworkOnly' },
          { urlPattern: /^https:\/\/fonts\.googleapis\.com/, handler: 'CacheFirst', options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com/, handler: 'CacheFirst', options: { cacheName: 'gstatic-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
      },
      manifest: {
        name: 'Damodaran Valuation Toolkit',
        short_name: 'Damodaran',
        description: 'Valuation models based on Aswath Damodaran spreadsheets',
        theme_color: '#0066cc',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
    yahooFinanceProxy(),
  ],
  build: { outDir: 'dist', sourcemap: false },
})
