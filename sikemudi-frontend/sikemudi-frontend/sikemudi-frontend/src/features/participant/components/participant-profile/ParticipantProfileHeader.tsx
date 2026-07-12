import PageHeader from "@/components/common/PageHeader";

export default function ParticipantProfileHeader() {
  return (
    <PageHeader
      className="mb-0"
      title="Profil Peserta"
      description="Lihat dan perbarui informasi akun Anda."
      titleClassName="text-2xl font-extrabold sm:text-3xl md:text-4xl"
      descriptionClassName="mt-2 text-sm leading-6 text-slate-700 sm:mt-3 sm:text-base sm:leading-7"
    />
  );
}
