import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-32 md:px-6 md:pt-8 md:pb-10">
          <Topbar />
          <main className="mt-2 md:mt-0">{children}</main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
