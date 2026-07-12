import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import heroImage from "@/assets/images/car-purchase.jpg";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="beranda" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
        <div>
          <Badge variant="info" className="mb-6">
            PLATFORM KURSUS BERKENDARA MODERN
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 md:text-5xl">
            Kursus Mengemudi Lebih Mudah, Terjadwal, dan Terverifikasi
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 lg:text-lg">
            Pantau ketersediaan instruktur secara real-time, kelola sesi latihan
            Anda dengan fleksibel, dan verifikasi sertifikat kelulusan secara
            instan melalui sistem QR terpadu.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate("/#paket-kursus")}
            >
              Daftar Kursus
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/verifikasi-sertifikat")}
            >
              Verifikasi Sertifikat
            </Button>
          </div>
        </div>

        <div className="relative">
          <Card className="rounded-4xl border border-white/70 p-4 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)]">
            <div className="overflow-hidden rounded-3xl bg-slate-200">
              <img
                src={heroImage}
                alt="Peserta kursus menggunakan sistem digital berkendara"
                className="h-80 w-full object-cover md:h-105"
              />
            </div>
          </Card>

          <Card className="absolute bottom-6 right-0 rounded-2xl px-4 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <BadgeCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Status Sertifikat
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  Terverifikasi Digital
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
