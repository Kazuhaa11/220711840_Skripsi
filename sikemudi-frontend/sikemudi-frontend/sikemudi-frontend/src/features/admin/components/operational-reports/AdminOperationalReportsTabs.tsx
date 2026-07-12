import DataTabs from "@/components/common/DataTabs";
import type { AdminOperationalReportTab } from "@/features/admin/constants/operationalReports";
import { adminOperationalReportTabs } from "@/features/admin/constants/operationalReports";

interface AdminOperationalReportsTabsProps {
  activeTab: AdminOperationalReportTab;
  onChange: (tab: AdminOperationalReportTab) => void;
}

export default function AdminOperationalReportsTabs({
  activeTab,
  onChange,
}: AdminOperationalReportsTabsProps) {
  return (
    <DataTabs
      tabs={adminOperationalReportTabs}
      activeTab={activeTab}
      onChange={onChange}
      listClassName="px-4"
    />
  );
}
