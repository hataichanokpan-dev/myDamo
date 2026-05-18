const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

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

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    })
    return res.ok ? await res.text() : ''
  } catch { return '' }
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url)
  const ticker = url.searchParams.get('ticker')
  if (!ticker) {
    return Response.json({ error: 'Missing ticker parameter' }, { status: 400 })
  }

  try {
    const [chartRes, html] = await Promise.all([
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(10000),
      }).catch(() => null),
      fetchPage(`https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/`),
    ])

    let meta: any = {}
    if (chartRes?.ok) {
      try {
        const chartData = await chartRes.json()
        meta = chartData?.chart?.result?.[0]?.meta || {}
      } catch { /* ignore */ }
    }

    let summaryData: any = null
    if (html) {
      try { summaryData = extractQuoteSummary(html) } catch { /* ignore */ }
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
      ? 1 - (netIncome / operatingIncome)
      : 0

    const result = {
      symbol: meta.symbol || ticker,
      shortName: meta.shortName || sp?.shortName || ticker,
      longName: meta.longName || sp?.longName || meta.shortName || ticker,
      currency: meta.currency || fd.financialCurrency || 'USD',
      exchange: meta.fullExchangeName || meta.exchangeName || '',
      price: meta.regularMarketPrice || raw(sd, 'regularMarketPrice') || 0,
      previousClose: meta.chartPreviousClose || raw(sd, 'previousClose') || 0,
      marketCap: raw(sd, 'marketCap') || raw(dk, 'enterpriseValue') || 0,
      sharesOutstanding,
      revenue: totalRevenue,
      totalRevenue,
      costOfRevenue: totalRevenue > 0 && grossProfits > 0 ? totalRevenue - grossProfits : 0,
      grossProfit: grossProfits,
      operatingIncome,
      ebit: operatingIncome,
      netIncome,
      interestExpense: 0,
      totalAssets: typeof raw(dk, 'totalAssets') === 'number' ? raw(dk, 'totalAssets') : 0,
      totalLiabilities: 0,
      totalDebt,
      totalEquity: Math.round(totalEquity),
      totalCash: raw(fd, 'totalCash'),
      beta: raw(dk, 'beta') || 1,
      effectiveTaxRate: Math.max(0, Math.min(effectiveTaxRate, 0.5)),
      returnOnEquity: raw(fd, 'returnOnEquity'),
      sector: sp?.sector || '',
      industry: sp?.industry || '',
      country: sp?.country || '',
      dividendYield: raw(sd, 'dividendYield'),
      fiftyTwoWeekHigh: raw(sd, 'fiftyTwoWeekHigh') || meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: raw(sd, 'fiftyTwoWeekLow') || meta.fiftyTwoWeekLow || 0,
    }

    return Response.json(result, {
      headers: { 'Cache-Control': 's-maxage=300' },
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
