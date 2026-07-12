import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-10 lg:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <Card className="rounded-4xl border-0 bg-linear-to-r from-blue-700 via-blue-800 to-slate-950 px-5 py-10 text-center text-white shadow-xl sm:px-8 sm:py-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Siap Menjadi Pengemudi Profesional?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
            Bergabunglah dengan ribuan siswa lainnya dan nikmati kemudahan
            pengelolaan kursus dalam satu platform terintegrasi.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="bg-blue-500 hover:bg-blue-400"
              onClick={() => navigate("/register")}
            >
              Daftar Sekarang
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => navigate("/login")}
            >
              Masuk ke Sistem
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/20 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => navigate("/verifikasi-sertifikat")}
            >
              Verifikasi Sertifikat
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
