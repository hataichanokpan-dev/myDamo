import './Skeleton.css'

interface Props {
  width?: string
  height?: string
  radius?: string
  className?: string
}

export default function Skeleton({ width = '100%', height = '20px', radius = 'var(--radius-sm)', className = '' }: Props) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
