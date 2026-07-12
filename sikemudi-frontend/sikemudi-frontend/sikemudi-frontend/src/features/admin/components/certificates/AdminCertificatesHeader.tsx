import { Settings, ShieldPlus } from "lucide-react";
import DataTabs, { type DataTabItem } from "@/components/common/DataTabs";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminCertificateHeader } from "@/features/admin/constants/certificates";

type CertificateSection = "management" | "template";

interface AdminCertificatesHeaderProps {
  activeSection: CertificateSection;
  onSectionChange: (section: CertificateSection) => void;
  onIssue: () => void;
}

const certificateSectionTabs: DataTabItem<CertificateSection>[] = [
  {
    id: "management",
    label: "Manajemen Sertifikat",
    icon: ShieldPlus,
  },
  {
    id: "template",
    label: "Template Sertifikat",
    icon: Settings,
  },
];

export default function AdminCertificatesHeader({
  activeSection,
  onSectionChange,
  onIssue,
}: AdminCertificatesHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      title={adminCertificateHeader.title}
      description={adminCertificateHeader.description}
      actions={
        <Button
          size="lg"
          className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-bold uppercase tracking-[0.08em] shadow-xl shadow-slate-900/15 hover:bg-slate-800"
          leftIcon={<ShieldPlus className="h-5 w-5" />}
          onClick={onIssue}
        >
          Terbitkan Sertifikat
        </Button>
      }
    >
      <DataTabs
        variant="segmented"
        tabs={certificateSectionTabs}
        activeTab={activeSection}
        onChange={onSectionChange}
        className="max-w-xl"
        listClassName="min-w-0 grid-flow-row grid-cols-2"
      />
    </PageHeader>
  );
}
