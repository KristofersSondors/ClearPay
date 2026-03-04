import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import type { ReactNode } from 'react'

interface AppLayoutProps {
  showHeader?: boolean
  showBottomNav?: boolean
  headerProps?: { showAdd?: boolean; showSettings?: boolean }
  children?: ReactNode
}

export function AppLayout({
  showHeader = true,
  showBottomNav = true,
  headerProps = {},
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <Header {...headerProps} />}
      <main className="flex-1 flex flex-col pb-20 overflow-auto">
        {children ?? <Outlet />}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
