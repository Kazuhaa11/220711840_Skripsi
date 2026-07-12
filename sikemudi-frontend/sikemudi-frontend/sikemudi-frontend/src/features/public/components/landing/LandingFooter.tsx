export default function LandingFooter() {
  return (
    <footer
      id="kontak"
      className="border-t border-slate-200 bg-white py-12 text-slate-600"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="text-xl font-extrabold tracking-tight text-slate-950">
            SIKEMUDI
          </div>
          <p className="mt-4 text-sm leading-7">
            Sistem Informasi Kursus Mengemudi terpadu untuk LPK Yuzza Kutai
            Barat. Mewujudkan manajemen kursus modern dan akses edukasi
            berkendara.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">
            Layanan
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>Pendaftaran Online</li>
            <li>Cek Jadwal</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">
            Perusahaan
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>Kebijakan Privasi</li>
            <li>Syarat & Ketentuan</li>
            <li>Kontak Kami</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">
            Lokasi
          </h3>
          <p className="mt-4 text-sm leading-7">
            Kutai Barat, Kalimantan Timur, Indonesia
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-slate-200 px-6 pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 SIKEMUDI. Transformasi edukasi berkendara Indonesia.</p>
        <p>LPK Yuzza Kutai Barat</p>
      </div>
    </footer>
  );
}
