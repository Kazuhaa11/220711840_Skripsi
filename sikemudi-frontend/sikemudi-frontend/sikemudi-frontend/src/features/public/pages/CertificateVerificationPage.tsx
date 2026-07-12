import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CarFront,
  Clock3,
  FileCheck2,
  GraduationCap,
  Search,
  ShieldCheck,
  ShieldX,
  UserRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LandingFooter from "@/features/public/components/landing/LandingFooter";
import LandingNavbar from "@/features/public/components/landing/LandingNavbar";
import { verifyPublicCertificate } from "@/services/publicCertificate.service";
import type {
  PublicCertificateData,
  PublicCertificateVerificationResult,
} from "@/types/publicCertificate";

function getCertificateStatusVariant(status?: string | null) {
  if (status === "Terbit") return "success";
  if (status === "Dicabut") return "danger";
  if (status === "Draft") return "warning";
  return "default";
}

function getVerificationTitle(result: PublicCertificateVerificationResult | null) {
  if (!result) return "Masukkan Kode Sertifikat";

  if (result.data.is_valid) {
    return "Sertifikat Valid";
  }

  if (result.statusCode === 410) {
    return "Sertifikat Tidak Aktif";
  }

  return "Sertifikat Tidak Ditemukan";
}

function getVerificationDescription(result: PublicCertificateVerificationResult | null) {
  if (!result) {
    return "Gunakan kode verifikasi atau nomor sertifikat yang tertera pada dokumen sertifikat digital SIKEMUDI.";
  }

  return result.message;
}

function formatVehicle(certificate: PublicCertificateData) {
  const vehicle = certificate.training_result?.training_schedule?.vehicle;

  if (!vehicle) {
    return "-";
  }

  return [vehicle.nama_kendaraan, vehicle.nomor_plat, vehicle.transmisi]
    .filter(Boolean)
    .join(" • ");
}

function formatTimeSlot(certificate: PublicCertificateData) {
  const slot = certificate.training_result?.training_schedule?.time_slot;

  if (!slot) {
    return "-";
  }

  const timeRange = [slot.jam_mulai, slot.jam_selesai].filter(Boolean).join(" - ");

  return [slot.nama_slot, timeRange].filter(Boolean).join(" • ");
}

interface DetailItemProps {
  label: string;
  value?: string | number | null;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900 sm:text-base">
        {value ?? "-"}
      </p>
    </div>
  );
}

interface CertificateResultCardProps {
  result: PublicCertificateVerificationResult;
}

function CertificateResultCard({ result }: CertificateResultCardProps) {
  const certificate = result.data.certificate;

  if (!result.data.is_valid || !certificate) {
    return (
      <Card className="rounded-4xl border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShieldX className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <Badge variant="danger" className="mb-3">
              Tidak Valid
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-red-900">
              {getVerificationTitle(result)}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-red-700 sm:text-base">
              {getVerificationDescription(result)}
            </p>

            {result.data.nomor_sertifikat || result.data.kode_verifikasi ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Nomor Sertifikat"
                  value={result.data.nomor_sertifikat}
                />
                <DetailItem
                  label="Kode Verifikasi"
                  value={result.data.kode_verifikasi}
                />
                <DetailItem label="Status" value={result.data.status} />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-4xl border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <Badge variant="success" className="mb-3">
                Valid dan Terbit
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                Sertifikat Terverifikasi
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Sertifikat ini valid, aktif, dan terdaftar pada sistem SIKEMUDI.
                Data berikut dapat digunakan untuk memastikan keaslian dokumen.
              </p>
            </div>
          </div>

          <Badge
            variant={getCertificateStatusVariant(certificate.status)}
            className="w-fit px-4 py-2 text-sm"
          >
            {certificate.status ?? "-"}
          </Badge>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Nomor Sertifikat" value={certificate.nomor_sertifikat} />
          <DetailItem label="Kode Verifikasi" value={certificate.kode_verifikasi} />
          <DetailItem label="Tanggal Terbit" value={certificate.tanggal_terbit} />
          <DetailItem
            label="Penyelenggara"
            value={certificate.template?.nama_penyelenggara ?? "SIKEMUDI"}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-4xl p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-950">Data Peserta</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Nama Peserta" value={certificate.peserta?.nama_peserta} />
            <DetailItem label="Kode Peserta" value={certificate.peserta?.kode_peserta} />
            <DetailItem
              label="Paket Kursus"
              value={certificate.course_package?.nama_paket}
            />
            <DetailItem
              label="Durasi Paket"
              value={certificate.course_package?.durasi_jam
                ? `${certificate.course_package.durasi_jam} jam`
                : "-"}
            />
          </div>
        </Card>

        <Card className="rounded-4xl p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-950">Hasil Latihan</h3>
          </div>

          <div className="mt-5 space-y-4">
            <DetailItem
              label="Status Kelulusan"
              value={certificate.training_result?.status_kelulusan}
            />
            <DetailItem
              label="Status Kehadiran"
              value={certificate.training_result?.status_kehadiran}
            />
            <DetailItem
              label="Nilai Akhir"
              value={certificate.training_result?.nilai_akhir ?? "-"}
            />
          </div>
        </Card>
      </div>

      <Card className="rounded-4xl p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-950">Detail Sesi Latihan</h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Tanggal Latihan"
            value={
              certificate.training_result?.training_schedule?.tanggal_latihan ??
              certificate.training_result?.tanggal_latihan
            }
          />
          <DetailItem label="Slot Waktu" value={formatTimeSlot(certificate)} />
          <DetailItem
            label="Instruktur"
            value={certificate.training_result?.instructor?.nama_instruktur}
          />
          <DetailItem label="Kendaraan" value={formatVehicle(certificate)} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
            <Clock3 className="h-4 w-4" />
            Data waktu mengikuti jadwal latihan di sistem.
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
            <CarFront className="h-4 w-4" />
            Data kendaraan mengikuti sesi yang dinilai instruktur.
          </span>
        </div>
      </Card>
    </div>
  );
}

export default function CertificateVerificationPage() {
  const params = useParams<{ kode?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = params.kode ?? searchParams.get("kode") ?? searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<PublicCertificateVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => getVerificationTitle(result), [result]);
  const description = useMemo(() => getVerificationDescription(result), [result]);

  async function handleVerify(nextCode = code) {
    const normalizedCode = nextCode.trim();

    if (!normalizedCode) {
      setError("Masukkan kode verifikasi atau nomor sertifikat terlebih dahulu.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const verificationResult = await verifyPublicCertificate(normalizedCode);
      setResult(verificationResult);
      setSearchParams({ kode: normalizedCode });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Verifikasi sertifikat gagal diproses.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleVerify();
  }

  useEffect(() => {
    if (initialCode) {
      void handleVerify(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_32%)]" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:py-16">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>

              <Badge variant={result?.data.is_valid ? "success" : "info"} className="mt-6">
                Verifikasi Sertifikat Digital
              </Badge>

              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                {description}
              </p>
            </div>

            <Card className="rounded-4xl p-5 shadow-xl sm:p-6">
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      Cek Keaslian Sertifikat
                    </p>
                    <p className="text-xs leading-5 text-slate-600">
                      Masukkan kode yang tercetak pada sertifikat.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <Input
                    id="kode-sertifikat"
                    label="Kode Verifikasi / Nomor Sertifikat"
                    placeholder="Contoh: SKM-20260510-0001"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                    disabled={loading}
                    requiredMark
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={loading}
                    rightIcon={<BadgeCheck className="h-4 w-4" />}
                  >
                    Verifikasi Sertifikat
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          {error ? (
            <ErrorMessage
              title="Verifikasi Gagal"
              message={error}
              action={
                <Button variant="outline" size="sm" onClick={() => void handleVerify()}>
                  Coba Lagi
                </Button>
              }
            />
          ) : null}

          {result ? (
            <div className={error ? "mt-6" : undefined}>
              <CertificateResultCard result={result} />
            </div>
          ) : !error ? (
            <Card className="rounded-4xl p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                Belum Ada Sertifikat yang Dicek
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Hasil verifikasi akan muncul di sini setelah Anda memasukkan kode
                verifikasi atau nomor sertifikat.
              </p>
            </Card>
          ) : null}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
