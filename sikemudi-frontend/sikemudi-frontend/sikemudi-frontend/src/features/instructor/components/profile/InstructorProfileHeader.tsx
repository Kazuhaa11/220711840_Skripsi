import PageHeader from "@/components/common/PageHeader";

export default function InstructorProfileHeader() {
  return (
    <PageHeader
      className="mb-0"
      title="Profil Instruktur"
      description="Lihat dan perbarui informasi akun instruktur Anda."
      titleClassName="text-3xl font-extrabold md:text-4xl"
      descriptionClassName="mt-2 text-base leading-7"
    />
  );
}
