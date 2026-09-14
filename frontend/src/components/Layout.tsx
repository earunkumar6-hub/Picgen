import { Image, LayoutGrid, Sparkles, SquareStack } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/builder', label: 'Prompt Builder', icon: Sparkles, end: false },
  { to: '/studio', label: 'Image Studio', icon: Image, end: false },
  { to: '/templates', label: 'Templates', icon: SquareStack, end: false },
]

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">SIP AI Design Studio</span>
          <nav className="flex gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
