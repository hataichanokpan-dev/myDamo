import { type ChangeEvent, type CSSProperties } from 'react'
import Icon from './Icon'
import './FormField.css'

export interface FormFieldProps {
  label: string
  hint?: string
  source: 'auto' | 'user' | 'default'
  value: number
  onChange: (v: number) => void
  step?: number
  type?: 'number' | 'checkbox' | 'select'
  options?: { value: string; label: string }[]
  checked?: boolean
  style?: CSSProperties
}

type IconName = 'lock' | ''

const SOURCE_META: Record<string, { badge: string; tooltip: string; className: string; iconName: IconName }> = {
  auto: { badge: 'Auto', tooltip: 'From Yahoo Finance', className: 'ff--auto', iconName: 'lock' },
  user: { badge: '', tooltip: 'Your assumption', className: 'ff--user', iconName: '' },
  default: { badge: 'Default', tooltip: 'Damodaran default', className: 'ff--default', iconName: '' },
}

export default function FormField({
  label,
  hint,
  source,
  value,
  onChange,
  step,
  type = 'number',
  options,
  checked,
  style,
}: FormFieldProps) {
  const meta = SOURCE_META[source]

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (type === 'checkbox') {
      onChange((e as ChangeEvent<HTMLInputElement>).target.checked ? 1 : 0)
    } else {
      onChange(parseFloat(e.target.value) || 0)
    }
  }

  return (
    <div className={`ff ${meta.className}`} style={style} title={meta.tooltip}>
      <label className="ff-label">
        <span className="ff-label-text">{label}</span>
        {meta.badge && (
          <span className={`ff-badge ff-badge--${source}`}>
            {meta.iconName && <Icon name={meta.iconName} size="sm" />}
            {meta.badge}
          </span>
        )}
      </label>
      {hint && <span className="ff-hint">{hint}</span>}

      {type === 'checkbox' ? (
        <input
          className="ff-checkbox"
          type="checkbox"
          checked={checked ?? value !== 0}
          onChange={handleChange}
        />
      ) : type === 'select' ? (
        <select className="ff-select" value={value} onChange={handleChange}>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="ff-input"
          type="number"
          value={value}
          step={step ?? 'any'}
          onChange={handleChange}
          readOnly={source === 'auto'}
        />
      )}
    </div>
  )
}
