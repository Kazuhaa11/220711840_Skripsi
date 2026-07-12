import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Card from "@/components/ui/Card";
import TeachingScheduleCalendar from "@/features/instructor/components/teaching-schedule/TeachingScheduleCalendar";
import TeachingScheduleHeader from "@/features/instructor/components/teaching-schedule/TeachingScheduleHeader";
import TeachingScheduleTable from "@/features/instructor/components/teaching-schedule/TeachingScheduleTable";
import TeachingScheduleToolbar, {
  type TeachingScheduleViewMode,
} from "@/features/instructor/components/teaching-schedule/TeachingScheduleToolbar";
import UpcomingAgendaSection from "@/features/instructor/components/teaching-schedule/UpcomingAgendaSection";
import type { InstructorTeachingScheduleApi } from "@/types/instructor";
import { teachingScheduleFooter } from "@/features/instructor/constants/teachingSchedule";
import {
  buildTeachingScheduleGroupItems,
  buildUpcomingAgendaFromTeachingGroups,
} from "@/features/instructor/utils/instructorMapper";
import { getInstructorTeachingSchedules } from "@/services/instructor.service";

const GROUPS_PER_PAGE = 10;

export default function TeachingScheduleView() {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [dateValue, setDateValue] = useState("");
  const [viewMode, setViewMode] = useState<TeachingScheduleViewMode>("table");
  const [page, setPage] = useState(1);
  const [schedules, setSchedules] = useState<InstructorTeachingScheduleApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInstructorTeachingSchedules({
        q: searchValue.trim() || undefined,
        tanggal: dateValue || undefined,
        per_page: 100,
      });

      setSchedules(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadwal mengajar gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [dateValue, searchValue]);

  useEffect(() => {
    void fetchSchedules();
  }, [fetchSchedules]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusValue(value);
    setPage(1);
  }

  function handleDateChange(value: string) {
    setDateValue(value);
    setPage(1);
  }

  function handleViewModeChange(value: TeachingScheduleViewMode) {
    setViewMode(value);
    setPage(1);
  }

  function handleResetFilter() {
    setSearchValue("");
    setStatusValue("all");
    setDateValue("");
    setPage(1);
  }

  const groupedSchedules = useMemo(
    () => buildTeachingScheduleGroupItems(schedules),
    [schedules],
  );

  const filteredSchedules = useMemo(() => {
    return groupedSchedules.filter((item) => {
      return statusValue === "all" ? true : item.status === statusValue;
    });
  }, [groupedSchedules, statusValue]);

  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / GROUPS_PER_PAGE));
  const tableItems = useMemo(() => {
    if (viewMode === "calendar") return filteredSchedules;

    const start = (page - 1) * GROUPS_PER_PAGE;
    return filteredSchedules.slice(start, start + GROUPS_PER_PAGE);
  }, [filteredSchedules, page, viewMode]);

  const upcomingAgendaItems = useMemo(
    () => buildUpcomingAgendaFromTeachingGroups(groupedSchedules),
    [groupedSchedules],
  );

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] sm:-m-6 lg:-m-7 xl:-m-8">
      <TeachingScheduleHeader
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onClearSearch={() => handleSearchChange("")}
      />

      <div className="mx-auto w-full max-w-295 px-4 py-6 sm:px-6 lg:px-7">
        {error ? (
          <div className="mb-6">
            <ErrorMessage title="Gagal Memuat Data" message={error} />
          </div>
        ) : null}

        <TeachingScheduleToolbar
          statusValue={statusValue}
          dateValue={dateValue}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onDateChange={handleDateChange}
          onViewModeChange={handleViewModeChange}
          onResetFilter={handleResetFilter}
        />

        <div className="mt-6">
          {loading ? (
            <Card className="rounded-3xl p-8 shadow-sm">
              <LoadingSpinner label="Memuat jadwal mengajar..." />
            </Card>
          ) : viewMode === "calendar" ? (
            <TeachingScheduleCalendar items={tableItems} />
          ) : (
            <TeachingScheduleTable
              items={tableItems}
              pagination={{
                current_page: page,
                last_page: totalPages,
                per_page: GROUPS_PER_PAGE,
                total: filteredSchedules.length,
              }}
              onPageChange={setPage}
            />
          )}
        </div>

        <div className="mt-8">
          <UpcomingAgendaSection
            items={upcomingAgendaItems}
            onDetail={(id) => navigate(`/instruktur/jadwal-mengajar/paket/${id}`)}
          />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {teachingScheduleFooter}
        </footer>
      </div>
    </div>
  );
}
