import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createEmptyValuationCase,
  type ValuationCase,
} from '../engines/valuationCase'

const STORAGE_KEY = 'damodaran-valuation-case-v1'

interface ValuationCaseContextValue {
  caseData: ValuationCase
  updateCase: (patch: Partial<ValuationCase> | ((current: ValuationCase) => ValuationCase)) => void
  resetCase: () => void
  exportCase: () => void
}

const ValuationCaseContext = createContext<ValuationCaseContextValue | null>(null)

function readStoredCase(): ValuationCase {
  if (typeof window === 'undefined') return createEmptyValuationCase()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return createEmptyValuationCase()
  try {
    return { ...createEmptyValuationCase(), ...JSON.parse(raw) }
  } catch {
    return createEmptyValuationCase()
  }
}

export function ValuationCaseProvider({ children }: { children: ReactNode }) {
  const [caseData, setCaseData] = useState<ValuationCase>(() => readStoredCase())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caseData))
  }, [caseData])

  const updateCase = useCallback<ValuationCaseContextValue['updateCase']>((patch) => {
    setCaseData((current) => {
      const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
      return { ...next, updatedAt: new Date().toISOString() }
    })
  }, [])

  const resetCase = useCallback(() => {
    setCaseData(createEmptyValuationCase())
  }, [])

  const exportCase = useCallback(() => {
    const blob = new Blob([JSON.stringify(caseData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const ticker = caseData.company?.ticker || 'valuation-case'
    link.href = url
    link.download = `${ticker}-valuation-case.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [caseData])

  const value = useMemo(() => ({ caseData, updateCase, resetCase, exportCase }), [caseData, updateCase, resetCase, exportCase])

  return (
    <ValuationCaseContext.Provider value={value}>
      {children}
    </ValuationCaseContext.Provider>
  )
}

export function useValuationCase() {
  const value = useContext(ValuationCaseContext)
  if (!value) throw new Error('useValuationCase must be used inside ValuationCaseProvider')
  return value
}
