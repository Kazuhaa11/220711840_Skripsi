export type InstructorSlotAssignmentStatus = "Aktif" | "Nonaktif";

export interface InstructorSlotAssignmentFormValues {
  dayOfWeek: string;
  timeSlotId: string;
  instructorId: string;
  instructorIds: string[];
  status: InstructorSlotAssignmentStatus;
  note: string;
}

export const dayOfWeekOptions = [
  { label: "Senin", value: "Senin" },
  { label: "Selasa", value: "Selasa" },
  { label: "Rabu", value: "Rabu" },
  { label: "Kamis", value: "Kamis" },
  { label: "Jumat", value: "Jumat" },
  { label: "Sabtu", value: "Sabtu" },
  { label: "Minggu", value: "Minggu" },
];

export const assignmentStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const emptyAssignmentFormValues: InstructorSlotAssignmentFormValues = {
  dayOfWeek: "Senin",
  timeSlotId: "",
  instructorId: "",
  instructorIds: [],
  status: "Aktif",
  note: "",
};

export const assignmentMessages = {
  addSuccess: "Assignment instruktur berhasil disimpan.",
  editSuccess: "Assignment instruktur berhasil diperbarui.",
  deleteSuccess: "Assignment instruktur berhasil dihapus.",
  emptyTitle: "Assignment instruktur belum tersedia",
  emptyDescription:
    "Tambahkan instruktur ke hari dan slot waktu tertentu agar jadwal latihan dapat dibuat otomatis berdasarkan ketersediaan instruktur.",
};
