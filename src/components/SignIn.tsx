import Router from 'next/router'
import { useState } from 'react'
import { signInSchema, useAuth } from '../services/auth-service'
import { landingPageRoute } from '../services/routing'
import { useZodForm } from '../util/use-zod-form'
import { Button } from './Button'
import { Form, FormLabel, FormSubmit, Input } from './form'
import { IconSignIn } from './Icon'

export function SignIn(): JSX.Element {
  const { signInWithEmailAndPassword, signUpWithEmailAndPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const { handleSubmit, register, formState } = useZodForm({
    schema: signInSchema,
    defaultValues: {
      email: process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? '',
      password: process.env.NEXT_PUBLIC_DEFAULT_PASSWORD ?? '',
    },
    mode: 'onSubmit',
  })

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-dlila">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Come back to correct that little typo. Or create a new post, you do
            you.
          </p>
        </div>

        <div className="rounded-xl bg-white p-12 shadow-xl">
          <Form
            className="mx-auto mb-10 w-full space-y-6"
            onSubmit={handleSubmit(async (data) => {
              setIsLoading(true)
              await signInWithEmailAndPassword(data)
              setIsLoading(false)

              Router.push(landingPageRoute)
            })}
          >
            <div>
              <FormLabel htmlFor="email-input">Username</FormLabel>
              <Input
                {...register('email')}
                id="email-input"
                hasLabel={true}
                validationErrorMessage={formState.errors.email?.message}
              />
            </div>

            <div>
              <FormLabel htmlFor="password-input">Password</FormLabel>
              <Input
                {...register('password')}
                id="password-input"
                hasLabel={true}
                type="password"
                validationErrorMessage={formState.errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-dlila focus:ring-dlila"
                />
                {/* TODO implement */}
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                {/* TODO implement */}
                <a
                  href="#"
                  className="font-medium text-dlila hover:text-dorange"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="grid">
              <FormSubmit
                isInitiallySubmittable={true}
                icon={<IconSignIn />}
                isValid={formState.isValid}
                isDirty={formState.isDirty}
                submitCount={formState.submitCount}
                isSubmitting={formState.isSubmitting}
                isValidating={formState.isValidating}
                isLoading={isLoading}
              >
                Sign in
              </FormSubmit>
            </div>
          </Form>

          <div className="flex items-center py-4">
            {/* left line */}
            <div className="h-px flex-grow bg-gray-300"></div>

            <span className="font-light flex-shrink px-4 italic">
              Or continue with
            </span>

            {/* right line */}
            <div className="h-px flex-grow bg-gray-300"></div>
          </div>

          <div className="grid">
            <Button
              onClick={() =>
                signUpWithEmailAndPassword(
                  process.env.NEXT_PUBLIC_DEFAULT_USERNAME ?? '',
                  process.env.NEXT_PUBLIC_DEFAULT_EMAIL ?? '',
                  process.env.NEXT_PUBLIC_DEFAULT_PASSWORD ?? ''
                )
              }
            >
              Sign up
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            For free, of course.
          </p>
        </div>
      </div>
    </div>
  )
}
