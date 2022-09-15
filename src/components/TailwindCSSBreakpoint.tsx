export function TailwindCSSBreakpoint(): JSX.Element {
  return (
    <div className="fixed bottom-0 right-0 m-8 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 p-3 font-mono text-xs text-white sm:bg-pink-500 md:bg-orange-500 lg:bg-green-500 xl:bg-blue-500 2xl:bg-rose-500">
      <div className="block  sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden">
        al
      </div>
      <div className="hidden sm:block  md:hidden lg:hidden xl:hidden 2xl:hidden">
        sm
      </div>
      <div className="hidden sm:hidden md:block  lg:hidden xl:hidden 2xl:hidden">
        md
      </div>
      <div className="hidden sm:hidden md:hidden lg:block  xl:hidden 2xl:hidden">
        lg
      </div>
      <div className="hidden sm:hidden md:hidden lg:hidden xl:block  2xl:hidden">
        xl
      </div>
      <div className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block">
        2xl
      </div>
    </div>
  )
}
