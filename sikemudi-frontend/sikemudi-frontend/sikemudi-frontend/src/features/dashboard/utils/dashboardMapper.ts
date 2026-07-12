import type {
  AdminDashboardOperationalStatusMap,
  DashboardSummaryCardMap,
  InstructorDashboardReminder,
} from "@/types/dashboard";

export function formatDashboardValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

export function formatDashboardUnit(unit: string | null | undefined): string | undefined {
  if (!unit) {
    return undefined;
  }

  return unit;
}

export function getSummaryCard(
  summaryCards: DashboardSummaryCardMap,
  key: string,
): DashboardSummaryCardMap[string] | undefined {
  return summaryCards[key];
}

export function mapSummaryCardValue(
  summaryCards: DashboardSummaryCardMap,
  key: string,
): string {
  return formatDashboardValue(getSummaryCard(summaryCards, key)?.value);
}

export function mapSummaryCardDescription(
  summaryCards: DashboardSummaryCardMap,
  key: string,
): string | undefined {
  const item = getSummaryCard(summaryCards, key);

  return item?.description ?? item?.unit ?? undefined;
}

export function mapParticipantGreeting(name: string | null | undefined): string {
  if (!name) {
    return "Selamat Datang";
  }

  return `Selamat Datang, ${name.split(" ")[0]}`;
}

export function mapAdminOperationalStatuses(
  operationalStatus: AdminDashboardOperationalStatusMap,
) {
  return [
    {
      id: "slot_hampir_penuh",
      tone: "green" as const,
      title: operationalStatus.slot_hampir_penuh?.title ?? "Slot Hampir Penuh",
      description:
        operationalStatus.slot_hampir_penuh?.description ??
        "Belum ada informasi slot hampir penuh.",
    },
    {
      id: "kendaraan_sedang_digunakan",
      tone: "blue" as const,
      title:
        operationalStatus.kendaraan_sedang_digunakan?.title ??
        "Kendaraan Sedang Digunakan",
      description:
        operationalStatus.kendaraan_sedang_digunakan?.description ??
        "Belum ada informasi kendaraan aktif.",
    },
    {
      id: "jadwal_perlu_perhatian",
      tone: "red" as const,
      title:
        operationalStatus.jadwal_perlu_perhatian?.title ??
        "Jadwal Perlu Perhatian",
      description:
        operationalStatus.jadwal_perlu_perhatian?.description ??
        "Belum ada informasi jadwal bermasalah.",
    },
    {
      id: "sertifikat_menunggu",
      tone: "slate" as const,
      title: operationalStatus.sertifikat_menunggu?.title ?? "Sertifikat Menunggu",
      description:
        operationalStatus.sertifikat_menunggu?.description ??
        "Belum ada informasi sertifikat menunggu.",
    },
  ];
}

export function mapInstructorReminderTone(
  reminder: InstructorDashboardReminder,
): "danger" | "info" {
  return reminder.type === "warning" ? "danger" : "info";
}

export function normalizeDashboardStatus(status: string | null | undefined): string {
  return (status ?? "-").toUpperCase();
}
