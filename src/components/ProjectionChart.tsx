import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtCompact, fmtPercent } from '../utils/format'
import './ProjectionChart.css'

interface ProjectionPoint {
  year: number
  revenue: number
  ebit?: number
  fcff?: number
  operatingMargin?: number
}

interface Props {
  data: ProjectionPoint[]
  title?: string
}

export default function ProjectionChart({ data, title = 'Projection Profile' }: Props) {
  const chartData = data.map((d) => ({
    year: `Y${d.year}`,
    revenue: d.revenue,
    ebit: d.ebit ?? 0,
    fcff: d.fcff ?? 0,
    margin: d.operatingMargin ?? 0,
  }))

  return (
    <section className="projection-chart" aria-label={title}>
      <div className="projection-chart__header">
        <div>
          <h3>{title}</h3>
          <p>Revenue scale, FCFF quality, and margin path in one view.</p>
        </div>
        <div className="projection-chart__legend" aria-hidden="true">
          <span><i className="legend-dot legend-dot--revenue" />Revenue</span>
          <span><i className="legend-dot legend-dot--fcff" />FCFF</span>
          <span><i className="legend-dot legend-dot--margin" />Margin</span>
        </div>
      </div>
      <div className="projection-chart__canvas">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 4, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066cc" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(29,29,31,0.07)" vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7a7a7a' }} />
            <YAxis yAxisId="value" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7a7a7a' }} tickFormatter={fmtCompact} />
            <YAxis yAxisId="margin" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7a7a7a' }} tickFormatter={fmtPercent} />
            <Tooltip
              formatter={(value: number, name: string) => [name === 'margin' ? fmtPercent(value) : fmtCompact(value), name.toUpperCase()]}
              labelStyle={{ color: '#1d1d1f', fontWeight: 600 }}
              contentStyle={{ border: '1px solid #e0e0e0', borderRadius: 11, boxShadow: 'none' }}
            />
            <Area yAxisId="value" type="monotone" dataKey="revenue" stroke="#0066cc" strokeWidth={2} fill="url(#revenueFill)" />
            <Bar yAxisId="value" dataKey="fcff" fill="#1d1d1f" radius={[5, 5, 0, 0]} barSize={14} />
            <Line yAxisId="margin" type="monotone" dataKey="margin" stroke="#34c759" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
