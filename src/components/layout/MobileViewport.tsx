import type { ReactNode } from 'react'

export function MobileViewport({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[430px] min-h-screen mx-auto bg-white shadow-xl">
      {children}
    </div>
  )
}
