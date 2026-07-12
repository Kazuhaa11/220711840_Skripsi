export default function RegisterSuccessVisualPanel() {
  return (
    <div className="relative overflow-hidden rounded-l-4xl bg-slate-950 text-white">
      <img
        src="/images/register-success-cover.jpg"
        alt="Visual registrasi berhasil"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,23,64,0.52)_0%,rgba(1,23,64,0.82)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <div className="h-1 w-12 rounded-full bg-emerald-400" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          Registrasi Selesai
        </p>

        <h2 className="mt-3 max-w-70 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          Perjalanan belajar mengemudi Anda dimulai di sini
        </h2>
      </div>
    </div>
  );
}
