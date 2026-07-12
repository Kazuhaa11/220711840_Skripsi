import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  History,
  LayoutGrid,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import UserAvatar from "@/components/common/UserAvatar";
import Sidebar, { type SidebarItem } from "@/components/common/Sidebar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { resolveBackendAssetUrl } from "@/features/profile/utils/profileMapper";

const sidebarItems: SidebarItem[] = [
  { label: "Ringkasan", to: "/peserta/dashboard", icon: LayoutGrid, end: true },
  { label: "Jadwal Saya", to: "/peserta/jadwal-saya", icon: CalendarDays },
  { label: "Jadwal Tersedia", to: "/peserta/jadwal-tersedia", icon: Clock3 },
  { label: "Riwayat Booking", to: "/peserta/riwayat-booking", icon: History },
  { label: "Sertifikat Digital", to: "/peserta/sertifikat", icon: BadgeCheck },
  { label: "Profil", to: "/peserta/profil", icon: UserRound },
];


function ParticipantSidebarContent({
  onNavigate,
  showLogout = false,
}: {
  onNavigate?: () => void;
  showLogout?: boolean;
}) {
  return (
    <Sidebar
      items={sidebarItems}
      onNavigate={onNavigate}
      action={
        showLogout ? (
          <LogoutButton
            fullWidth
            variant="outline"
            onLoggedOut={onNavigate}
            className="h-11 rounded-2xl border-red-100 text-[13px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
          />
        ) : null
      }
    />
  );
}

export default function ParticipantLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const displayName = user?.name ?? "Peserta";
  const roleLabel = user?.role?.nama_role ?? "Peserta";
  const avatarUrl = resolveBackendAssetUrl(user?.foto_profil_url ?? user?.foto_profil);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-10 w-10 rounded-xl p-0 lg:hidden"
              aria-label="Buka menu peserta"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <NavLink
              to="/peserta/dashboard"
              className="text-2xl font-black leading-none tracking-tight text-slate-950 sm:text-[1.9rem]"
            >
              SIKEMUDI
            </NavLink>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-950">{displayName}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <UserAvatar
                src={avatarUrl}
                name={displayName}
                fallback="P"
                className="h-11 w-11 text-sm font-bold"
              />
            </div>

            <LogoutButton className="hidden h-auto rounded-none bg-transparent p-0 text-sm font-medium text-slate-500 hover:bg-transparent hover:text-slate-900 lg:inline-flex" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-64px)] w-62.5 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <ParticipantSidebarContent />
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden px-2 py-3 sm:px-6 sm:py-6 lg:px-7 lg:py-7 xl:px-8">
          <Outlet />
        </main>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu peserta"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative h-full w-72.5 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  Menu Peserta
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  SIKEMUDI
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMobileSidebarOpen(false)}
                className="h-10 w-10 rounded-xl p-0"
                aria-label="Tutup menu peserta"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-[calc(100%-73px)] overflow-y-auto">
              <ParticipantSidebarContent
                onNavigate={() => setMobileSidebarOpen(false)}
                showLogout
              />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
