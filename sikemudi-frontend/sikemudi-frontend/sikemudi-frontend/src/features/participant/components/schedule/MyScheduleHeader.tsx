import PageHeader from "@/components/common/PageHeader";

export default function MyScheduleHeader() {
  return (
    <PageHeader
      className="mb-0"
      title="Jadwal Saya"
      description="Lihat dan kelola sesi latihan yang telah Anda booking."
      titleClassName="text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl"
      descriptionClassName="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7"
    />
  );
}
