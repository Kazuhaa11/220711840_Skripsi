import { BadgeCheck, BookOpen, Car } from "lucide-react";
import type {
  AdminCoursePackage,
  AdminCoursePackageFormValues,
  AdminCoursePackageStatus,
} from "@/features/admin/constants/coursePackages";
import type {
  AdminTimeSlot,
  AdminTimeSlotFormValues,
} from "@/features/admin/constants/timeSlots";
import { normalizeTimeSlotActiveDays } from "@/features/admin/constants/timeSlots";
import type {
  AdminVehicle,
  AdminVehicleAvailability,
  AdminVehicleFormValues,
  AdminVehicleStatus,
  AdminVehicleTransmission,
} from "@/features/admin/constants/vehicles";

import type {
  AdminTrainingSchedule,
  AdminTrainingScheduleFormValues,
  AdminTrainingScheduleStatus,
} from "@/features/admin/constants/trainingSchedules";
import type {
  AdminCoursePackageApiItem,
  AdminCoursePackagePayload,
  AdminTimeSlotApiItem,
  AdminTimeSlotPayload,
  AdminTrainingScheduleApiItem,
  AdminTrainingSchedulePayload,
  AdminVehicleApiItem,
  AdminVehiclePayload,
} from "@/services/adminMasterData.service";

type WithApiId<T> = T & { apiId: number; code?: string | null };

export function getAdminMasterApiId(item: { id: string; apiId?: number | string }) {
  return item.apiId ?? item.id;
}

function formatCurrencyInput(value: number | string | null | undefined) {
  const parsedValue = Number(value ?? 0);

  return String(Number.isFinite(parsedValue) ? parsedValue : 0);
}

function parseCurrencyInput(value: string) {
  return Number(String(value).replace(/\D/g, "")) || 0;
}

function mapCoursePackageStatusForPayload(status: AdminCoursePackageStatus): "Aktif" | "Nonaktif" {
  return status === "Aktif" ? "Aktif" : "Nonaktif";
}

function getCoursePackagePrice(item: AdminCoursePackageApiItem) {
  return Number(item.harga_tidak_antar_jemput) || Number(item.harga_antar_jemput) || Number(item.harga_dengan_sim_tidak_antar_jemput) || Number(item.harga_dengan_sim_antar_jemput) || 0;
}


export function mapCoursePackageApiToAdmin(item: AdminCoursePackageApiItem): WithApiId<AdminCoursePackage> {
  const filteredFacilities = Array.isArray(item.fasilitas)
    ? item.fasilitas.filter((facility) => {
        const normalized = String(facility).toLowerCase().trim();

        return ![
          "mobil manual",
          "mobil matic",
          "motor",
          "lainnya",
          "reguler",
          "vip",
          "akhir pekan",
          "antar jemput",
          "tanpa antar jemput",
        ].includes(normalized);
      })
    : [];

  const facilities = filteredFacilities.length > 0
    ? filteredFacilities.map((facility, index) => ({
        id: `facility-${item.id}-${index}`,
        title: facility,
        description: facility,
        icon: index % 3 === 0 ? Car : index % 3 === 1 ? BookOpen : BadgeCheck,
      }))
    : [
        {
          id: `facility-${item.id}-default-1`,
          title: "Modul Pembelajaran",
          description: "Materi latihan mengikuti paket kursus yang dipilih.",
          icon: BookOpen,
        },
        {
          id: `facility-${item.id}-default-2`,
          title: "Sertifikat Kelulusan",
          description: item.termasuk_sertifikat
            ? "Sertifikat disediakan setelah peserta dinyatakan lulus."
            : "Sertifikat tidak termasuk dalam paket ini.",
          icon: BadgeCheck,
        },
      ];

  return {
    apiId: item.id,
    code: item.kode_paket,
    id: item.kode_paket ?? `PKT-${item.id}`,
    name: item.nama_paket,
    shortDescription: item.deskripsi ?? `${item.durasi_jam} jam pelatihan`,
    description: item.deskripsi ?? "Belum ada deskripsi paket kursus.",
    durationHours: item.durasi_jam,
    categories: [],
    service: "Reguler",
    price: getCoursePackagePrice(item),
    priceNoPickup: Number(item.harga_tidak_antar_jemput) || 0,
    pricePickup: Number(item.harga_antar_jemput) || 0,
    priceSimNoPickup: Number(item.harga_dengan_sim_tidak_antar_jemput) || 0,
    priceSimPickup: Number(item.harga_dengan_sim_antar_jemput) || 0,
    certificateIncluded: item.termasuk_sertifikat,
    status: item.status as AdminCoursePackageStatus,
    registrantsThisWeek: 0,
    totalRegistrants: 0,
    popularity: item.status === "Aktif" ? 75 : 0,
    facilities,
  };
}

export function mapCoursePackageToForm(item: AdminCoursePackage): AdminCoursePackageFormValues {
  return {
    name: item.name,
    shortDescription: item.shortDescription,
    description: item.description,
    durationHours: String(item.durationHours),
    priceNoPickup: formatCurrencyInput(item.priceNoPickup ?? item.price),
    pricePickup: formatCurrencyInput(item.pricePickup ?? item.price),
    priceSimNoPickup: formatCurrencyInput(item.priceSimNoPickup ?? item.price),
    priceSimPickup: formatCurrencyInput(item.priceSimPickup ?? item.price),
    certificateIncluded: item.certificateIncluded,
    status: item.status as AdminCoursePackageStatus,
  };
}

export function mapCoursePackageFormToPayload(values: AdminCoursePackageFormValues): AdminCoursePackagePayload {
  const facilities = [
    values.certificateIncluded ? "Sertifikat Kelulusan" : "Tanpa Sertifikat",
  ];

  return {
    nama_paket: values.name.trim(),
    durasi_jam: Number(values.durationHours) || 0,
    deskripsi: values.description?.trim() || values.shortDescription?.trim() || null,
    harga_tidak_antar_jemput: parseCurrencyInput(values.priceNoPickup),
    harga_antar_jemput: parseCurrencyInput(values.pricePickup),
    harga_dengan_sim_tidak_antar_jemput: parseCurrencyInput(values.priceSimNoPickup),
    harga_dengan_sim_antar_jemput: parseCurrencyInput(values.priceSimPickup),
    termasuk_sertifikat: Boolean(values.certificateIncluded),
    fasilitas: facilities,
    status: mapCoursePackageStatusForPayload(values.status),
  };
}

export function mapTimeSlotApiToAdmin(item: AdminTimeSlotApiItem): WithApiId<AdminTimeSlot> {
  return {
    apiId: item.id,
    code: item.kode_slot,
    id: item.kode_slot ?? `SLT-${item.id}`,
    name: item.nama_slot,
    subtitle: item.subtitle ?? item.durasi_label ?? "Slot latihan",
    startTime: item.jam_mulai,
    endTime: item.jam_selesai,
    durationMinutes: item.durasi_menit,
    status: item.status,
    usedCount: 0,
    relatedInstructors: 0,
    weeklyTrainingCount: 0,
    occupancyRate: 0,
    activeDays: normalizeTimeSlotActiveDays(item.hari_aktif),
    note: item.catatan ?? "Belum ada catatan tambahan.",
    createdAt: item.created_at ?? "-",
    updatedAt: item.updated_at ?? "-",
  };
}

export function mapTimeSlotToForm(item: AdminTimeSlot): AdminTimeSlotFormValues {
  return {
    name: item.name,
    subtitle: item.subtitle,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status,
    activeDays: normalizeTimeSlotActiveDays(item.activeDays),
    note: item.note,
  };
}

export function mapTimeSlotFormToPayload(values: AdminTimeSlotFormValues): AdminTimeSlotPayload {
  return {
    nama_slot: values.name.trim(),
    subtitle: values.subtitle?.trim() || null,
    jam_mulai: values.startTime,
    jam_selesai: values.endTime,
    status: values.status,
    hari_aktif: normalizeTimeSlotActiveDays(values.activeDays),
    catatan: values.note?.trim() || null,
  };
}

export function mapVehicleApiToAdmin(item: AdminVehicleApiItem): WithApiId<AdminVehicle> {
  return {
    apiId: item.id,
    code: item.kode_kendaraan,
    id: item.kode_kendaraan ?? `VEH-${item.id}`,
    name: item.nama_kendaraan,
    model: item.model ?? "-",
    plateNumber: item.nomor_plat,
    transmission: item.transmisi as AdminVehicleTransmission,
    status: item.status as AdminVehicleStatus,
    availability: item.ketersediaan as AdminVehicleAvailability,
    usedToday: item.digunakan_hari_ini ?? 0,
    inputDate: item.created_at ?? "-",
    lastServiceKm: item.kilometer_servis_terakhir ?? 0,
    insuranceStatus: item.status_asuransi ?? "-",
    licenseStatus: item.status_stnk ?? "-",
    note: item.catatan ?? "Belum ada catatan tambahan.",
    imageTone: item.status === "Aktif" ? "blue" : item.status === "Servis" ? "amber" : "slate",
  };
}

export function mapVehicleToForm(item: AdminVehicle): AdminVehicleFormValues {
  return {
    name: item.name,
    model: item.model,
    plateNumber: item.plateNumber,
    transmission: item.transmission,
    status: item.status,
    availability: item.availability,
    note: item.note,
  };
}

export function mapVehicleFormToPayload(values: AdminVehicleFormValues): AdminVehiclePayload {
  return {
    nama_kendaraan: values.name.trim(),
    model: values.model?.trim() || null,
    nomor_plat: values.plateNumber.trim(),
    transmisi: values.transmission,
    status: values.status,
    ketersediaan: values.availability,
    catatan: values.note?.trim() || null,
  };
}

function getDayName(dateValue: string) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const fallbackDate = new Date(year, month - 1, day);

    if (Number.isNaN(fallbackDate.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(fallbackDate);
  }

  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
}

function normalizeBackendDate(dateValue: string) {
  if (!dateValue) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const date = new Date(dateValue);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return dateValue;
}

function normalizeTimeValue(timeValue?: string | null) {
  if (!timeValue) return "-";

  return timeValue.slice(0, 5);
}

function mapTrainingScheduleStatus(status: string): AdminTrainingScheduleStatus {
  if (
    status === "Tersedia" ||
    status === "Penuh" ||
    status === "Berlangsung" ||
    status === "Selesai" ||
    status === "Dibatalkan"
  ) {
    return status;
  }

  return "Tersedia";
}

export function mapTrainingScheduleApiToAdmin(
  item: AdminTrainingScheduleApiItem,
): WithApiId<AdminTrainingSchedule> {
  const date = normalizeBackendDate(item.tanggal_latihan);
  const startTime = normalizeTimeValue(item.time_slot?.jam_mulai);
  const endTime = normalizeTimeValue(item.time_slot?.jam_selesai);
  const vehicleName = item.vehicle
    ? [item.vehicle.nama_kendaraan, item.vehicle.model].filter(Boolean).join(" ")
    : "-";

  return {
    apiId: item.id,
    code: item.kode_jadwal,
    id: item.kode_jadwal ?? `JDL-${item.id}`,
    date,
    dayName: getDayName(date),
    slotId: item.time_slot?.id ? String(item.time_slot.id) : "",
    slotName: item.time_slot?.nama_slot ?? "-",
    startTime,
    endTime,
    durationMinutes: Number(item.time_slot?.durasi_menit ?? 0),
    instructorId: item.instructor?.id ? String(item.instructor.id) : "",
    instructorName: item.instructor?.nama_instruktur ?? "-",
    instructorRole: item.instructor?.kode_instruktur ?? item.instructor?.status ?? "Instruktur",
    vehicleId: item.vehicle?.id ? String(item.vehicle.id) : "",
    vehicleName: vehicleName || "-",
    vehiclePlate: item.vehicle?.nomor_plat ?? "-",
    vehicleTransmission: item.vehicle?.transmisi ?? "-",
    coursePackageId: item.course_package?.id ? String(item.course_package.id) : "",
    coursePackageName: item.course_package?.nama_paket ?? "-",
    quota: Number(item.kapasitas ?? 0),
    participantCount: Number(item.jumlah_booking ?? 0),
    remainingQuota: Number(item.sisa_kapasitas ?? 0),
    status: mapTrainingScheduleStatus(item.status),
    location: "Pool Pusat SIKEMUDI",
    note: item.catatan ?? "Belum ada catatan tambahan.",
    participants: [],
  };
}

export function mapTrainingScheduleToForm(
  item: AdminTrainingSchedule,
): AdminTrainingScheduleFormValues {
  return {
    date: item.date,
    slotId: item.slotId,
    instructorId: item.instructorId,
    vehicleId: item.vehicleId,
    coursePackageId: item.coursePackageId,
    quota: String(item.quota),
    status: item.status,
    location: item.location,
    note: item.note,
  };
}

export function mapTrainingScheduleFormToPayload(
  values: AdminTrainingScheduleFormValues,
): AdminTrainingSchedulePayload {
  return {
    tanggal_latihan: values.date,
    time_slot_id: Number(values.slotId),
    instructor_id: Number(values.instructorId),
    vehicle_id: Number(values.vehicleId),
    course_package_id: values.coursePackageId ? Number(values.coursePackageId) : null,
    kapasitas: Number(values.quota) || 1,
    status: values.status,
    catatan: values.note?.trim() || null,
  };
}
