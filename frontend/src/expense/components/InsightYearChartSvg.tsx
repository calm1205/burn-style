import type { YearMonth } from "./InsightYearChart"

interface InsightYearChartSvgProps {
  year: YearMonth[]
  yMax: number
  avg: number
}

const W = 340
const H = 160
const PAD = 24

export const InsightYearChartSvg = ({ year, yMax, avg }: InsightYearChartSvgProps) => {
  const xAt = (i: number) => PAD + (i / (year.length - 1)) * (W - PAD * 2)
  const yAt = (v: number) => H - 26 - (v / yMax) * (H - 50)
  const linePath = year.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(d.amount)}`).join(" ")
  const areaPath = `${linePath} L ${xAt(year.length - 1)} ${H - 26} L ${PAD} ${H - 26} Z`
  const cw = ((W - PAD * 2) / year.length) * 0.55

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1.5 block">
      <line
        x1={PAD}
        x2={W - PAD}
        y1={yAt(avg)}
        y2={yAt(avg)}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 3"
        opacity="0.3"
      />
      <path d={areaPath} fill="var(--color-primary)" fillOpacity="0.14" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {year.map((d, i) => (
        <rect
          key={i}
          x={xAt(i) - cw / 2}
          y={yAt(d.amount)}
          width={cw}
          height={H - 26 - yAt(d.amount)}
          fill="var(--color-primary)"
          fillOpacity={d.current ? 0.85 : 0.28}
          rx="2"
        />
      ))}
      {year.map((d, i) => (
        <circle
          key={`p${i}`}
          cx={xAt(i)}
          cy={yAt(d.amount)}
          r={d.current ? 3.5 : 2}
          fill={d.current ? "var(--color-primary)" : "#ffffff"}
          stroke="var(--color-primary)"
          strokeWidth="1.2"
        />
      ))}
      {year.map((d, i) => (
        <text
          key={`l${i}`}
          x={xAt(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          opacity={d.current ? 1 : 0.5}
          fontWeight={d.current ? 700 : 500}
          fontFamily="inherit"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
