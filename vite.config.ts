import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import https from 'node:https'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function raw(obj: any, key: string): number {
  const v = obj?.[key]
  if (v == null) return 0
  if (typeof v === 'object' && 'raw' in v) return v.raw
  if (typeof v === 'number') return v
  return 0
}

function httpsGet(url: string, headers: Record<string, string> = {}): Promise<{ status: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, ...headers }, maxHeaderSize: 65536 } as any, (res) => {
      let body = ''
      res.on('data', (d: Buffer) => (body += d))
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

let cachedCookies = ''
let cachedCrumb = ''
let cacheExpiry = 0

async function getCrumbAuth(): Promise<{ cookies: string; crumb: string }> {
  if (cachedCookies && cachedCrumb && Date.now() < cacheExpiry) {
    return { cookies: cachedCookies, crumb: cachedCrumb }
  }
  const r1 = await httpsGet('https://finance.yahoo.com/', { Accept: 'text/html', 'Accept-Language': 'en-US,en;q=0.5' })
  const cookies = (r1.headers['set-cookie'] || []).map((c: string) => c.split(';')[0]).join('; ')
  if (!cookies) throw new Error('No cookies from Yahoo')
  const r2 = await httpsGet('https://query1.finance.yahoo.com/v1/test/getcrumb', { Cookie: cookies })
  if (r2.status !== 200) throw new Error('Crumb failed: ' + r2.status)
  const crumb = r2.body
  cachedCookies = cookies
  cachedCrumb = crumb
  cacheExpiry = Date.now() + 10 * 60 * 1000
  return { cookies, crumb }
}

async function fetchQuoteSummary(ticker: string): Promise<any> {
  try {
    const { cookies, crumb } = await getCrumbAuth()
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=financialData,defaultKeyStatistics,summaryDetail,summaryProfile&crumb=${encodeURIComponent(crumb)}`
    const r = await httpsGet(url, { Cookie: cookies })
    if (r.status !== 200) return null
    const data = JSON.parse(r.body)
    return data?.quoteSummary?.result?.[0] || null
  } catch {
    return null
  }
}

async function fetchStockData(ticker: string) {
  const [chartData, summaryData] = await Promise.all([
    fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetchQuoteSummary(ticker),
  ])

  let meta: any = {}
  if (chartData) {
    try { meta = chartData?.chart?.result?.[0]?.meta || {} } catch { /* */ }
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
    shortName: meta.shortName || sp?.shortName || ticker,
    longName: meta.longName || sp?.longName || meta.shortName || ticker,
    currency: meta.currency || fd.financialCurrency || 'USD',
    exchange: meta.fullExchangeName || meta.exchangeName || '',
    price: meta.regularMarketPrice || raw(sd, 'regularMarketPrice') || 0,
    previousClose: meta.chartPreviousClose || raw(sd, 'previousClose') || 0,
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
