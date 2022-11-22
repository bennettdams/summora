import { Listbox, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { IconOk, IconSelector } from './Icon'
import { NoContent } from './NoContent'

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
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-dsecondary sm:text-sm">
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
            <IconSelector />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md bg-white py-3 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm md:w-72">
            {!items ? (
              <div className="py-2">
                <NoContent>No options available.</NoContent>
              </div>
            ) : (
              items.map((item) => (
                <Listbox.Option
                  key={item.itemId}
                  className={({ active }) =>
                    `${active && 'bg-dsecondary text-white'}
                     cursor-default select-none py-2`
                  }
                  value={item.itemId}
                >
                  {({ active, selected }) => (
                    <div className="ml-4 flex items-center justify-start">
                      <span className={`w-12 ${active && 'text-white'}`}>
                        {selected && (
                          <IconOk
                            className={active ? 'text-white' : undefined}
                          />
                        )}
                      </span>
                      <span className="">{item.label}</span>
                    </div>
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
