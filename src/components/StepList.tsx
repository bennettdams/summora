export function StepList({
  steps,
}: {
  steps: { no: number; title: string; subtitle: string | null }[]
}): JSX.Element {
  return (
    <div className="flex flex-col w-full">
      {/* <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6"> */}
      {steps.map((step, index) => (
        <div key={step.no} className="flex relative pb-12">
          {index !== steps.length - 1 && (
            <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
            </div>
          )}
          <div className="flex-shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-orange-500 to-lime-600 text-white text-xl font-bold leading-none relative">
            {step.no + 1}
          </div>
          <div className="flex-grow pl-4">
            <p>{step.title}</p>
            <h2 className="font-semibold text-sm mb-1 tracking-wider">
              {step.subtitle}
            </h2>
          </div>
        </div>
      ))}
    </div>
    // </div>
  )
}
