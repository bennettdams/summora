export function StepList({
  steps,
}: {
  steps: { no: number; title: string; subtitle: string | null }[]
}): JSX.Element {
  return (
    <div className="flex w-full flex-col">
      {/* <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6"> */}
      {steps.map((step, index) => (
        <div key={step.no} className="relative flex pb-12">
          {index !== steps.length - 1 && (
            <div className="absolute inset-0 flex h-full w-10 items-center justify-center">
              <div className="pointer-events-none h-full w-1 bg-gray-200"></div>
            </div>
          )}
          <div className="font-bold relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-lime-600 text-xl leading-none text-white">
            {step.no + 1}
          </div>
          <div className="grow pl-4">
            <p>{step.title}</p>
            <h2 className="mb-1 text-sm font-semibold tracking-wider">
              {step.subtitle}
            </h2>
          </div>
        </div>
      ))}
    </div>
    // </div>
  )
}
