import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import type { AvailableScheduleSlot } from "@/features/participant/constants/type";
import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";
import type { BookingPaymentMethod } from "@/types/booking";
import { BadgeCheck, CalendarDays, Check, WalletCards } from "lucide-react";

interface BookingSuccessModalProps {
  opened: boolean;
  mode?: "booking" | "payment";
  onClose: () => void;
  onViewMySchedule: () => void;
  onUploadPaymentProof: () => void;
  paymentMethod?: BookingPaymentMethod;
  slot: AvailableScheduleSlot | null;
  selectedPackage: SelectedCoursePackage;
}

export default function BookingSuccessModal({
  opened,
  mode = "booking",
  onClose,
  onViewMySchedule,
  onUploadPaymentProof,
  paymentMethod = "Transfer",
  slot,
  selectedPackage,
}: BookingSuccessModalProps) {
  if (!slot) return null;

  const isPaymentSuccess = mode === "payment";
  const isCashBooking = !isPaymentSuccess && paymentMethod === "Cash";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      className="max-h-[90dvh] rounded-3xl"
      bodyClassName="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center sm:h-24 sm:w-24">
          <div className="absolute inset-0 rounded-full bg-emerald-100 blur-2xl" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-white bg-linear-to-br from-emerald-200 to-emerald-300 shadow-[0_16px_40px_rgba(16,185,129,0.22)] sm:h-20 sm:w-20 sm:border-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white sm:h-9 sm:w-9">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          <div className="absolute right-0 top-1 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/30 sm:px-3 sm:text-[10px]">
            Success
          </div>
        </div>

        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:mt-4 sm:text-xs sm:tracking-[0.22em]">
          {isPaymentSuccess || isCashBooking
            ? "Status: Menunggu Konfirmasi Admin"
            : "Status: Menunggu Pembayaran"}
        </p>

        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {isPaymentSuccess ? "Bukti Bayar Berhasil Diupload" : isCashBooking ? "Booking Cash Berhasil" : "Booking Berhasil"}
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          {isPaymentSuccess ? (
            <>
              Bukti pembayaran berhasil dikirim ke admin. Status booking sekarang menunggu konfirmasi pembayaran. Silakan pantau statusnya melalui halaman{" "}
              <span className="font-bold text-slate-900">Jadwal Saya</span>.
            </>
          ) : isCashBooking ? (
            <>
              Booking berhasil dibuat dengan metode{" "}
              <span className="font-bold text-slate-900">Cash</span>. Silakan lakukan pembayaran ke admin. Booking akan aktif setelah admin mengonfirmasi pembayaran.
            </>
          ) : (
            <>
              Sesi latihan berhasil dipesan. Status booking masih{" "}
              <span className="font-bold text-slate-900">Menunggu Pembayaran</span>,
              jadi unggah bukti bayar agar admin dapat melakukan konfirmasi.
            </>
          )}
        </p>

        <div className="mx-auto mt-4 grid max-w-2xl gap-3 md:grid-cols-2 sm:mt-6">
          <Card className="rounded-2xl p-3 text-left shadow-sm sm:p-4">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CalendarDays className="h-4 w-4" />
            </div>

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:mt-3 sm:tracking-[0.18em]">
              Jenis Layanan
            </p>

            <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              {selectedPackage.name}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {slot.dateLabel} • {slot.timeRange}
            </p>
          </Card>

          <Card className="rounded-2xl p-3 text-left shadow-sm sm:p-4">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
            </div>

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:mt-3 sm:tracking-[0.18em]">
              Instruktur
            </p>

            <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              {slot.instructorName}
            </p>

            <p className="mt-1 text-sm text-slate-600">{slot.vehicleName}</p>
          </Card>

          <Card className="rounded-2xl p-3 text-left shadow-sm sm:col-span-2 sm:p-4">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <WalletCards className="h-4 w-4" />
            </div>

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:mt-3 sm:tracking-[0.18em]">
              Metode Pembayaran
            </p>

            <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              {paymentMethod === "Cash" ? "Cash" : "Transfer Bank"}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {paymentMethod === "Cash"
                ? "Tidak perlu upload bukti bayar. Admin akan mengonfirmasi pembayaran cash."
                : "Upload bukti bayar tersedia setelah booking berhasil."}
            </p>
          </Card>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-4 flex flex-col gap-2 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:mt-6 sm:flex-row sm:justify-center sm:bg-transparent sm:p-0">
          {!isPaymentSuccess && !isCashBooking ? (
            <Button
              onClick={onUploadPaymentProof}
              className="h-11 rounded-xl bg-[#0b1f4d] px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#10295f]"
            >
              Upload Bukti Bayar
            </Button>
          ) : null}

          <Button
            variant={isPaymentSuccess || isCashBooking ? "primary" : "outline"}
            onClick={onViewMySchedule}
            className="h-11 rounded-xl px-6 text-sm font-bold uppercase tracking-wide"
          >
            Lihat Jadwal Saya
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="h-11 rounded-xl px-6 text-sm font-bold uppercase tracking-wide"
          >
            Tutup
          </Button>
        </div>

        <div className="mt-3 text-center text-xs font-extrabold text-slate-400 sm:mt-5 sm:text-sm">
          SIKEMUDI
        </div>
      </div>
    </Modal>
  );
}
