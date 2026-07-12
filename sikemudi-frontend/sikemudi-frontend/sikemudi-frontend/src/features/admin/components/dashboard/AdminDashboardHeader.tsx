import PageHeader from "@/components/common/PageHeader";
import { adminDashboardHeader } from "@/features/admin/constants/dashboard";

export default function AdminDashboardHeader() {
  return (
    <PageHeader
      className="mb-0"
      title={adminDashboardHeader.title}
      description={adminDashboardHeader.description}
    />
  );
}
