import Card from "@/components/ui/Card";
import { ArrowLeft, CalendarDays, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import registerPreviewImage from "@/assets/images/woman-drivers-hands-car-steering-wheel.jpg";

export default function RegisterHeroPanel() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0">
        <img
          src="/images/register-cover.jpg"
          alt="Visual register peserta SIKEMUDI"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,22,63,0.88)_0%,rgba(7,32,87,0.9)_48%,rgba(14,77,181,0.92)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />
      </div>

      <div className="relative flex min-h-[calc(100vh-72px)] flex-col justify-between px-8 py-6 sm:px-10 lg:px-12 lg:py-6">
        <div>
          <div className="flex items-center gap-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="mt-8 max-w-[320px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
              Mulai Perjalanan Anda
            </p>

            <h1 className="mt-3 text-[clamp(1.35rem,1.9vw,1.95rem)] font-extrabold leading-[0.95] tracking-tight text-white">
              Daftar sebagai
              <br />
              Peserta
            </h1>

            <p className="mt-4 max-w-65 text-[14px] leading-7 text-slate-200">
              Wujudkan kemandirian berkendara dengan akses penuh ke jadwal
              latihan yang tersedia, sistem booking jadwal latihan, dan
              sertifikat digital terverifikasi.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-base font-semibold text-white">
                    Jadwal Real-time
                  </p>
                  <p className="mt-1 max-w-65 text-sm leading-6 text-slate-200">
                    Pantau dan pilih slot jadwal latihan yang tersedia langsung
                    dari dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-base font-semibold text-white">
                    Instruktur Profesional
                  </p>
                  <p className="mt-1 max-w-65 text-sm leading-6 text-slate-200">
                    Latihan terpandu dengan standar keamanan tinggi dan proses
                    pembelajaran yang terstruktur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Card className="w-full overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur">
            <div className="flex h-36.25 items-center justify-center rounded-[1.2rem] bg-slate-900/20 sm:h-44">
              <img
                src={registerPreviewImage}
                alt="Preview visual kursus mengemudi"
                className="h-full w-full rounded-[1.2rem] object-cover"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
