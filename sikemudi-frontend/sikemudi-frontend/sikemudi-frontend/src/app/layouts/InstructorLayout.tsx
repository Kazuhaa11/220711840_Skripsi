import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Menu,
  PlayCircle,
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
  {
    label: "Dashboard",
    to: "/instruktur/dashboard",
    icon: LayoutGrid,
    end: true,
  },
  {
    label: "Jadwal Mengajar",
    to: "/instruktur/jadwal-mengajar",
    icon: CalendarDays,
  },
  { label: "Sesi Latihan", to: "/instruktur/sesi-latihan", icon: PlayCircle },
  {
    label: "Hasil Latihan",
    to: "/instruktur/hasil-latihan",
    icon: ClipboardList,
  },
  { label: "Profil", to: "/instruktur/profil", icon: UserRound },
];


function InstructorSidebarContent({
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

export default function InstructorLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const displayName = user?.name ?? "Instruktur";
  const roleLabel = user?.role?.nama_role ?? "Instruktur";
  const avatarUrl = resolveBackendAssetUrl(user?.foto_profil_url ?? user?.foto_profil);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-10 w-10 rounded-xl p-0 lg:hidden"
              aria-label="Buka menu instruktur"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <NavLink
              to="/instruktur/dashboard"
              className="text-[1.9rem] font-black leading-none tracking-tight text-slate-950"
            >
              SIKEMUDI
            </NavLink>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-950">
                  {displayName}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <UserAvatar
                src={avatarUrl}
                name={displayName}
                fallback="I"
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
            <InstructorSidebarContent />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-7 lg:py-7 xl:px-8">
          <Outlet />
        </main>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu instruktur"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative h-full w-72.5 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  Menu Instruktur
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
                aria-label="Tutup menu instruktur"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-[calc(100%-73px)] overflow-y-auto">
              <InstructorSidebarContent
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
