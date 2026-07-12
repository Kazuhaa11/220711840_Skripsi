import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import TrainingResultTable from "@/features/instructor/components/training-result/TrainingResultTable";
import type {
  InstructorTrainingResultApi,
  InstructorTrainingResultCandidateApi,
} from "@/types/instructor";
import {
  mapCandidateToTrainingResultItem,
  mapResultToTrainingResultItem,
} from "@/features/instructor/utils/instructorMapper";
import {
  getInstructorTrainingResultCandidates,
  getInstructorTrainingResults,
} from "@/services/instructor.service";

export default function TrainingResultPackageDetailView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const numericGroupId = Number(groupId);

  const [candidates, setCandidates] = useState<InstructorTrainingResultCandidateApi[]>([]);
  const [results, setResults] = useState<InstructorTrainingResultApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!groupId || Number.isNaN(numericGroupId)) {
      setError("ID paket hasil latihan tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [candidateResponse, resultResponse] = await Promise.all([
        getInstructorTrainingResultCandidates({ per_page: 100 }),
        getInstructorTrainingResults({ per_page: 100 }),
      ]);

      setCandidates(candidateResponse.items);
      setResults(resultResponse.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data sesi paket tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [groupId, numericGroupId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const sessionItems = useMemo(() => {
    const candidateItems = candidates.map(mapCandidateToTrainingResultItem);
    const resultItems = results.map(mapResultToTrainingResultItem);

    return [...candidateItems, ...resultItems]
      .filter((item) => Number(item.bookingGroupId) === numericGroupId)
      .sort((a, b) => {
        const aMatch = a.sessionLabel?.match(/(\d+)\s*\/\s*(\d+)/);
        const bMatch = b.sessionLabel?.match(/(\d+)\s*\/\s*(\d+)/);
        return Number(aMatch?.[1] ?? 0) - Number(bMatch?.[1] ?? 0);
      });
  }, [candidates, numericGroupId, results]);

  const firstItem = sessionItems[0];
  const completedCount = sessionItems.filter((item) => item.source === "result").length;
  const totalSesi = firstItem?.totalSesi ?? sessionItems.length;

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] sm:-m-6 lg:-m-7 xl:-m-8">
      <div className="mx-auto w-full max-w-295 px-4 py-6 sm:px-6 lg:px-7">
        <Button
          variant="ghost"
          className="mb-5 px-0 text-blue-700 hover:bg-transparent"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/instruktur/hasil-latihan")}
        >
          Kembali ke Paket Hasil Latihan
        </Button>

        <PageHeader
          eyebrow="Detail Sesi Paket"
          title={firstItem?.participants[0]?.name ?? "Detail Hasil Latihan"}
          description={
            firstItem
              ? `${firstItem.participants[0]?.packageName ?? "Paket latihan"} • Progress ${completedCount}/${totalSesi} sesi`
              : "Daftar sesi latihan dalam satu paket peserta."
          }
          className="mb-0 lg:items-start"
          eyebrowClassName="text-xs tracking-[0.2em]"
          titleClassName="text-3xl font-extrabold md:text-4xl"
          descriptionClassName="max-w-2xl text-base leading-7"
        />

        {error ? (
          <div className="mt-6">
            <ErrorMessage title="Gagal Memuat Data" message={error} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <Card className="rounded-3xl p-8 shadow-sm">
              <LoadingSpinner label="Memuat sesi hasil latihan..." />
            </Card>
          ) : sessionItems.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="h-7 w-7" />}
              title="Sesi paket tidak ditemukan"
              description="Data sesi paket ini tidak tersedia atau sudah tidak termasuk jadwal mengajar Anda."
            />
          ) : (
            <TrainingResultTable items={sessionItems} />
          )}
        </div>
      </div>
    </div>
  );
}
