import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'

const defaultValue = ''

export function FormInput({
  placeholder,
  children,
  onSubmit,
}: {
  onSubmit: (inputValue: string) => Promise<void>
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
      await onSubmit(inputValue)
      setInputValue(defaultValue)
    }
    setIsDisabled(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor={`inputId ${id}`}
        className="block text-sm font-medium text-gray-700"
      >
        {children}
        {isDisabled && <p>disabled</p>}
      </label>

      <input
        type="text"
        name="input"
        value={inputValue}
        disabled={isDisabled}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        id={`inputId ${id}`}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
      />
    </form>
  )
}
