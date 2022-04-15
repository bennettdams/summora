import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'

export function FormInput({
  placeholder,
  children,
  onSubmit,
  onChange,
  autoFocus = true,
  initialValue = '',
  resetOnSubmit = false,
  formId,
}: {
  placeholder?: string
  children?: ReactNode
  autoFocus?: boolean
  initialValue?: string
  resetOnSubmit?: boolean
  formId?: string
} & (
  | {
      onSubmit: (inputValue: string) => Promise<void>
      onChange?: never
    }
  | {
      onSubmit?: never
      onChange: (inputValue: string) => void
    }
)): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(initialValue)
  const [id] = useState(Math.random())
  const [isDisabled, setIsDisabled] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setIsDisabled(true)

    if (inputValue !== '' && inputValue !== initialValue) {
      const inputValueNew = inputValue

      if (resetOnSubmit) {
        setInputValue('')
      }

      await onSubmit?.(inputValueNew)
    }

    // TODO throws error for cases where input is unmounted after submit...
    setIsDisabled(false)
  }

  const internals = (
    <>
      <label htmlFor={`inputId ${id}`} className="block text-sm font-semibold">
        {children}
      </label>
      <input
        type="text"
        name="input"
        form={formId}
        value={inputValue}
        disabled={isDisabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const inputValueNew = event.target.value
          setInputValue(inputValueNew)
          onChange?.(inputValueNew)
        }}
        onSubmit={handleSubmit}
        id={`inputId ${id}`}
        className="mt-1 block w-full rounded-md border-dbrown shadow-md focus:border-dorange focus:ring-dorange disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
      />
    </>
  )

  return onSubmit ? (
    <form id={formId} onSubmit={handleSubmit} className="inline-block w-full">
      {internals}
    </form>
  ) : (
    <div className="inline-block w-full">{internals}</div>
  )
}
