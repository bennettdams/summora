import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'

const defaultValue = ''

export function FormInput({
  placeholder,
  children,
  onSubmit,
  onBlur,
}: {
  onSubmit: (inputValue: string) => Promise<void>
  onBlur?: () => void
  placeholder?: string
  children?: ReactNode
}): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(defaultValue)
  const [id] = useState(Math.random())
  const [isDisabled, setIsDisabled] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setIsDisabled(true)

    if (inputValue !== '' && inputValue !== defaultValue) {
      const inputValueNew = inputValue
      setInputValue(defaultValue)
      await onSubmit(inputValueNew)
    }

    setIsDisabled(false)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label
        htmlFor={`inputId ${id}`}
        className="block text-sm font-medium text-gray-700"
      >
        {children}
      </label>

      <input
        onBlur={onBlur}
        type="text"
        name="input"
        value={inputValue}
        disabled={isDisabled}
        autoFocus
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
