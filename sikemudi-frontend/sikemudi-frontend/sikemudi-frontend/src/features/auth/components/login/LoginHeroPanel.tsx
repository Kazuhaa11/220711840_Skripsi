import Card from "@/components/ui/Card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import screenImage from "@/assets/images/screen.png";

export default function LoginHeroPanel() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,23,64,0.92)_0%,rgba(1,23,64,1)_100%)]" />
        <img
          src={screenImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-blue-950/35" />
      </div>

      <div className="relative flex min-h-80 flex-col justify-between px-6 py-8 sm:px-8 md:px-10 lg:min-h-full lg:px-14 lg:py-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="mt-12 max-w-xl lg:mt-20">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              SIKEMUDI
            </h1>

            <h2 className="mt-8 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Masuk ke Sistem SIKEMUDI
            </h2>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-200 sm:text-lg">
              Akses jadwal latihan, booking sesi latihan, hasil evaluasi, hingga
              unduh sertifikat digital Anda dalam satu platform terintegrasi.
            </p>
          </div>
        </div>

        <Card className="mt-8 max-w-[320px] rounded-3xl border-white/10 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium leading-6">
              Platform Akademi Mengemudi Terverifikasi
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
