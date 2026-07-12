import Button from "@/components/ui/Button";
import { Check, Circle } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterSuccessContentCard() {
  return (
    <div className="flex h-full flex-col justify-center px-6 py-8 text-center sm:px-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
        Konfirmasi
      </p>

      <h1 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight text-slate-950 sm:text-5xl">
        Registrasi
        <br />
        Berhasil
      </h1>

      <p className="mx-auto mt-6 max-w-105 text-base leading-8 text-slate-600 sm:text-lg">
        Akun peserta berhasil dibuat. Silakan masuk untuk melihat jadwal
        tersedia dan melakukan booking latihan.
      </p>

      <div className="mt-8">
        <Link to="/login" className="inline-block w-full max-w-75">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="h-12 rounded-2xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800"
          >
            LANJUT KE LOGIN
          </Button>
        </Link>
      </div>

      <div className="mx-auto mt-8 w-full max-w-75 border-t border-slate-100 pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Langkah Berikutnya
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-2 w-9 rounded-full bg-emerald-400" />
          <Circle className="h-3 w-3 fill-slate-300 text-slate-300" />
          <Circle className="h-3 w-3 fill-slate-300 text-slate-300" />
        </div>
      </div>
    </div>
  );
}
