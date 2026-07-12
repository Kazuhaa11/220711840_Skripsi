import PageHeader from "@/components/common/PageHeader";
import { instructorWelcome } from "@/features/instructor/constants/dashboard";

export default function InstructorDashboardHeader() {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={instructorWelcome.eyebrow}
      title={instructorWelcome.title}
      description={instructorWelcome.description}
      eyebrowClassName="text-xs tracking-[0.22em]"
      titleClassName="text-3xl font-extrabold md:text-4xl"
      descriptionClassName="mt-3 text-base leading-7"
    />
  );
}
