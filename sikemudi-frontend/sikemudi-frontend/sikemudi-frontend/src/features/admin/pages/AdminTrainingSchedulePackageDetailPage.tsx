import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, UserRound } from "lucide-react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import { getAdminBookingDetail } from "@/services/adminBooking.service";
import {
  getBookingStatusBadgeVariant,
  getPaymentStatusBadgeVariant,
  mapAdminBookingToDetail,
} from "@/features/admin/utils/adminBookingMapper";
import type { AdminBookingDetailItem } from "@/types/adminBooking";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminTrainingSchedulePackageDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<AdminBookingDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setErrorMessage("ID booking paket tidak ditemukan pada URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await getAdminBookingDetail(id);
      setDetail(mapAdminBookingToDetail(response.item));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Detail jadwal latihan paket gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-295 rounded-3xl bg-white p-8 shadow-sm">
        <LoadingSpinner label="Memuat detail jadwal latihan paket..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto w-full max-w-295">
        <Button
          variant="ghost"
          className="mb-5 rounded-2xl"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/admin/jadwal-latihan")}
        >
          Kembali
        </Button>
        <ErrorMessage title="Detail Gagal Dimuat" message={errorMessage} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-295">
        <Button
          variant="ghost"
          className="mb-5 rounded-2xl"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/admin/jadwal-latihan")}
        >
          Kembali
        </Button>
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="Detail jadwal tidak ditemukan"
          description="Data booking paket tidak tersedia atau sudah dihapus."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-295">
      <Button
        variant="ghost"
        className="mb-5 rounded-2xl"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate("/admin/jadwal-latihan")}
      >
        Kembali ke Jadwal Latihan
      </Button>

      <PageHeader
        eyebrow="Detail Jadwal Latihan"
        title={detail.code}
        description="Halaman ini menampilkan ringkasan booking paket dan seluruh sesi latihan otomatis yang terbentuk dari paket tersebut."
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={getBookingStatusBadgeVariant(detail.bookingStatus)}
              className="font-bold uppercase tracking-[0.08em]"
            >
              {detail.bookingStatusLabel}
            </Badge>
            <Badge
              variant={getPaymentStatusBadgeVariant(detail.paymentStatus)}
              className="font-bold uppercase tracking-[0.08em]"
            >
              {detail.paymentStatus}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="rounded-3xl p-5 shadow-sm xl:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Ringkasan Booking
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <InfoItem label="Peserta" value={detail.participantName} />
            <InfoItem label="Kode Peserta" value={detail.participantCode} />
            <InfoItem label="Paket" value={detail.packageName} />
            <InfoItem label="Progress" value={detail.progressLabel} />
            <InfoItem label="Harga" value={detail.priceLabel} />
            <InfoItem label="Dibuat" value={detail.createdAtLabel} />
            <InfoItem label="Antar Jemput" value={detail.pickupLabel} />
            <InfoItem label="SIM" value={detail.simLabel} />
          </div>
        </Card>

        <Card className="rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Resource Utama
          </p>
          <div className="mt-5 space-y-5">
            <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Instruktur
                </p>
                <p className="mt-1 font-bold text-slate-950">{detail.instructorName}</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700">
                <CarFront className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Kendaraan
                </p>
                <p className="mt-1 font-bold text-slate-950">{detail.vehicleName}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Daftar Sesi
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">
              {detail.sessions.length} sesi latihan dalam paket ini
            </h2>
          </div>
        </div>

        {detail.sessions.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<CalendarDays className="h-8 w-8" />}
              title="Belum ada sesi"
              description="Backend belum mengirimkan daftar sesi untuk booking paket ini."
            />
          </div>
        ) : (
          <div className="mt-5">
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Sesi</TableHeaderCell>
                    <TableHeaderCell>Jadwal</TableHeaderCell>
                    <TableHeaderCell>Status Booking</TableHeaderCell>
                    <TableHeaderCell>Hasil Latihan</TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {detail.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <p className="font-bold text-slate-950">{session.sessionLabel}</p>
                        <p className="mt-1 text-xs text-slate-500">{session.code}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-950">{session.dateLabel}</p>
                        <p className="mt-1 text-sm text-slate-600">{session.timeLabel}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getBookingStatusBadgeVariant(session.status)}
                          className="font-bold uppercase tracking-[0.08em]"
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.resultStatus === "Lulus"
                              ? "success"
                              : session.resultStatus === "Tidak Lulus"
                                ? "danger"
                                : "default"
                          }
                          className="font-bold uppercase tracking-[0.08em]"
                        >
                          {session.resultStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>
        )}
      </Card>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
