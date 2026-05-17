import './Spinner.css'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div className={`spinner spinner--${size} ${className}`} role="status" aria-label="Loading">
      <svg viewBox="0 0 24 24" fill="none">
        <circle className="spinner-track" cx="12" cy="12" r="10" />
        <circle className="spinner-fill" cx="12" cy="12" r="10" />
      </svg>
    </div>
  )
}
