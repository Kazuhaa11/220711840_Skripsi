import type { LucideIcon } from "lucide-react";
import { Car, CheckCircle2, CircleX, ShieldCheck, Wrench } from "lucide-react";

export type AdminVehicleStatus = "Aktif" | "Servis" | "Nonaktif";
export type AdminVehicleTransmission = "Manual" | "Otomatis";
export type AdminVehicleAvailability =
  | "Tersedia"
  | "Maintenance"
  | "Sedang Latihan";

export interface AdminVehicle {
  id: string;
  name: string;
  model: string;
  plateNumber: string;
  transmission: AdminVehicleTransmission;
  status: AdminVehicleStatus;
  availability: AdminVehicleAvailability;
  usedToday: number;
  inputDate: string;
  lastServiceKm: number;
  insuranceStatus: string;
  licenseStatus: string;
  note: string;
  imageTone: "blue" | "green" | "amber" | "slate";
}

export interface AdminVehicleFormValues {
  name: string;
  model: string;
  plateNumber: string;
  transmission: AdminVehicleTransmission;
  status: AdminVehicleStatus;
  availability: AdminVehicleAvailability;
  note: string;
}

export interface AdminVehicleStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "red";
}

export const adminVehicleHeader = {
  eyebrow: "Operasional Kendaraan",
  title: "Manajemen Kendaraan",
  description: "Kelola data kendaraan pelatihan secara terpusat.",
};

export const adminVehicleInitialData: AdminVehicle[] = [
  {
    id: "#VEH-001",
    name: "Toyota",
    model: "Avanza 2023",
    plateNumber: "B 1234 ABC",
    transmission: "Manual",
    status: "Aktif",
    availability: "Tersedia",
    usedToday: 3,
    inputDate: "12 Jan 2024",
    lastServiceKm: 4800,
    insuranceStatus: "Aktif",
    licenseStatus: "Aktif",
    note: "Kondisi kendaraan baik dan siap digunakan untuk latihan manual.",
    imageTone: "blue",
  },
  {
    id: "#VEH-002",
    name: "Honda",
    model: "Brio RS",
    plateNumber: "B 5678 XYZ",
    transmission: "Otomatis",
    status: "Servis",
    availability: "Maintenance",
    usedToday: 0,
    inputDate: "15 Jan 2024",
    lastServiceKm: 5200,
    insuranceStatus: "Aktif",
    licenseStatus: "Aktif",
    note: "Sedang pengecekan rutin bagian rem dan pendingin mesin.",
    imageTone: "green",
  },
  {
    id: "#VEH-003",
    name: "Daihatsu",
    model: "Xenia",
    plateNumber: "F 2024 DTI",
    transmission: "Manual",
    status: "Aktif",
    availability: "Sedang Latihan",
    usedToday: 5,
    inputDate: "20 Jan 2024",
    lastServiceKm: 4100,
    insuranceStatus: "Aktif",
    licenseStatus: "Aktif",
    note: "Sedang digunakan untuk sesi latihan siang.",
    imageTone: "amber",
  },
];

export const adminVehicleStats: AdminVehicleStat[] = [
  {
    id: "total",
    label: "Total",
    value: "24",
    description: "Unit kendaraan terdaftar",
    icon: Car,
    tone: "blue",
  },
  {
    id: "active",
    label: "Aktif",
    value: "18",
    description: "Siap digunakan",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    id: "service",
    label: "Servis",
    value: "4",
    description: "Dalam pemeliharaan",
    icon: Wrench,
    tone: "amber",
  },
  {
    id: "inactive",
    label: "Nonaktif",
    value: "2",
    description: "Izin habis / rusak",
    icon: CircleX,
    tone: "red",
  },
];

export const vehicleStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Servis", value: "Servis" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const vehicleTransmissionOptions = [
  { label: "Semua Jenis", value: "all" },
  { label: "Manual", value: "Manual" },
  { label: "Otomatis", value: "Otomatis" },
];

export const vehicleFormStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Servis", value: "Servis" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const vehicleFormTransmissionOptions = [
  { label: "Manual", value: "Manual" },
  { label: "Otomatis", value: "Otomatis" },
];

export const vehicleFormAvailabilityOptions = [
  { label: "Tersedia", value: "Tersedia" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Sedang Latihan", value: "Sedang Latihan" },
];

export const emptyVehicleFormValues: AdminVehicleFormValues = {
  name: "",
  model: "",
  plateNumber: "",
  transmission: "Manual",
  status: "Aktif",
  availability: "Tersedia",
  note: "",
};

export const adminVehicleMessages = {
  addSuccess: "Data kendaraan berhasil ditambahkan.",
  editSuccess: "Data kendaraan berhasil diperbarui.",
  deactivateSuccess: "Kendaraan berhasil dinonaktifkan.",
  activateSuccess: "Kendaraan berhasil diaktifkan kembali.",
  emptyTitle: "Data kendaraan tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian, status, atau jenis transmisi kendaraan.",
};

export const adminVehicleMaintenanceSuggestion = {
  badge: "Saran Pemeliharaan",
  title: "Jadwalkan servis untuk 3 kendaraan lainnya.",
  description:
    "Sistem mendeteksi 3 kendaraan telah mencapai ambang batas 5.000 KM sejak servis terakhir. Segera lakukan pengecekan rutin untuk menjamin keamanan siswa pelatihan.",
};

export const adminVehicleInsuranceInfo = {
  title: "Asuransi & Perizinan",
  description:
    "Pantau masa berlaku STNK dan asuransi kendaraan pelatihan dalam satu dashboard.",
  healthLabel: "Kesehatan Armada",
  healthValue: 92,
  icon: ShieldCheck,
};
