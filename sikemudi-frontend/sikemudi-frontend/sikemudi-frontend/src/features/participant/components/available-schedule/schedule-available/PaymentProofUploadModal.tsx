import { useEffect, useMemo, useState } from "react";
import { Banknote, FileUp, Info, SendHorizonal } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import type { BookingApiItem } from "@/types/booking";

interface PaymentProofUploadModalProps {
  opened: boolean;
  booking: BookingApiItem | null;
  onClose: () => void;
  onSubmit: (payload: {
    nominalBayar: number;
    namaPengirim: string;
    bankPengirim: string;
    catatanPeserta: string;
    buktiBayar: File;
  }) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const labelClassName = "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";
const fieldClassName = "h-12 rounded-2xl bg-slate-50 font-medium text-slate-900 focus:bg-white";
const paymentDestination = {
  bank: "BCA",
  accountNumber: "731-525-6127",
  accountName: "Muhammad Susanto",
};

export default function PaymentProofUploadModal({
  opened,
  booking,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  successMessage,
}: PaymentProofUploadModalProps) {
  const [nominalBayar, setNominalBayar] = useState("");
  const [namaPengirim, setNamaPengirim] = useState("");
  const [bankPengirim, setBankPengirim] = useState("");
  const [catatanPeserta, setCatatanPeserta] = useState("");
  const [buktiBayar, setBuktiBayar] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !booking) return;

    setNominalBayar(String(booking.harga_paket || ""));
    setNamaPengirim(booking.payment?.nama_pengirim ?? "");
    setBankPengirim(booking.payment?.bank_pengirim ?? "");
    setCatatanPeserta(booking.payment?.catatan_peserta ?? "");
    setBuktiBayar(null);
    setLocalError(null);
  }, [booking, opened]);

  const parsedNominal = Number(nominalBayar);
  const fileLabel = useMemo(() => {
    if (!buktiBayar) return "Belum ada file dipilih";

    const sizeInKb = Math.ceil(buktiBayar.size / 1024);
    return `${buktiBayar.name} • ${sizeInKb} KB`;
  }, [buktiBayar]);

  async function handleSubmit() {
    setLocalError(null);

    if (!booking) {
      setLocalError("Data booking tidak ditemukan.");
      return;
    }

    if (!Number.isFinite(parsedNominal) || parsedNominal <= 0) {
      setLocalError("Nominal bayar wajib diisi dengan angka lebih dari 0.");
      return;
    }

    if (!buktiBayar) {
      setLocalError("File bukti bayar wajib dipilih.");
      return;
    }

    if (buktiBayar.size > 2 * 1024 * 1024) {
      setLocalError("Ukuran bukti bayar maksimal 2 MB.");
      return;
    }

    await onSubmit({
      nominalBayar: parsedNominal,
      namaPengirim,
      bankPengirim,
      catatanPeserta,
      buktiBayar,
    });
  }

  if (!booking) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Upload Bukti Bayar"
      description="Unggah bukti pembayaran agar admin dapat memverifikasi booking Anda."
      closeOnOverlayClick={!isSubmitting}
      closeOnEsc={!isSubmitting}
      compact
      className="max-h-[90dvh] rounded-3xl"
      bodyClassName="max-h-[70dvh] px-4 py-4 sm:px-6"
      footerClassName="px-4 py-3 sm:px-6"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            className="h-11 w-full rounded-2xl px-5 font-bold uppercase tracking-[0.08em] sm:w-auto"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Nanti Saja
          </Button>

          <Button
            className="h-11 w-full rounded-2xl px-5 font-bold uppercase tracking-[0.08em] sm:w-auto"
            leftIcon={<SendHorizonal className="h-4 w-4" />}
            loading={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            Kirim Bukti Bayar
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
        <div className="space-y-4">
          {successMessage ? <SuccesBanner message={successMessage} /> : null}
          {errorMessage || localError ? (
            <ErrorMessage
              title="Upload bukti bayar gagal"
              message={errorMessage ?? localError ?? "Terjadi kesalahan."}
            />
          ) : null}

          <Card className="rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Input
                label="Nominal Bayar"
                requiredMark
                type="number"
                min={1}
                value={nominalBayar}
                onChange={(event) => setNominalBayar(event.target.value)}
                labelClassName={labelClassName}
                className={fieldClassName}
                leftIcon={<Banknote className="h-4 w-4" />}
              />

              <Input
                label="Nama Pengirim"
                value={namaPengirim}
                onChange={(event) => setNamaPengirim(event.target.value)}
                placeholder="Contoh: Budi Santoso"
                labelClassName={labelClassName}
                className={fieldClassName}
              />

              <Input
                label="Bank Pengirim"
                value={bankPengirim}
                onChange={(event) => setBankPengirim(event.target.value)}
                placeholder="Contoh: BCA / BRI / Mandiri"
                labelClassName={labelClassName}
                className={fieldClassName}
              />

              <Input
                label="File Bukti Bayar"
                requiredMark
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => {
                  setBuktiBayar(event.target.files?.[0] ?? null);
                }}
                labelClassName={labelClassName}
                className="h-12 rounded-2xl bg-slate-50 text-sm file:mr-4 file:h-full file:border-0 file:bg-blue-600 file:px-4 file:text-sm file:font-bold file:text-white"
                leftIcon={<FileUp className="h-4 w-4" />}
                hint={fileLabel}
              />

              <TextArea
                label="Catatan Peserta"
                value={catatanPeserta}
                onChange={(event) => setCatatanPeserta(event.target.value)}
                placeholder="Catatan opsional untuk admin."
                rows={3}
                wrapperClassName="sm:col-span-2"
                labelClassName={labelClassName}
                className="rounded-2xl bg-slate-50 text-base focus:bg-white"
              />
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl bg-[#081a45] p-4 text-white shadow-xl shadow-slate-900/15 sm:rounded-3xl sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
            Ringkasan Tagihan
          </p>

          <h3 className="mt-2 text-xl font-extrabold text-white sm:mt-3 sm:text-2xl">
            {booking.kode_booking}
          </h3>

          <div className="mt-4 space-y-3 rounded-2xl bg-white/5 p-3 text-sm sm:mt-5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/65">Paket</span>
              <span className="text-right font-semibold">
                {booking.course_package?.nama_paket ?? "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-white/65">Total</span>
              <span className="text-right text-lg font-extrabold text-emerald-300">
                {formatCurrency(booking.harga_paket)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-white/65">Status Bayar</span>
              <span className="text-right font-semibold">
                {booking.payment?.status ?? "Belum Upload"}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/8 p-3 sm:mt-5 sm:p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
              <p className="text-sm leading-6 text-white/75">
                Format file yang diterima: JPG, JPEG, PNG, WebP, atau PDF dengan ukuran maksimal 2 MB.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-3 text-slate-950 shadow-sm sm:p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
              Rekening Tujuan
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Bank</span>
                <span className="font-extrabold">{paymentDestination.bank}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">No. Rekening</span>
                <span className="font-extrabold">{paymentDestination.accountNumber}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">A/N</span>
                <span className="text-right font-extrabold">{paymentDestination.accountName}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
