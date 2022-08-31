import { forwardRef, ReactNode } from 'react'
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { Button, ButtonProps } from './Button'
import { DropdownItem, DropdownSelect } from './DropdownSelect'
import { IconOkCircle } from './Icon'

export function FormLabel({
  ...props
}: React.ComponentPropsWithoutRef<'label'>): JSX.Element {
  return (
    <label
      className="block text-left text-sm uppercase tracking-widest text-gray-400"
      {...props}
    >
      {props.children}
    </label>
  )
}

export type FormSubmitProps = {
  isLoading: boolean
  isValid: boolean
  isValidating: boolean
  isSubmitted: boolean
  isSubmitting: boolean
  icon?: ButtonProps['icon']
  children?: ReactNode
}

export function FormSubmit(props: FormSubmitProps): JSX.Element {
  // we ignore the "invalid" status for a form that has not been submitted yet
  const isValidForm =
    !props.isSubmitted || (props.isValid && !props.isValidating)

  return (
    <Button
      disabled={!isValidForm || props.isSubmitting}
      isSubmit={true}
      icon={props.icon ?? <IconOkCircle />}
      showLoading={props.isLoading}
    >
      <span>{props.children ?? 'Submit'}</span>
      <input className="hidden" type="submit" />
    </Button>
  )
}

type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  small?: boolean
  hasLabel?: boolean
} & (
    | { canHaveValidationError?: true; validationErrorMessage?: string }
    | { canHaveValidationError?: false; validationErrorMessage?: never }
  )

/**
 * Additional props:
 * - small?: `boolean`
 * - hasLabel?: `boolean`
 * // use this to show additional vertical space next to the input in case you want to show errors
 * - canHaveValidationError?: `boolean`
 * - validationErrorMessage?: `string`
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    small = false,
    hasLabel = true,
    canHaveValidationError = true,
    validationErrorMessage = undefined,
    ...props
  },
  ref
): JSX.Element {
  return (
    <div className="relative">
      <input
        type={props.type ?? 'text'}
        className={
          'block w-full rounded-md shadow-sm placeholder:text-indigo-300 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-100' +
          // only show margin when there is a label
          ` ${hasLabel && !small && 'mt-1'}` +
          ` ${small ? 'py-1.5 px-2 text-xs' : 'text-sm'}` +
          ` ${
            !props.required
              ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              : 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500'
          }`
        }
        {...props}
        ref={ref}
      />

      {canHaveValidationError && (
        <div className="absolute mt-2">
          <FormError message={validationErrorMessage} />
        </div>
      )}
    </div>
  )
})

export function FormError({
  message,
}: {
  message: string | undefined
}): JSX.Element {
  return (
    <p className="text-left text-sm text-yellow-500">
      {message ?? <span className="opacity-0">&nbsp;</span>}
    </p>
  )
}

export function Form(
  props: React.ComponentPropsWithoutRef<'form'>
): JSX.Element {
  return (
    <form className={props.className ?? 'inline-block w-full'} {...props}>
      {props.children}
    </form>
  )
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  items,
  unselectedLabel,
}: {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  items: DropdownItem[]
  unselectedLabel: string
}): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: fieldSelection }) => (
        <DropdownSelect
          unselectedLabel={unselectedLabel}
          selectedItemIdExternal={fieldSelection.value ?? null}
          items={items}
          onChangeSelection={(selectedItemId) => {
            fieldSelection.onChange(selectedItemId)
          }}
        />
      )}
    />
  )
}
