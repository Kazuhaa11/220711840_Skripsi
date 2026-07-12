import { useCallback, useEffect, useMemo, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import Card from "@/components/ui/Card";
import {
  getAdminTrainingResults,
  validateAdminTrainingResult,
} from "@/services/adminTrainingResult.service";
import AdminTrainingResultsFilters from "@/features/admin/components/training-results/AdminTrainingResultsFilters";
import AdminTrainingResultsHeader from "@/features/admin/components/training-results/AdminTrainingResultsHeader";
import AdminTrainingResultsTable from "@/features/admin/components/training-results/AdminTrainingResultsTable";
import TrainingResultDetailPanel from "@/features/admin/components/training-results/TrainingResultDetailPanel";
import VerifyTrainingResultModal from "@/features/admin/components/training-results/VerifyTrainingResultModal";
import type {
  AdminTrainingAttendance,
  AdminTrainingResult,
  AdminTrainingResultWorkflowStatus,
  AdminTrainingVerificationFormValues,
} from "@/features/admin/constants/trainingResults";
import {
  adminTrainingResultMessages,
  canVerifyAdminTrainingResult,
  emptyTrainingVerificationFormValues,
} from "@/features/admin/constants/trainingResults";
import { mapAdminTrainingResultPackage } from "@/features/admin/utils/adminTrainingResultMapper";
import type { PaginationMeta } from "@/types/api";

const DEFAULT_ERROR_MESSAGE = "Data hasil latihan gagal dimuat.";

function mapWorkflowToGraduationStatus(
  workflowValue: string,
): string | undefined {
  if (workflowValue === "all") return undefined;

  if (
    workflowValue === "Menunggu Verifikasi Admin" ||
    workflowValue === "Belum Dinilai"
  ) {
    return "Belum Dinilai";
  }

  if (workflowValue === "Siap Sertifikat" || workflowValue === "Sertifikat Terbit") {
    return "Lulus";
  }

  if (workflowValue === "Tidak Lulus") {
    return "Tidak Lulus";
  }

  return undefined;
}

function verificationValuesFromResult(
  result: AdminTrainingResult,
): AdminTrainingVerificationFormValues {
  return {
    graduationStatus: result.graduationStatus,
    adminNote: result.adminNote,
  };
}

export default function AdminTrainingResultsView() {
  const [results, setResults] = useState<AdminTrainingResult[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [instructorValue, setInstructorValue] = useState("all");
  const [attendanceValue, setAttendanceValue] = useState("all");
  const [workflowValue, setWorkflowValue] = useState("all");
  const [page, setPage] = useState(1);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedResult, setSelectedResult] =
    useState<AdminTrainingResult | null>(null);

  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const [verificationFormValues, setVerificationFormValues] =
    useState<AdminTrainingVerificationFormValues>(
      emptyTrainingVerificationFormValues,
    );

  const filteredResults = useMemo(() => {
    if (workflowValue !== "Tidak Hadir") {
      return results;
    }

    return results.filter((result) => result.workflowStatus === "Tidak Hadir");
  }, [results, workflowValue]);

  function resetMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  const fetchResults = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const response = await getAdminTrainingResults({
          q: searchValue.trim() || undefined,
          tanggal: dateValue || undefined,
          instructor_id: instructorValue === "all" ? undefined : instructorValue,
          status_kehadiran:
            attendanceValue === "all"
              ? undefined
              : (attendanceValue as AdminTrainingAttendance),
          status_kelulusan: mapWorkflowToGraduationStatus(workflowValue),
          page,
          per_page: 10,
        });

        setResults(response.items.map(mapAdminTrainingResultPackage));
        setPagination(response.pagination);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      attendanceValue,
      dateValue,
      instructorValue,
      page,
      searchValue,
      workflowValue,
    ],
  );

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleOpenDetail(result: AdminTrainingResult) {
    resetMessages();
    setSelectedResult(result);
    setDetailPanelOpen(true);
  }

  function handleOpenVerify(result: AdminTrainingResult) {
    resetMessages();

    if (!canVerifyAdminTrainingResult(result) || result.numericId <= 0) {
      setErrorMessage(
        "Paket latihan belum siap divalidasi. Validasi hanya aktif setelah seluruh sesi selesai dan sesi final berstatus Lulus.",
      );
      return;
    }

    setSelectedResult(result);
    setVerificationFormValues(verificationValuesFromResult(result));
    setVerifyModalOpen(true);
  }

  function handleVerificationChange(
    field: keyof AdminTrainingVerificationFormValues,
    value: string,
  ) {
    resetMessages();
    setVerificationFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmitVerification() {
    if (!selectedResult) return;

    try {
      setActionLoading(true);
      setErrorMessage("");

      await validateAdminTrainingResult(selectedResult.numericId, {
        status_kelulusan: "Lulus",
        catatan_admin: verificationFormValues.adminNote || null,
      });

      setSelectedResult(null);
      setVerifyModalOpen(false);
      setDetailPanelOpen(false);
      setSuccessMessage(adminTrainingResultMessages.verifySuccess);

      await fetchResults({ silent: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Validasi hasil latihan gagal.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleResetFilter() {
    setSearchValue("");
    setDateValue("");
    setInstructorValue("all");
    setAttendanceValue("all");
    setWorkflowValue("all");
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleDateChange(value: string) {
    setDateValue(value);
    setPage(1);
  }

  function handleInstructorChange(value: string) {
    setInstructorValue(value);
    setPage(1);
  }

  function handleAttendanceChange(value: string) {
    setAttendanceValue(value);
    setPage(1);
  }

  function handleWorkflowChange(value: string) {
    setWorkflowValue(value as AdminTrainingResultWorkflowStatus | "all");
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      {successMessage ? (
        <div className="mb-6">
          <SuccesBanner message={successMessage} />
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-6">
          <ErrorMessage title="Validasi Gagal" message={errorMessage} />
        </div>
      ) : null}

      <AdminTrainingResultsHeader
        loading={refreshing}
        onRefresh={() => void fetchResults({ silent: true })}
      />

      <div className="mt-5">
        <AdminTrainingResultsFilters
          searchValue={searchValue}
          dateValue={dateValue}
          instructorValue={instructorValue}
          attendanceValue={attendanceValue}
          workflowValue={workflowValue}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onInstructorChange={handleInstructorChange}
          onAttendanceChange={handleAttendanceChange}
          onWorkflowChange={handleWorkflowChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <Card className="rounded-3xl p-8 shadow-sm">
            <LoadingSpinner label="Memuat data hasil latihan..." />
          </Card>
        ) : (
          <AdminTrainingResultsTable
            results={filteredResults}
            pagination={pagination}
            onDetail={handleOpenDetail}
            onVerify={handleOpenVerify}
            onPageChange={setPage}
          />
        )}
      </div>

      <VerifyTrainingResultModal
        opened={verifyModalOpen}
        result={selectedResult}
        values={verificationFormValues}
        loading={actionLoading}
        onChange={handleVerificationChange}
        onClose={() => {
          if (actionLoading) return;
          setVerifyModalOpen(false);
        }}
        onSubmit={handleSubmitVerification}
      />

      <TrainingResultDetailPanel
        opened={detailPanelOpen}
        result={selectedResult}
        onClose={() => setDetailPanelOpen(false)}
        onVerify={handleOpenVerify}
      />
    </div>
  );
}
