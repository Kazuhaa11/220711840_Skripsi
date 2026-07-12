import PageHeader from "@/components/common/PageHeader";

export default function BookingHistoryHeader() {
  return (
    <PageHeader
      className="mb-0"
      title="Riwayat Booking"
      description="Riwayat hanya menampilkan booking paket yang sudah selesai dan sertifikatnya telah diterbitkan."
      titleClassName="text-2xl font-extrabold sm:text-3xl md:text-4xl"
      descriptionClassName="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base sm:leading-7"
    />
  );
}
