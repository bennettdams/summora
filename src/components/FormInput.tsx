import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'

export function FormInput({
  placeholder,
  children,
  onSubmit,
  autoFocus = true,
  initialValue = '',
  resetOnSubmit = false,
  formId,
}: {
  onSubmit: (inputValue: string) => Promise<void>
  placeholder?: string
  children?: ReactNode
  autoFocus?: boolean
  initialValue?: string
  resetOnSubmit?: boolean
  formId?: string
}): JSX.Element {
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

      await onSubmit(inputValueNew)
    }

    // throws error for cases where input is unmounted after submit...
    setIsDisabled(false)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="w-full inline-block">
      <label htmlFor={`inputId ${id}`} className="block text-sm font-semibold">
        {children}
      </label>

      <input
        type="text"
        name="input"
        value={inputValue}
        disabled={isDisabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        id={`inputId ${id}`}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </form>
  )
}
