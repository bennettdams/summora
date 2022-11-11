import { forwardRef, ReactNode } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues,
  FormState,
} from 'react-hook-form'
import { generalFormErrorKey } from '../lib/schemas'
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

type FormSubmitPropsShared<TFieldValues extends FieldValues> = {
  formState: FormState<TFieldValues>
  isLoading: boolean
  /** By default, we don't allow submitting initially without changes to trigger validation. This can be disabled herewith. */
  isInitiallySubmittable?: boolean
}

type FormSubmitProps<TFieldValues extends FieldValues> =
  FormSubmitPropsShared<TFieldValues> & {
    icon?: ButtonProps['icon']
    isBig?: boolean
    children?: ReactNode
  }

export function useIsSubmitEnabled<TFieldValues extends FieldValues>(
  props: FormSubmitPropsShared<TFieldValues>
) {
  const isValidForm = !!props.formState.isValid && !props.formState.isValidating

  /** Even an invalid form can be submitted if it has not been submitted yet and if it is initially submittable. */
  const isInitialSubmit =
    !!props.isInitiallySubmittable && props.formState.submitCount === 0

  const isEnabled =
    ((isValidForm && !!props.formState.isDirty) || isInitialSubmit) &&
    !props.formState.isSubmitting

  return isEnabled
}

export function FormSubmit<TFieldValues extends FieldValues>(
  props: FormSubmitProps<TFieldValues>
): JSX.Element {
  const isEnabled = useIsSubmitEnabled(props)

  return (
    <Button
      disabled={!isEnabled}
      isSubmit={true}
      icon={props.icon ?? <IconOkCircle />}
      showLoading={props.isLoading}
      isBig={props.isBig}
    >
      {props.children ?? <span>Save</span>}
      <input className="hidden" type="submit" />
    </Button>
  )
}

type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  small?: boolean
  hasLabel?: boolean
  validationErrorMessage?: string
  /** This is used in forms that should submit on blur. */
  blurOnEnterPressed?: boolean
}

/**
 * Additional props:
 * - small?: `boolean`
 * - hasLabel?: `boolean`
 * - validationErrorMessage?: `string`
 * - blurOnEnterPressed?: `boolean`
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    small = false,
    hasLabel = true,
    validationErrorMessage = undefined,
    blurOnEnterPressed = false,
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
        // TODO Ideally, this is set on the form element and not the single inputs, but not sure about the implementation for that.
        onKeyDown={
          !blurOnEnterPressed
            ? undefined
            : (e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                }
              }
        }
        {...props}
        ref={ref}
      />

      {!!validationErrorMessage && (
        <div className="absolute mt-1">
          <FormError message={validationErrorMessage} />
        </div>
      )}
    </div>
  )
})

function FormError({ message }: { message: string | undefined }): JSX.Element {
  return (
    <p className="text-sm text-yellow-500">
      {message ?? <span className="opacity-0">&nbsp;</span>}
    </p>
  )
}

export function FormFieldError<TFieldValues extends FieldValues>({
  fieldName,
  errors,
  noMargin,
}: {
  fieldName: keyof FieldErrors<TFieldValues> | typeof generalFormErrorKey
  errors: FieldErrors<TFieldValues>
  noMargin?: boolean
}): JSX.Element {
  const errorForField = errors[fieldName]
  return (
    <div className={!noMargin ? 'mt-12' : ''}>
      <p key={String(fieldName)} className="text-center text-yellow-500">
        {<span>{errorForField?.message}</span> ?? (
          <span className="opacity-0">&nbsp;</span>
        )}
      </p>
    </div>
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
  validationErrorMessage,
  onChangeExternal,
}: {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  items: DropdownItem[]
  unselectedLabel: string
  validationErrorMessage?: string
  onChangeExternal?: (selectedId: string) => void
}): JSX.Element {
  return (
    <div className="relative">
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
              onChangeExternal?.(selectedItemId)
            }}
          />
        )}
      />

      <div className="absolute mt-2">
        <FormError message={validationErrorMessage} />
      </div>
    </div>
  )
}
