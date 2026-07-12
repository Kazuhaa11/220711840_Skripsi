import { useCallback, useEffect, useMemo, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Card from "@/components/ui/Card";
import TrainingSessionCalendar from "@/features/instructor/components/training-session/TrainingSessionCalendar";
import TrainingSessionHeader from "@/features/instructor/components/training-session/TrainingSessionHeader";
import TrainingSessionTable from "@/features/instructor/components/training-session/TrainingSessionTable";
import TrainingSessionToolbar from "@/features/instructor/components/training-session/TrainingSessionToolbar";
import type { TrainingSessionViewMode } from "@/features/instructor/constants/trainingSession";
import { getInstructorSlotAssignments } from "@/services/instructor.service";
import type {
  InstructorSlotAssignmentListData,
  InstructorSlotAssignmentMatrixCellApi,
  InstructorSlotAssignmentMatrixRowApi,
} from "@/types/instructor";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeText(value?: string | number | null) {
  return String(value ?? "").toLowerCase();
}

function cellMatchesSearch(
  day: string,
  cell: InstructorSlotAssignmentMatrixCellApi,
  keyword: string,
) {
  if (!keyword) return true;

  const haystack = [
    day,
    cell.time_slot.kode_slot,
    cell.time_slot.nama_slot,
    cell.time_slot.subtitle,
    cell.assignment?.catatan,
  ]
    .map(normalizeText)
    .join(" ");

  return haystack.includes(keyword);
}

function filterRows(
  rows: InstructorSlotAssignmentMatrixRowApi[],
  dayValue: string,
  slotValue: string,
  searchValue: string,
) {
  const keyword = searchValue.trim().toLowerCase();

  return rows
    .filter((row) => (dayValue === "all" ? true : row.day_of_week === dayValue))
    .map((row) => ({
      ...row,
      slots: row.slots.filter((cell) => {
        const matchesSlot =
          slotValue === "all" ? true : String(cell.time_slot.id) === slotValue;

        return matchesSlot && cellMatchesSearch(row.day_of_week, cell, keyword);
      }),
    }))
    .filter((row) => row.slots.length > 0);
}

export default function TrainingSessionView() {
  const [searchValue, setSearchValue] = useState("");
  const [dayValue, setDayValue] = useState("all");
  const [slotValue, setSlotValue] = useState("all");
  const [viewMode, setViewMode] = useState<TrainingSessionViewMode>("table");
  const [assignmentData, setAssignmentData] =
    useState<InstructorSlotAssignmentListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getInstructorSlotAssignments();
      setAssignmentData(response);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Slot sesi latihan gagal dimuat."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  function handleResetFilter() {
    setSearchValue("");
    setDayValue("all");
    setSlotValue("all");
  }

  const slotOptions = useMemo(() => {
    const slots = assignmentData?.time_slots ?? [];

    return [
      { label: "Semua Slot", value: "all" },
      ...slots.map((slot) => ({
        label: slot.nama_slot ?? slot.kode_slot ?? `Slot #${slot.id}`,
        value: String(slot.id),
      })),
    ];
  }, [assignmentData?.time_slots]);

  const filteredRows = useMemo(() => {
    return filterRows(
      assignmentData?.items ?? [],
      dayValue,
      slotValue,
      searchValue,
    );
  }, [assignmentData?.items, dayValue, searchValue, slotValue]);

  const filteredTimeSlots = useMemo(() => {
    const slots = assignmentData?.time_slots ?? [];

    if (slotValue === "all") {
      const visibleSlotIds = new Set(
        filteredRows.flatMap((row) => row.slots.map((cell) => cell.time_slot.id)),
      );

      return slots.filter((slot) => visibleSlotIds.has(slot.id));
    }

    return slots.filter((slot) => String(slot.id) === slotValue);
  }, [assignmentData?.time_slots, filteredRows, slotValue]);

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] sm:-m-6 lg:-m-7 xl:-m-8">
      <TrainingSessionHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onClearSearch={() => setSearchValue("")}
      />

      <div className="mx-auto w-full max-w-280 px-4 py-4 sm:px-6 lg:px-7">
        {errorMessage ? (
          <div className="mb-4">
            <ErrorMessage
              title="Gagal Memuat Slot Sesi"
              message={errorMessage}
            />
          </div>
        ) : null}

        <TrainingSessionToolbar
          dayValue={dayValue}
          slotValue={slotValue}
          slotOptions={slotOptions}
          viewMode={viewMode}
          onDayChange={setDayValue}
          onSlotChange={setSlotValue}
          onViewModeChange={setViewMode}
          onReset={handleResetFilter}
        />

        <div className="mt-4">
          {loading && !assignmentData ? (
            <Card className="rounded-2xl p-6 shadow-sm">
              <LoadingSpinner label="Memuat slot sesi latihan instruktur..." />
            </Card>
          ) : viewMode === "table" ? (
            <TrainingSessionTable
              items={filteredRows}
              timeSlots={filteredTimeSlots}
            />
          ) : (
            <TrainingSessionCalendar items={filteredRows} />
          )}
        </div>
      </div>
    </div>
  );
}
