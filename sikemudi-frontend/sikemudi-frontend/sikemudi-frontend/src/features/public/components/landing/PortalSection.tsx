import { useEffect, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Card from "@/components/ui/Card";
import { getPublicCoursePackages } from "@/services/publicPackage.service";
import type { PublicCoursePackageApiItem } from "@/types/publicPackage";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PortalSection() {
  const [packages, setPackages] = useState<PublicCoursePackageApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchPackages() {
      try {
        setLoading(true);
        setError(null);

        const items = await getPublicCoursePackages();

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
  }, []);

  return (
    <section id="paket-kursus" className="scroll-mt-24 py-12 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Paket Latihan
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Pilihan Paket Kursus Mengemudi
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Sesuaikan durasi latihan dengan kebutuhan Anda, tersedia pilihan
            antar jemput dan paket dengan pengurusan SIM.
          </p>
        </div>

        {error ? (
          <div className="mt-10">
            <ErrorMessage message={error} />
          </div>
        ) : null}

        {loading ? (
          <Card className="mt-10 px-6 py-6">
            <LoadingSpinner label="Memuat paket kursus..." />
          </Card>
        ) : packages.length === 0 ? (
          <Card className="mt-10 px-6 py-8 text-center">
            <p className="font-semibold text-slate-950">
              Belum ada paket kursus aktif.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Paket yang tampil di halaman ini mengikuti data dari backend.
            </p>
          </Card>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <Card
                key={item.id}
                className="flex h-full flex-col px-6 py-6 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.kode_paket}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {item.nama_paket}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                    {item.durasi_jam} Jam
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Antar jemput</span>
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(item.harga_antar_jemput)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Tidak antar jemput</span>
                    <span className="font-semibold text-slate-950">
                      {formatCurrency(item.harga_tidak_antar_jemput)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Dengan SIM
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Antar jemput</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(item.harga_dengan_sim_antar_jemput)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">Tidak antar jemput</span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(item.harga_dengan_sim_tidak_antar_jemput)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-500">
                  {item.deskripsi ??
                    "Setiap paket sudah termasuk sesi latihan terstruktur dan sertifikat kursus mengemudi."}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
