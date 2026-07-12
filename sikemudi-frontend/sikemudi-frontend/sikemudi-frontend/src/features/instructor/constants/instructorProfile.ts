export interface InstructorProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  birthDate: string;
  specialization: string;
  address: string;
  status: "Aktif" | "Tidak Aktif";
  drivingType: string;
  joinDate: string;
  totalSessions: number;
  rating: number;
  verificationStatus: string;
  accountType: string;
  experience: string;
  certification: string;
  avatarUrl?: string;
}

export interface InstructorProfileFormValues {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  birthDate: string;
  specialization: string;
  address: string;
}

export const instructorProfileDemo: InstructorProfileData = {
  id: "INS-2024-001",
  fullName: "Budi Santoso",
  email: "budi.santoso@sikemudi.com",
  phoneCountryCode: "+62",
  phoneNumber: "812 3456 7890",
  birthDate: "1985-05-15",
  specialization: "Manual & Matic",
  address: "Jl. Menteng Raya No. 123, Jakarta Pusat",
  status: "Aktif",
  drivingType: "Manual & Matic",
  joinDate: "12 Jan 2024",
  totalSessions: 128,
  rating: 4.9,
  verificationStatus: "Valid (KTP & Lisensi)",
  accountType: "Aktif Premium",
  experience: "8+ Tahun",
  certification: "BNSP Certified",
};

export const instructorSpecializationOptions = [
  { label: "Mengemudi Manual & Matic", value: "Manual & Matic" },
  { label: "Mengemudi Manual", value: "Manual" },
  { label: "Mengemudi Matic", value: "Matic" },
  { label: "Instruktur Pemula", value: "Pemula" },
  { label: "Instruktur Lanjutan", value: "Lanjutan" },
];

export const instructorProfileSuccessMessage =
  "Profil instruktur berhasil diperbarui";
