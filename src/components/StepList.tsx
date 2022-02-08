export function StepList({
  steps,
}: {
  steps: { no: number; title: string; subtitle: string | null }[]
}): JSX.Element {
  return (
    <div className="flex w-full flex-col">
      {steps.map((step, index) => (
        <div key={step.no} className="relative flex pb-12">
          {index !== steps.length - 1 && (
            <div className="absolute inset-0 flex h-full w-8 items-center justify-center">
              <div className="pointer-events-none h-full w-1 bg-gray-200"></div>
            </div>
          )}
          <div className="font-bold relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-lime-600 text-xl leading-none text-white">
            {step.no + 1}
          </div>
          <div className="grow pl-4 text-sm">
            <p>{step.title}</p>
            <h2 className="mb-1 text-xs font-semibold italic tracking-wider text-gray-400">
              {step.subtitle}
            </h2>
          </div>
        </div>
      ))}
    </div>
  )
}
