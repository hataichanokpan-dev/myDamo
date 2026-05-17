/**
 * Format utilities for displaying financial numbers.
 * Formatters are ONLY for read-only displays — input values remain raw numbers.
 */

const SUFFIXES: [number, string][] = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
]

function withSuffix(n: number, suffix: string): string {
  return `${n.toFixed(2)}${suffix}`
}

export function fmtNumber(n: number): string {
  if (n === 0) return '0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  for (const [threshold, suffix] of SUFFIXES) {
    if (abs >= threshold) {
      return sign + withSuffix(abs / threshold, suffix)
    }
  }

  return sign + (Number.isInteger(abs) ? abs.toString() : abs.toFixed(2))
}

export function fmtPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`
}

export function fmtCurrency(n: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', THB: '฿' }
  const sym = symbols[currency] ?? `${currency} `
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  for (const [threshold, suffix] of SUFFIXES) {
    if (abs >= threshold) {
      return `${sign}${sym}${withSuffix(abs / threshold, suffix)}`
    }
  }

  return `${sign}${sym}${Number.isInteger(abs) ? abs.toString() : abs.toFixed(2)}`
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) < 0.005) return '0'
  const pct = fmtPercent(n)
  const num = fmtNumber(n)
  return pct.length < num.length ? pct : num
}
