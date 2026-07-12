import PageHeader from "@/components/common/PageHeader";
import { mapParticipantGreeting } from "@/features/dashboard/utils/dashboardMapper";
import type { ParticipantDashboardProfile } from "@/types/dashboard";

interface DashboardHeaderProps {
  profile: ParticipantDashboardProfile;
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={
        <>
          <span>Selamat Datang Kembali</span>
          <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-slate-600">
            ID Peserta: {profile.kode_peserta}
          </span>
        </>
      }
      title={mapParticipantGreeting(profile.nama_peserta)}
      description="Kelola jadwal latihan, booking sesi, dan lihat status pelatihan Anda di sini. Pantau progres Anda menuju pengemudi yang kompeten."
      eyebrowClassName="text-[11px] tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]"
      titleClassName="mt-3 text-2xl font-extrabold leading-tight sm:mt-5 md:text-4xl"
      descriptionClassName="mt-2 max-w-3xl text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7"
    />
  );
}
