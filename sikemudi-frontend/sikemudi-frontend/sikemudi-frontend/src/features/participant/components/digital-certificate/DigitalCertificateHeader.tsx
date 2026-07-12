import PageHeader from "@/components/common/PageHeader";

export default function DigitalCertificateHeader() {
  return (
    <PageHeader
      className="mb-0 lg:items-start"
      contentClassName="max-w-3xl"
      eyebrow="Dashboard Peserta"
      title="Sertifikat Digital"
      description="Lihat status kelulusan dan akses sertifikat digital Anda."
      eyebrowClassName="text-xs tracking-[0.22em] text-blue-600"
      titleClassName="text-2xl font-extrabold sm:text-3xl md:text-4xl"
      descriptionClassName="mt-2 text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base sm:leading-7"
    />
  );
}
