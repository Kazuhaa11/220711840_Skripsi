import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import Card from "@/components/ui/Card";
import TrainingResultHeader from "@/features/instructor/components/training-result/TrainingResultHeader";
import TrainingResultTable from "@/features/instructor/components/training-result/TrainingResultTable";
import TrainingResultToolbar from "@/features/instructor/components/training-result/TrainingResultToolbar";
import type {
  InstructorTrainingResultApi,
  InstructorTrainingResultCandidateApi,
} from "@/types/instructor";
import type { TrainingResultStatus } from "@/features/instructor/constants/trainingResult";
import {
  buildTrainingResultGroupItems,
  mapCandidateToTrainingResultItem,
  mapResultToTrainingResultItem,
} from "@/features/instructor/utils/instructorMapper";
import {
  getInstructorTrainingResultCandidates,
  getInstructorTrainingResults,
} from "@/services/instructor.service";

interface LocationState {
  successMessage?: string;
}

export default function TrainingResultView() {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [candidates, setCandidates] = useState<InstructorTrainingResultCandidateApi[]>([]);
  const [results, setResults] = useState<InstructorTrainingResultApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [candidateResponse, resultResponse] = await Promise.all([
        getInstructorTrainingResultCandidates({
          q: searchValue.trim() || undefined,
          per_page: 100,
        }),
        getInstructorTrainingResults({
          q: searchValue.trim() || undefined,
          per_page: 100,
        }),
      ]);

      setCandidates(candidateResponse.items);
      setResults(resultResponse.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data hasil latihan tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const items = useMemo(() => {
    const candidateItems = candidates.map(mapCandidateToTrainingResultItem);
    const resultItems = results.map(mapResultToTrainingResultItem);

    return buildTrainingResultGroupItems([...candidateItems, ...resultItems]);
  }, [candidates, results]);

  const filteredResults = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusValue === "all"
          ? true
          : item.status === (statusValue as TrainingResultStatus);

      return matchesStatus;
    });
  }, [items, statusValue]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] sm:-m-6 lg:-m-7 xl:-m-8">
      <TrainingResultHeader
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onClearSearch={() => handleSearchChange("")}
      />

      <div className="mx-auto w-full max-w-295 px-4 py-6 sm:px-6 lg:px-7">
        {locationState?.successMessage ? (
          <div className="mb-6">
            <SuccesBanner message={locationState.successMessage} />
          </div>
        ) : null}

        {error ? (
          <div className="mb-6">
            <ErrorMessage title="Gagal Memuat Data" message={error} />
          </div>
        ) : null}

        <div className="mt-6">
          <TrainingResultToolbar
            statusValue={statusValue}
            onStatusChange={setStatusValue}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <Card className="rounded-3xl p-8 shadow-sm">
              <LoadingSpinner label="Memuat kandidat dan hasil latihan..." />
            </Card>
          ) : (
            <TrainingResultTable items={filteredResults} />
          )}
        </div>
      </div>
    </div>
  );
}
