export function StatisticsCard({
  label,
  no,
}: {
  label: string
  no: number
}): JSX.Element {
  return (
    <div className="flex-1 text-center">
      <p className="text-xl">{label}</p>
      <p className="mt-1 text-5xl text-dorange">{no}</p>
    </div>
  )
}
