import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CarFront,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LandingNavbar from "@/features/public/components/landing/LandingNavbar";
import LandingFooter from "@/features/public/components/landing/LandingFooter";
import { getPublicCoursePackageDetail } from "@/services/publicPackage.service";
import type {
  PublicCoursePackageApiItem,
  PublicCoursePackagePriceOption,
} from "@/types/publicPackage";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPackagePriceOptions(
  item: PublicCoursePackageApiItem,
): PublicCoursePackagePriceOption[] {
  return [
    {
      key: "non-pickup",
      label: "Tanpa Antar Jemput",
      description: "Peserta datang langsung ke lokasi kursus sesuai jadwal yang dipilih.",
      price: item.harga_tidak_antar_jemput,
      highlight: true,
    },
    {
      key: "pickup",
      label: "Antar Jemput",
      description: "Peserta dijemput sesuai alamat jemput yang diisi saat booking.",
      price: item.harga_antar_jemput,
    },
    {
      key: "sim-non-pickup",
      label: "Dengan SIM + Tanpa Antar Jemput",
      description: "Paket latihan dengan layanan pengurusan SIM, tanpa antar jemput.",
      price: item.harga_dengan_sim_tidak_antar_jemput,
    },
    {
      key: "sim-pickup",
      label: "Dengan SIM + Antar Jemput",
      description: "Paket lengkap latihan, layanan SIM, dan antar jemput peserta.",
      price: item.harga_dengan_sim_antar_jemput,
    },
  ];
}

function getLowestPrice(item: PublicCoursePackageApiItem): number {
  return Math.min(
    item.harga_antar_jemput,
    item.harga_tidak_antar_jemput,
    item.harga_dengan_sim_antar_jemput,
    item.harga_dengan_sim_tidak_antar_jemput,
  );
}

function PriceOptionCard({ option }: { option: PublicCoursePackagePriceOption }) {
  return (
    <Card
      className={
        option.highlight
          ? "rounded-3xl border-blue-200 bg-blue-50 p-5 shadow-sm"
          : "rounded-3xl p-5 shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-slate-950">{option.label}</h3>
            {option.highlight ? <Badge variant="info">Mulai dari</Badge> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {option.description}
          </p>
        </div>
        <p className="shrink-0 text-lg font-black text-blue-700">
          {formatCurrency(option.price)}
        </p>
      </div>
    </Card>
  );
}

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [packageItem, setPackageItem] = useState<PublicCoursePackageApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const priceOptions = useMemo(
    () => (packageItem ? getPackagePriceOptions(packageItem) : []),
    [packageItem],
  );

  const facilities = useMemo(() => {
    if (!packageItem) return [];

    return packageItem.fasilitas?.length
      ? packageItem.fasilitas
      : [
          "Sertifikat kursus mengemudi",
          "Instruktur berpengalaman",
          "Jadwal latihan fleksibel",
          "Pilihan layanan antar jemput",
        ];
  }, [packageItem]);

  useEffect(() => {
    let active = true;

    async function fetchDetail() {
      if (!id) {
        setError("ID paket kursus tidak valid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const item = await getPublicCoursePackageDetail(id);

        if (active) {
          setPackageItem(item);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Detail paket kursus gagal dimuat.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchDetail();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main>
        <section className="bg-slate-950 py-8 text-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 lg:px-8">
            <Link
              to="/paket-kursus"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar paket
            </Link>
          </div>
        </section>

        {loading ? (
          <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
            <Card className="rounded-3xl p-8 shadow-sm">
              <LoadingSpinner label="Memuat detail paket kursus..." />
            </Card>
          </section>
        ) : error || !packageItem ? (
          <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
            <ErrorMessage
              title="Paket kursus tidak dapat dimuat"
              message={error ?? "Paket kursus tidak ditemukan."}
              action={
                <Link to="/paket-kursus">
                  <Button variant="outline">Lihat Paket Lain</Button>
                </Link>
              }
            />
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden bg-slate-950 pb-16 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.45),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.3),transparent_30%)]" />

              <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-white/15 text-white ring-1 ring-white/20">
                      {packageItem.kode_paket}
                    </Badge>
                    <Badge variant="success">{packageItem.status}</Badge>
                  </div>

                  <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {packageItem.nama_paket}
                  </h1>

                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    {packageItem.deskripsi ??
                      `Paket kursus mengemudi selama ${packageItem.durasi_jam} jam latihan.`}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                      <Clock3 className="h-6 w-6 text-blue-200" />
                      <p className="mt-4 text-3xl font-black">{packageItem.durasi_jam}</p>
                      <p className="mt-1 text-sm text-slate-300">Jam latihan</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                      <Award className="h-6 w-6 text-blue-200" />
                      <p className="mt-4 text-xl font-black">
                        {packageItem.termasuk_sertifikat ? "Termasuk" : "Opsional"}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Sertifikat digital</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                      <GraduationCap className="h-6 w-6 text-blue-200" />
                      <p className="mt-4 text-xl font-black">
                        {formatCurrency(getLowestPrice(packageItem))}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Harga mulai</p>
                    </div>
                  </div>
                </div>

                <Card className="rounded-[34px] border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                    Ringkasan Paket
                  </p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight">
                    Siap mulai latihan?
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Daftar sebagai peserta untuk memilih jadwal tersedia,
                    melakukan booking, dan mengunggah bukti pembayaran.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <CarFront className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-bold">Pilihan layanan fleksibel</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Bisa memilih antar jemput atau datang langsung.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-bold">Opsi dengan SIM</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Paket tersedia dengan tambahan layanan pengurusan SIM.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <div>
                        <p className="font-bold">Jadwal setelah login</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Jadwal tersedia hanya dapat dipilih oleh peserta terdaftar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to="/register" className="flex-1">
                      <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Daftar Peserta
                      </Button>
                    </Link>
                    <Link to="/login" className="flex-1">
                      <Button fullWidth variant="outline">
                        Masuk
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
                    Pilihan Harga
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    Varian layanan paket
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Pilih varian saat proses booking sesuai kebutuhan peserta.
                    Harga diambil langsung dari data paket aktif backend.
                  </p>
                </div>

                <div className="grid gap-4">
                  {priceOptions.map((option) => (
                    <PriceOptionCard key={option.key} option={option} />
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <Card className="rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Fasilitas
                      </p>
                      <h3 className="text-lg font-black text-slate-950">
                        Yang didapat peserta
                      </h3>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {facilities.map((facility) => (
                      <li key={facility} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{facility}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                    Langkah Berikutnya
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">
                    Daftar dan pilih jadwal latihan.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Setelah memiliki akun peserta, Anda dapat memilih paket ini,
                    melihat jadwal tersedia, melakukan booking, dan mengunggah
                    bukti pembayaran.
                  </p>
                  <Link to="/register" className="mt-6 block">
                    <Button fullWidth>
                      Mulai Pendaftaran
                    </Button>
                  </Link>
                </Card>
              </aside>
            </section>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
