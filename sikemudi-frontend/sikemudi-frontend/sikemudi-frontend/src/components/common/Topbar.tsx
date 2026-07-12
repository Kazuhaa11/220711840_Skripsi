import { Bell } from 'lucide-react'

interface TopbarProps {
  brand?: string
  roleLabel?: string
}

export default function Topbar({
  brand = 'SIKEMUDI',
  roleLabel = 'Pengguna',
}: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-xl font-bold text-slate-950">{brand}</div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-slate-100" type="button">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            U
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
