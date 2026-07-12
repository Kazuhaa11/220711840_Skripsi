import { Download } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminOperationalReportHeader } from "@/features/admin/constants/operationalReports";

interface AdminOperationalReportsHeaderProps {
  onDownload: () => void;
}

export default function AdminOperationalReportsHeader({
  onDownload,
}: AdminOperationalReportsHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={adminOperationalReportHeader.eyebrow}
      title={adminOperationalReportHeader.title}
      description={adminOperationalReportHeader.description}
      actions={
        <Button
          size="lg"
          className="h-11 rounded-2xl bg-slate-950 px-5 font-bold uppercase tracking-[0.08em] shadow-xl shadow-slate-900/15 hover:bg-slate-800"
          leftIcon={<Download className="h-5 w-5" />}
          onClick={onDownload}
        >
          Unduh Excel
        </Button>
      }
    />
  );
}
