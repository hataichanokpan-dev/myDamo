import './Icon.css'

const PATHS: Record<string, string> = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  x: 'M6 6l12 12M6 18L18 6',
  lock: 'M12 2a4 4 0 0 0-4 4v3H7a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4zm2 7H10V6a2 2 0 1 1 4 0v3z',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm4.35 12.35L19 19',
  chart: 'M3 20h18M7 16v4M11 12v8M15 8v12M19 4v16',
  shield: 'M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z',
  loading: 'M12 2a10 10 0 1 0 10 10',
  home: 'M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10',
  calc: 'M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4zm0 7h16M4 14h16M9 2v20M14 9l2 2 3-3',
  externalLink: 'M15 3h6v6M10 14L21 3M19 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8',
  // Nav-specific icons
  rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  trendingUp: 'M23 6l-9.5 9.5-5-5L1 18',
  gauge: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  repeat: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  beaker: 'M4.5 3h15M9 3v4.2c0 .6-.2 1.2-.6 1.6L5.5 13h13l-2.9-4.2c-.4-.4-.6-1-.6-1.6V3',
  fileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  percent: 'M19 5L5 19M6.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
}

interface Props {
  name: keyof typeof PATHS
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Icon({ name, size = 'md', className = '' }: Props) {
  const d = PATHS[name]
  if (!d) return null

  const isFilled = ['lock', 'shield', 'home'].includes(name)

  return (
    <svg
      className={`icon icon--${size} ${className}`}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={isFilled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
