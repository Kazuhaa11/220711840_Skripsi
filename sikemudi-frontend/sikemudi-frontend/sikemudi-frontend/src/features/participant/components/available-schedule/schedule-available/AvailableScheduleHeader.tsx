import PageHeader from "@/components/common/PageHeader";

export default function AvailableScheduleHeader() {
  return (
    <PageHeader
      className="mb-0 lg:items-start"
      eyebrow="Layanan Pendaftaran"
      title="Jadwal Tersedia"
      description="Slot yang ditampilkan telah disesuaikan dengan paket kursus yang Anda pilih."
      eyebrowClassName="text-xs tracking-[0.22em]"
      titleClassName="text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl"
      descriptionClassName="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7"
      actions={
        <div className="flex w-full max-w-90 items-center rounded-full bg-white p-1 shadow-sm">
          <div className="flex-1 px-3 py-2 text-center text-xs font-semibold text-slate-400 sm:px-4 sm:py-3 sm:text-sm">
            01 Pilih Paket
          </div>
          <div className="flex-1 rounded-full bg-blue-600 px-3 py-2 text-center text-xs font-bold text-white sm:px-4 sm:py-3 sm:text-sm">
            02 Pilih Jadwal
          </div>
          <div className="flex-1 px-3 py-2 text-center text-xs font-semibold text-slate-400 sm:px-4 sm:py-3 sm:text-sm">
            03 Booking Sesi
          </div>
        </div>
      }
    />
  );
}
