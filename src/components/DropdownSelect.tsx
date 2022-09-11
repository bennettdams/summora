import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Fragment, useEffect, useState } from 'react'

export interface DropdownItem {
  itemId: string
  label: string
}

export function DropdownSelect({
  items,
  initialItem,
  onChange,
  onChangeSelection,
  unselectedLabel,
  shouldSyncInitialItem,
  selectedItemIdExternal,
}: {
  items: DropdownItem[] | null
  unselectedLabel?: string
} & ( // the selection is either handled in the parent or in this component
  | {
      selectedItemIdExternal: string | null
      onChangeSelection: (newItem: string) => void
      onChange?: never
      initialItem?: never
      shouldSyncInitialItem?: never
    }
  | {
      selectedItemIdExternal?: never
      onChangeSelection?: never
      onChange: (newItem: DropdownItem) => void
      initialItem: DropdownItem | null
      shouldSyncInitialItem: boolean
    }
)): JSX.Element {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    selectedItemIdExternal ?? initialItem?.itemId ?? null
  )

  useEffect(() => {
    if (shouldSyncInitialItem) setSelectedItemId(initialItem?.itemId ?? null)
  }, [shouldSyncInitialItem, initialItem])

  function handleSelect(newItemId: string) {
    setSelectedItemId(newItemId)

    if (onChangeSelection) {
      onChangeSelection(newItemId)
    } else {
      const itemSelected = items?.find((item) => item.itemId === newItemId)
      if (itemSelected) onChange(itemSelected)
    }
  }

  return (
    <Listbox value={selectedItemId} onChange={handleSelect}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-dorange sm:text-sm">
          {!selectedItemId ? (
            <span className="block truncate italic">
              {unselectedLabel ?? 'Please select an item.'}
            </span>
          ) : (
            <span className="block truncate">
              {items?.find((item) => item.itemId === selectedItemId)?.label}
            </span>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon className="h-5 w-5 text-dorange" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm md:w-52">
            {!items ? (
              <p className="py-2 pl-10 pr-4">No options available</p>
            ) : (
              items.map((item) => (
                <Listbox.Option
                  key={item.itemId}
                  className={({ active }) =>
                    `${active && 'bg-dorange text-white'}
                      relative cursor-default select-none py-2 pl-10 pr-4`
                  }
                  value={item.itemId}
                >
                  {({ active, selected }) => (
                    <>
                      <span
                        className={`${
                          selected ? 'font-semibold' : 'font-normal'
                        } block truncate`}
                      >
                        {item.label}
                      </span>
                      {/* TODO does not work*/}
                      {selected ? (
                        <span
                          className={`${active && 'text-dorange'}
                            absolute inset-y-0 left-0 flex items-center pl-3`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
