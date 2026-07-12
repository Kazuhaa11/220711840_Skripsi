import { Car } from "lucide-react";
import Card from "@/components/ui/Card";
import lokasiImage from "@/assets/images/lokasi.jpg";

export default function AboutSection() {
  return (
    <section id="tentang" className="py-14 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            LPK Yuzza Kutai Barat
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Lembaga Kursus Pelatihan LPK Yuzza adalah institusi pendidikan
            mengemudi terkemuka di Kutai Barat yang berdedikasi menciptakan
            pengemudi yang kompeten, beretika, dan taat hukum.
          </p>

          <blockquote className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm italic leading-7 text-slate-700">
            “Komitmen kami adalah memberikan layanan modern, terstruktur, dan
            profesional melalui SIKEMUDI untuk masyarakat Kutai Barat.”
          </blockquote>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Kami berkomitmen penuh untuk menghadirkan layanan edukasi mengemudi
            yang modern, transparan, dan terukur melalui sistem teknologi yang
            memudahkan pengelolaan kursus dari pendaftaran hingga sertifikasi.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
            <Car className="h-6 w-6" />
          </div>

          <Card className="overflow-hidden rounded-4xl p-4 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)]">
            <img
              src={lokasiImage}
              alt="Gedung atau fasilitas kursus mengemudi"
              className="h-90 w-full rounded-3xl object-cover"
            />
          </Card>
        </div>
      </div>
    </section>
  );
}
