import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Fragment, useState } from 'react'

export interface DropdownItem {
  id: string
  title: string
}

export function DropdownSelect({
  items,
  initialItem,
  onChange,
}: {
  items: DropdownItem[]
  initialItem?: DropdownItem
  onChange: (newItem: DropdownItem) => void
}): JSX.Element {
  const [selected, setSelected] = useState(initialItem)

  function handleSelect(newItem: DropdownItem) {
    setSelected(newItem)
    onChange(newItem)
  }

  return (
    <Listbox value={selected} onChange={handleSelect}>
      <div className="relative z-10 mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-dorange sm:text-sm">
          {!selected ? (
            <span className="block truncate italic">
              Please select an item.
            </span>
          ) : (
            <span className="block truncate">{selected.title}</span>
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
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm md:w-52">
            {items.map((item) => (
              <Listbox.Option
                key={item.id}
                className={({ active }) =>
                  `${active && 'bg-dorange text-white'}
                      relative cursor-default select-none py-2 pl-10 pr-4`
                }
                value={item}
              >
                {({ selected, active }) => (
                  <>
                    {console.log(selected)}
                    <span
                      className={`${
                        selected ? 'font-semibold' : 'font-normal'
                      } block truncate`}
                    >
                      {item.title}
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
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
