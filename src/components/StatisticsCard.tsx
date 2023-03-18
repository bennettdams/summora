export function StatisticsCard({
  label,
  no,
}: {
  label: string
  no: number
}): JSX.Element {
  return (
    <div className="flex-1 text-center">
      <p className="text-xl uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-5xl text-dsecondary">{no}</p>
    </div>
  )
}
