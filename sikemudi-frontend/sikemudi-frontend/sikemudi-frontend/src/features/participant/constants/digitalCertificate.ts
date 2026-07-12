import type { ParticipantDigitalCertificate } from "@/features/participant/constants/type";

export const mockDigitalCertificateUnavailable: ParticipantDigitalCertificate =
  {
    id: "CERT-PARTICIPANT-001",
    participantName: "Budi Santoso",
    participantTier: "SISWA PREMIUM",
    packageName: "Paket 10 Jam - Premium",
    isAvailable: false,
    graduationStatus: "DALAM_PROSES",
    verificationLabel: "Awaiting Completion",
    issueDate: null,
    certificateNumber: null,
    averageScore: "--",
    completedSessions: 7,
    totalSessions: 10,
    progressPercent: 70,
    achievementText:
      "Sertifikat digital akan tersedia setelah Anda dinyatakan lulus dan menyelesaikan seluruh sesi pelatihan yang diwajibkan.",
    shareUrl: "https://sikemudi.id/certificate/SK-2024-001",
    requirements: [
      { id: "req-1", label: "Materi Dasar Berkendara", completed: true },
      { id: "req-2", label: "Ujian Teori Pertama (Lulus)", completed: true },
      { id: "req-3", label: "Latihan Praktik Lapangan", completed: false },
      { id: "req-4", label: "Ujian Akhir Kelulusan", completed: false },
    ],
    importantNote:
      'E-Sertifikat akan dikirimkan secara otomatis ke email terdaftar maksimal 3x24 jam setelah status dinyatakan "LULUS" oleh instruktur.',
  };

export const mockDigitalCertificateAvailable: ParticipantDigitalCertificate = {
  id: "CERT-PARTICIPANT-001",
  participantName: "Budi Santoso",
  participantTier: "SISWA PREMIUM",
  packageName: "Paket 10 Jam - Premium",
  isAvailable: true,
  graduationStatus: "LULUS",
  verificationLabel: "Terverifikasi",
  issueDate: "24 Okt 2024",
  certificateNumber: "SK-2024-001",
  averageScore: "89.5",
  completedSessions: 10,
  totalSessions: 10,
  progressPercent: 100,
  achievementText:
    "Telah menyelesaikan kursus mengemudi dengan predikat sangat baik.",
  shareUrl: "https://sikemudi.id/certificate/SK-2024-001",
  requirements: [
    { id: "req-1", label: "Materi Dasar Berkendara", completed: true },
    { id: "req-2", label: "Ujian Teori Pertama (Lulus)", completed: true },
    { id: "req-3", label: "Latihan Praktik Lapangan", completed: true },
    { id: "req-4", label: "Ujian Akhir Kelulusan", completed: true },
  ],
  importantNote:
    "Sertifikat digital ini berfungsi sebagai dokumen pendukung dan verifikasi cepat, bukan pengganti dokumen fisik resmi.",
};

export const digitalCertificateDemo = mockDigitalCertificateUnavailable;
