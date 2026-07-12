import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import AdminTrainingSchedulesCalendar from "@/features/admin/components/training-schedules/AdminTrainingSchedulesCalendar";
import AdminTrainingSchedulesFilters from "@/features/admin/components/training-schedules/AdminTrainingSchedulesFilters";
import AdminTrainingSchedulesHeader from "@/features/admin/components/training-schedules/AdminTrainingSchedulesHeader";
import AdminTrainingSchedulesTable from "@/features/admin/components/training-schedules/AdminTrainingSchedulesTable";
import { getAdminBookings } from "@/services/adminBooking.service";
import {
  getAdminCoursePackages,
  type AdminCoursePackageApiItem,
} from "@/services/adminMasterData.service";
import type { PaginationMeta } from "@/types/api";
import type { AdminBookingApiItem } from "@/types/adminBooking";

interface SelectOption {
  label: string;
  value: string;
}

function createBaseOption(label: string): SelectOption {
  return { label, value: "all" };
}

function createCoursePackageOptions(items: AdminCoursePackageApiItem[]): SelectOption[] {
  return [
    createBaseOption("Semua Paket"),
    ...items.map((item) => ({
      label: `${item.nama_paket} • ${item.durasi_jam} Jam`,
      value: String(item.id),
    })),
  ];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminTrainingSchedulesView() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBookingApiItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  const [coursePackages, setCoursePackages] = useState<AdminCoursePackageApiItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [coursePackageFilterValue, setCoursePackageFilterValue] = useState("all");
  const [statusValue, setStatusValue] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [optionLoading, setOptionLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const coursePackageOptions = useMemo(
    () => createCoursePackageOptions(coursePackages),
    [coursePackages],
  );

  const fetchOptions = useCallback(async () => {
    try {
      setOptionLoading(true);
      const packageResponse = await getAdminCoursePackages({ per_page: 100 });
      setCoursePackages(packageResponse.items);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Data opsi paket gagal dimuat."));
    } finally {
      setOptionLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminBookings({
        page,
        per_page: 10,
        q: searchValue.trim() || undefined,
        tanggal: dateValue || undefined,
        course_package_id:
          coursePackageFilterValue === "all" ? undefined : coursePackageFilterValue,
        status: statusValue === "all" ? undefined : statusValue,
      });

      setBookings(response.items);
      setPagination(response.pagination);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Data jadwal latihan paket gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, [coursePackageFilterValue, dateValue, page, searchValue, statusValue]);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleDateChange(value: string) {
    setDateValue(value);
    setPage(1);
  }

  function handleCoursePackageFilterChange(value: string) {
    setCoursePackageFilterValue(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusValue(value);
    setPage(1);
  }

  function handleResetFilter() {
    setSearchValue("");
    setDateValue("");
    setCoursePackageFilterValue("all");
    setStatusValue("all");
    setPage(1);
  }

  function handleOpenDetail(item: AdminBookingApiItem) {
    navigate(`/admin/jadwal-latihan/${item.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      {errorMessage ? (
        <div className="mb-6">
          <ErrorMessage title="Data Gagal Dimuat" message={errorMessage} />
        </div>
      ) : null}

      <AdminTrainingSchedulesHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-5">
        <AdminTrainingSchedulesFilters
          searchValue={searchValue}
          dateValue={dateValue}
          coursePackageValue={coursePackageFilterValue}
          statusValue={statusValue}
          coursePackageOptions={coursePackageOptions}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onCoursePackageChange={handleCoursePackageFilterChange}
          onStatusChange={handleStatusChange}
          onReset={handleResetFilter}
        />
      </div>

      {optionLoading && !loading ? (
        <p className="mt-3 text-sm text-slate-500">Memuat opsi filter paket...</p>
      ) : null}

      {loading && bookings.length === 0 ? (
        <div className="mt-5 rounded-3xl bg-white p-8 shadow-sm">
          <LoadingSpinner label="Memuat jadwal latihan paket..." />
        </div>
      ) : viewMode === "table" ? (
        <div className="mt-5">
          <AdminTrainingSchedulesTable
            items={bookings}
            pagination={pagination}
            loading={loading}
            onDetail={handleOpenDetail}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div className="mt-5">
          <AdminTrainingSchedulesCalendar items={bookings} onDetail={handleOpenDetail} />
        </div>
      )}
    </div>
  );
}
