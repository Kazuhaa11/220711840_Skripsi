import Card from '@/components/ui/Card'

interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
}

export default function SummaryCard({
  title,
  value,
  subtitle,
}: SummaryCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </Card>
  )
}