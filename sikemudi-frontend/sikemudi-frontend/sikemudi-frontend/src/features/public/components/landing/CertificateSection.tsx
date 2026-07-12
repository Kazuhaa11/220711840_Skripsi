import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { landingBenefits } from "@/features/public/constants/landing";

export default function CertificateSection() {
  return (
    <section id="sertifikat" className="py-14 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <Card className="rounded-4xl p-6 shadow-sm">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Official Certificate
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  LPK Yuzza Kutai Barat
                </h3>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <FileCheck2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mt-8">
              <p className="text-3xl font-light italic text-slate-800">
                Sertifikat Kelulusan
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                Diberikan kepada siswa berprestasi yang telah menyelesaikan
                seluruh kurikulum berkendara aman dengan hasil memuaskan.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Certificate ID
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  CERT-LPK-00128
                </p>
              </div>

              <Badge variant="success" className="px-4 py-3 text-sm">
                QR Tervalidasi
              </Badge>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Keamanan Data dengan Verifikasi Cepat
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Setiap lulusan LPK Yuzza akan mendapatkan identitas digital unik.
            Perusahaan atau instansi dapat melakukan pengecekan kelolosan
            dokumen hanya dengan memindai kode QR yang terpasang pada
            sertifikat.
          </p>

          <div className="mt-8 space-y-4">
            {landingBenefits.map((benefit, index) => (
              <div
                key={benefit}
                className={
                  index === landingBenefits.length - 1
                    ? "grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    : "flex items-center gap-3"
                }
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {benefit}
                  </span>
                </div>

                {index === landingBenefits.length - 1 ? (
                  <Link
                    to="/verifikasi-sertifikat"
                    className="group inline-flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-xl shadow-blue-600/30 ring-2 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:w-auto"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verifikasi Sertifikat
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
