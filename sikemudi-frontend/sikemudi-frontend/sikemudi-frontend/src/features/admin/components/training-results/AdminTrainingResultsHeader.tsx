import { RotateCw } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminTrainingResultHeader } from "@/features/admin/constants/trainingResults";

interface AdminTrainingResultsHeaderProps {
  loading?: boolean;
  onRefresh: () => void;
}

export default function AdminTrainingResultsHeader({
  loading = false,
  onRefresh,
}: AdminTrainingResultsHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      title={adminTrainingResultHeader.title}
      description={adminTrainingResultHeader.description}
      actions={
        <Button
          variant="outline"
          size="lg"
          className="h-11 rounded-2xl px-5 text-sm font-bold uppercase tracking-[0.08em]"
          leftIcon={<RotateCw className="h-5 w-5" />}
          onClick={onRefresh}
          loading={loading}
        >
          Muat Ulang
        </Button>
      }
    />
  );
}
