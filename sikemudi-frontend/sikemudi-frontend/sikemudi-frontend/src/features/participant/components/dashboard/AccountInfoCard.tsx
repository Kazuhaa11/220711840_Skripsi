import { NavLink } from "react-router-dom";
import { Award, Mail, MapPin, Phone, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { ParticipantDashboardAccountInfo } from "@/types/dashboard";

interface AccountInfoCardProps {
  accountInfo: ParticipantDashboardAccountInfo;
}

export default function AccountInfoCard({ accountInfo }: AccountInfoCardProps) {
  const items = [
    {
      icon: User,
      label: "NAMA LENGKAP",
      value: accountInfo.nama_lengkap ?? "-",
    },
    {
      icon: Award,
      label: "TIPE PELATIHAN",
      value: accountInfo.tipe_pelatihan ?? "-",
    },
    {
      icon: Phone,
      label: "KONTAK",
      value: accountInfo.kontak ?? "-",
    },
    {
      icon: Mail,
      label: "EMAIL",
      value: accountInfo.email ?? "-",
    },
    {
      icon: MapPin,
      label: "ALAMAT",
      value: accountInfo.alamat ?? "-",
    },
  ];

  return (
    <Card className="rounded-2xl px-4 py-4 sm:rounded-3xl sm:px-6 sm:py-6">
      <h3 className="text-base font-bold uppercase tracking-[0.16em] text-slate-800 sm:text-2xl sm:tracking-[0.2em]">
        Informasi Akun
      </h3>

      <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-blue-700 sm:h-12 sm:w-12">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-950 break-words sm:mt-2 sm:text-lg sm:leading-normal">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 sm:mt-8">
        <NavLink to="/peserta/profil">
          <Button
            variant="ghost"
            className="px-0 text-sm text-blue-700 hover:bg-transparent sm:text-base"
          >
            SUNTING PROFIL →
          </Button>
        </NavLink>
      </div>
    </Card>
  );
}
