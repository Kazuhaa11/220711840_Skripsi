import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CarFront,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SearchInput from "@/components/common/SearchInput";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LandingNavbar from "@/features/public/components/landing/LandingNavbar";
import LandingFooter from "@/features/public/components/landing/LandingFooter";
import { getPublicCoursePackages } from "@/services/publicPackage.service";
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
      description: "Peserta datang langsung ke lokasi kursus.",
      price: item.harga_tidak_antar_jemput,
      highlight: true,
    },
    {
      key: "pickup",
      label: "Antar Jemput",
      description: "Peserta dijemput sesuai alamat yang diisi saat booking.",
      price: item.harga_antar_jemput,
    },
    {
      key: "sim-non-pickup",
      label: "Dengan SIM + Tanpa Antar Jemput",
      description: "Paket latihan dengan layanan pengurusan SIM.",
      price: item.harga_dengan_sim_tidak_antar_jemput,
    },
    {
      key: "sim-pickup",
      label: "Dengan SIM + Antar Jemput",
      description: "Paket lengkap latihan, SIM, dan antar jemput.",
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

function PackageCard({ item }: { item: PublicCoursePackageApiItem }) {
  const priceOptions = getPackagePriceOptions(item);
  const facilities = item.fasilitas?.length
    ? item.fasilitas.slice(0, 4)
    : [
        "Sertifikat kursus mengemudi",
        "Instruktur berpengalaman",
        "Jadwal latihan fleksibel",
      ];

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[30px] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="border-b border-slate-200 bg-linear-to-br from-blue-600 to-slate-950 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="bg-white/15 text-white ring-1 ring-white/20">
              {item.kode_paket}
            </Badge>
            <h2 className="mt-4 text-2xl font-black tracking-tight">
              {item.nama_paket}
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              {item.deskripsi ?? `Paket kursus mengemudi selama ${item.durasi_jam} jam.`}
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <CarFront className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Durasi
            </p>
            <p className="mt-1 text-2xl font-black">{item.durasi_jam} Jam</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Mulai Dari
            </p>
            <p className="mt-1 text-xl font-black">{formatCurrency(getLowestPrice(item))}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-3">
          {priceOptions.slice(0, 2).map((option) => (
            <div
              key={option.key}
              className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4"
            >
              <div>
                <p className="font-bold text-slate-950">{option.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {option.description}
                </p>
              </div>
              <p className="shrink-0 text-sm font-black text-blue-700">
                {formatCurrency(option.price)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Fasilitas
          </p>
          <ul className="mt-3 space-y-2">
            {facilities.map((facility) => (
              <li key={facility} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <Link to={`/paket-kursus/${item.id}`} className="flex-1">
            <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
              Lihat Detail
            </Button>
          </Link>
          <Link to="/register" className="flex-1">
            <Button fullWidth variant="outline">
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function PackageListPage() {
  const [packages, setPackages] = useState<PublicCoursePackageApiItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPackages = packages.length;
  const lowestPrice = useMemo(() => {
    if (!packages.length) return null;
    return Math.min(...packages.map(getLowestPrice));
  }, [packages]);

  useEffect(() => {
    let active = true;

    async function fetchPackages() {
      try {
        setLoading(true);
        setError(null);
        const items = await getPublicCoursePackages({
          q: appliedSearch.trim() || undefined,
        });

        if (active) {
          setPackages(items);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Daftar paket kursus gagal dimuat.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchPackages();

    return () => {
      active = false;
    };
  }, [appliedSearch]);

  function handleSubmitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchValue);
  }

  function handleClearSearch() {
    setSearchValue("");
    setAppliedSearch("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.45),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.3),transparent_30%)]" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
            <div>
              <Badge className="bg-blue-500/15 text-blue-100 ring-1 ring-blue-300/25">
                Paket Kursus SIKEMUDI
              </Badge>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Pilih paket latihan mengemudi sesuai kebutuhan Anda.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Lihat daftar paket aktif, pilihan harga, durasi latihan, fasilitas,
                dan layanan tambahan sebelum mendaftar sebagai peserta.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Daftar Peserta
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                    Masuk
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="rounded-4xl border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <Clock3 className="h-7 w-7 text-blue-200" />
                  <p className="mt-4 text-3xl font-black">6–20</p>
                  <p className="mt-1 text-sm text-slate-300">Jam latihan tersedia</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <Award className="h-7 w-7 text-blue-200" />
                  <p className="mt-4 text-3xl font-black">Sertifikat</p>
                  <p className="mt-1 text-sm text-slate-300">Digital dan bisa diverifikasi</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <ShieldCheck className="h-7 w-7 text-blue-200" />
                  <p className="mt-4 text-3xl font-black">SIM</p>
                  <p className="mt-1 text-sm text-slate-300">Opsi paket dengan layanan SIM</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <Sparkles className="h-7 w-7 text-blue-200" />
                  <p className="mt-4 text-3xl font-black">Fleksibel</p>
                  <p className="mt-1 text-sm text-slate-300">Jadwal dipilih setelah login</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
                Daftar Paket
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Paket kursus aktif
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Gunakan pencarian untuk menemukan paket berdasarkan nama, kode,
                atau deskripsi. Jadwal tersedia dapat dipilih setelah peserta login.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-90">
              <Card className="rounded-3xl p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Total Paket
                </p>
                <p className="mt-1 text-3xl font-black text-slate-950">{totalPackages}</p>
              </Card>
              <Card className="rounded-3xl p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Harga Mulai
                </p>
                <p className="mt-1 text-xl font-black text-slate-950">
                  {lowestPrice ? formatCurrency(lowestPrice) : "-"}
                </p>
              </Card>
            </div>
          </div>

          <form onSubmit={handleSubmitSearch} className="mt-8">
            <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <SearchInput
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onClear={handleClearSearch}
                  placeholder="Cari nama paket, kode, atau deskripsi..."
                  className="rounded-2xl"
                  wrapperClassName="flex-1"
                />
                <Button type="submit" leftIcon={<Search className="h-4 w-4" />}>
                  Cari Paket
                </Button>
              </div>
            </Card>
          </form>

          {error ? (
            <div className="mt-8">
              <ErrorMessage message={error} />
            </div>
          ) : null}

          {loading ? (
            <Card className="mt-8 rounded-3xl p-8 shadow-sm">
              <LoadingSpinner label="Memuat daftar paket kursus..." />
            </Card>
          ) : packages.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={<GraduationCap className="h-8 w-8" />}
                title="Paket tidak ditemukan"
                description="Belum ada paket kursus aktif yang sesuai dengan pencarian Anda. Coba gunakan kata kunci lain."
                action={
                  <Button variant="outline" onClick={handleClearSearch}>
                    Reset Pencarian
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {packages.map((item) => (
                <PackageCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
