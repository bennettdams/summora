import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, UseFormProps } from 'react-hook-form'
import { z } from 'zod'

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & {
    schema: TSchema
  }
) {
  const form = useForm<TSchema['_input']>({
    ...props,
    reValidateMode: props.reValidateMode ?? 'onChange',
    resolver: zodResolver(props.schema, undefined, {
      // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server.
      raw: true,
    }),
  })

  /*
   * Default values are meant to be the values that are used before any other value is provided.
   * Because of that, in order to prevent overriding user input, default values are not reactive on purpose.
   * Here, we manually reset the default values to when the initial data that created them changes, so the
   * validation is used against the correct values.
   *
   * See: https://github.com/react-hook-form/react-hook-form/discussions/9294
   *
   * Without this check, the submit would be valid for values that are equal to before the change.
   *
   * e.g.
   *  - initialized with text "f"
   *  - user submits "fo"
   *  - remote data changes and comes back
   *  - user changes text to "foo" without submitting
   *  - user changes text to "fo" -> the submit would be valid, because it is not checked against the new default values
   *    after the first submit (default values are still "f")
   *
   */
  useEffect(() => {
    form.reset(props.defaultValues)
  }, [form, props.defaultValues])

  return form
}
