export default function LoginPageFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 text-center text-xs uppercase tracking-[0.2em] text-slate-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:text-left">
        <p className="font-extrabold tracking-tight text-slate-950">SIKEMUDI</p>

        <p>© 2026 SIKEMUDI</p>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          <a href="#" className="transition hover:text-slate-800">
            Kebijakan Privasi
          </a>
          <a href="#" className="transition hover:text-slate-800">
            Syarat Layanan
          </a>
          <a href="#" className="transition hover:text-slate-800">
            Pusat Bantuan
          </a>
        </div>
      </div>
    </footer>
  );
}
