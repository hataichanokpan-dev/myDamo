import { useEffect, useRef } from 'react'

export default function useAutoScrollResult<T>(value: T | null) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!value || !ref.current) return

    window.setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
  }, [value])

  return ref
}
