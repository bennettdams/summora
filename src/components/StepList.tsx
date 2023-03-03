import { NoContent } from './NoContent'

export function StepList({
  steps,
}: {
  steps: { no: number; title: string; subtitle: string | null }[]
}): JSX.Element {
  return (
    <div className="flex flex-col">
      {steps.length === 0 ? (
        <NoContent>No steps yet</NoContent>
      ) : (
        steps.map((step, index) => (
          <div key={step.no} className="relative flex pb-12">
            {index !== steps.length - 1 && (
              <div className="absolute inset-0 flex h-full w-8 items-center justify-center">
                <div className="pointer-events-none h-full w-1 bg-dtertiary"></div>
              </div>
            )}

            <div className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dsecondary text-xl leading-none text-white">
              {step.no + 1}
            </div>

            <div className="pl-4 text-sm">
              <p>{step.title}</p>
              <h2 className="mb-1 text-xs font-semibold italic tracking-wider text-dtertiary">
                {step.subtitle}
              </h2>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
