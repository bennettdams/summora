import { RadioGroup } from '@headlessui/react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { cloneElement, isValidElement, useState } from 'react'
import { IconProps } from './icons'

type Choice<TChoiceId extends string> = {
  choiceId: TChoiceId
  label: string
  description?: string
  icon?: ReactNode
}

type ChoiceSelectControl<
  TChoices extends readonly Choice<TChoiceId>[],
  TChoiceId extends string,
> = {
  selected: Choice<TChoiceId>
  setSelected: Dispatch<SetStateAction<Choice<TChoiceId>>>
  choices: TChoices
}

export function useChoiceSelect<
  TChoices extends readonly Choice<TChoiceId>[],
  TChoiceId extends string,
>(
  choices: TChoices,
  // infer the values of all choice IDs from the given choices
  initiallySelectedChoiceId?: TChoices[number]['choiceId'] extends infer UChoiceId
    ? string extends UChoiceId
      ? never
      : UChoiceId
    : never,
): ChoiceSelectControl<TChoices, TChoices[number]['choiceId']> {
  const [selected, setSelected] = useState<Choice<TChoiceId>>(() => {
    const choiceFound = choices.find(
      (choice) => choice.choiceId === initiallySelectedChoiceId,
    )
    if (!choiceFound) {
      throw new Error('Choice for choice ID not found.')
    } else {
      return choiceFound
    }
  })

  return { selected, setSelected, choices }
}

export function ChoiceSelect<
  TChoices extends Choice<TChoiceId>[],
  TChoiceId extends string,
>({
  control,
  onSelect,
}: {
  control: ChoiceSelectControl<TChoices, TChoiceId>
  onSelect?: (selected: Choice<TChoiceId>) => void
}) {
  return (
    <RadioGroup
      by="choiceId"
      value={control.selected}
      onChange={(val: (typeof control.choices)[number]) => {
        control.setSelected(val)
        onSelect?.(val)
      }}
    >
      <div className="flex w-full flex-row space-x-2">
        {control.choices.map((choice) => (
          <RadioGroup.Option
            key={choice.choiceId}
            value={choice}
            className={({ active, checked }) =>
              `${
                active
                  ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-dsecondary'
                  : ''
              } ${
                checked
                  ? // keep in sync with Button component
                    'border border-dprimary bg-dprimary bg-gradient-to-r from-dprimary to-dprimary/90 text-white ring-orange-500 hover:bg-pink-900 hover:bg-none active:bg-dprimary/40'
                  : 'border border-gray-300 bg-white'
              } relative flex w-full cursor-pointer rounded-lg px-5 py-2 transition duration-500 hover:shadow-md focus:outline-none`
            }
          >
            {({ checked }) => (
              <>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className={`font-medium  ${
                          checked ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {choice.label}
                      </RadioGroup.Label>

                      {choice.description && (
                        <RadioGroup.Description
                          as="span"
                          className={`inline ${
                            checked ? 'text-sky-100' : 'text-gray-500'
                          }`}
                        >
                          <span>{choice.description}</span>
                        </RadioGroup.Description>
                      )}
                    </div>
                  </div>

                  {choice.icon && (
                    <div className="ml-2 shrink-0">
                      {isValidElement<IconProps>(choice.icon) ? (
                        cloneElement<IconProps>(choice.icon, {
                          className: 'text-dtertiary',
                        })
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
