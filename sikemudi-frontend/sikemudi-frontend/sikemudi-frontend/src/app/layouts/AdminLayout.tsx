import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CalendarCheck,
  Car,
  Clock3,
  FileText,
  GraduationCap,
  LayoutGrid,
  Menu,
  MessageCircle,
  Package,
  Search,
  Users,
  UserRound,
  X,
} from "lucide-react";
import LogoutButton from "@/components/common/LogoutButton";
import UserAvatar from "@/components/common/UserAvatar";
import Sidebar, { type SidebarItem } from "@/components/common/Sidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/features/auth/context/AuthContext";
import { resolveBackendAssetUrl } from "@/features/profile/utils/profileMapper";

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutGrid, end: true },
  { label: "Peserta", to: "/admin/peserta", icon: Users },
  { label: "Instruktur", to: "/admin/instruktur", icon: GraduationCap },
  { label: "Kendaraan", to: "/admin/kendaraan", icon: Car },
  { label: "Paket Kursus", to: "/admin/paket-kursus", icon: Package },
  { label: "Slot Waktu", to: "/admin/slot-waktu", icon: Clock3 },
  { label: "Jadwal Latihan", to: "/admin/jadwal-latihan", icon: CalendarDays },
  { label: "Booking & Refund", to: "/admin/booking", icon: CalendarCheck },
  { label: "Hasil Latihan", to: "/admin/hasil-latihan", icon: FileText },
  { label: "Sertifikat Digital", to: "/admin/sertifikat", icon: BadgeCheck },
  { label: "Report Operasional", to: "/admin/report", icon: BarChart3 },
  { label: "Log WhatsApp", to: "/admin/notifikasi-whatsapp", icon: MessageCircle },
  { label: "Profil", to: "/admin/profil", icon: UserRound },
];


function AdminSidebarContent({
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

export default function AdminLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const displayName = user?.name ?? "Admin";
  const roleLabel = user?.role?.nama_role ?? "Admin";
  const avatarUrl = resolveBackendAssetUrl(user?.foto_profil_url ?? user?.foto_profil);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 shrink-0 rounded-xl p-0 lg:hidden"
              aria-label="Buka menu admin"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden text-2xl font-black tracking-tight text-blue-950 lg:block">
              SIKEMUDI
            </div>

            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Cari data peserta atau jadwal..."
              leftIcon={<Search className="h-4 w-4" />}
              wrapperClassName="max-w-[390px] flex-1"
              className="rounded-2xl border-slate-100 bg-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-black text-slate-950">{displayName}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <UserAvatar
                src={avatarUrl}
                name={displayName}
                fallback="A"
                className="h-11 w-11 text-sm font-bold"
              />
            </div>

            <LogoutButton className="hidden h-auto rounded-none bg-transparent p-0 text-sm font-medium text-slate-500 hover:bg-transparent hover:text-slate-900 xl:inline-flex" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-64px)] w-62.5 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <AdminSidebarContent />
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
            aria-label="Tutup menu admin"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative h-full w-72.5 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  Menu Admin
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  SIKEMUDI
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-xl p-0"
                aria-label="Tutup menu admin"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-[calc(100%-73px)] overflow-y-auto">
              <AdminSidebarContent
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
