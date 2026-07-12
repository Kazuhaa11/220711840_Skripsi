import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";
import type { BookingPackagePreviewData } from "@/types/booking";

const STORAGE_KEY = "peserta_booking_package_confirmation_draft";

export interface BookingPackageConfirmationDraft {
  selectedPackage: SelectedCoursePackage;
  preview: BookingPackagePreviewData;
  tanggalMulai: string;
  timeSlotId: number;
}

function isConfirmationDraft(value: unknown): value is BookingPackageConfirmationDraft {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<BookingPackageConfirmationDraft>;

  return (
    !!item.selectedPackage &&
    !!item.preview &&
    typeof item.tanggalMulai === "string" &&
    typeof item.timeSlotId === "number" &&
    Array.isArray(item.preview.sessions)
  );
}

export function saveBookingPackageConfirmationDraft(draft: BookingPackageConfirmationDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function getBookingPackageConfirmationDraft(): BookingPackageConfirmationDraft | null {
  const storedValue = sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) return null;

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!isConfirmationDraft(parsedValue)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedValue;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearBookingPackageConfirmationDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
