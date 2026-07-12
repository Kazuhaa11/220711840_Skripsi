import { useCallback, useEffect, useMemo, useState } from "react";
import type { BookingHistoryItem } from "@/features/participant/constants/type";
import BookingHistoryDetailModal from "@/features/participant/components/booking-history/BookingHistoryDetailModal";
import BookingHistoryFilterBar from "@/features/participant/components/booking-history/BookingHistoryFilterBar";
import BookingHistoryHeader from "@/features/participant/components/booking-history/BookingHistoryHeader";
import BookingHistoryTable from "@/features/participant/components/booking-history/BookingHistoryTable";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import Button from "@/components/ui/Button";
import { getParticipantBookingPackageHistory } from "@/services/booking.service";
import { mapBookingGroupHistoryItem } from "@/features/participant/utils/bookingMapper";

const ITEMS_PER_PAGE = 6;

export default function BookingHistoryView() {
  const [selectedMonth, setSelectedMonth] = useState("Semua Bulan");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedInstructor, setSelectedInstructor] = useState("Semua Instruktur");
  const [selectedVehicle, setSelectedVehicle] = useState("Semua Kendaraan");
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<BookingHistoryItem | null>(null);
  const [detailModalOpened, setDetailModalOpened] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParticipantBookingPackageHistory({ per_page: 100 });
      setItems(response.items.map(mapBookingGroupHistoryItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Riwayat booking paket gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const monthOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.monthLabel)));
  }, [items]);

  const instructorOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.instructorName)));
  }, [items]);

  const vehicleOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.vehicleName)));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchMonth = selectedMonth === "Semua Bulan" || item.monthLabel === selectedMonth;
      const matchStatus = selectedStatus === "Semua Status" || item.status === selectedStatus;
      const matchInstructor =
        selectedInstructor === "Semua Instruktur" || item.instructorName === selectedInstructor;
      const matchVehicle = selectedVehicle === "Semua Kendaraan" || item.vehicleName === selectedVehicle;

      return matchMonth && matchStatus && matchInstructor && matchVehicle;
    });
  }, [items, selectedInstructor, selectedMonth, selectedStatus, selectedVehicle]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredItems]);

  function handleResetFilters() {
    setSelectedMonth("Semua Bulan");
    setSelectedStatus("Semua Status");
    setSelectedInstructor("Semua Instruktur");
    setSelectedVehicle("Semua Kendaraan");
    setCurrentPage(1);
  }

  function handleOpenDetail(item: BookingHistoryItem) {
    setSelectedItem(item);
    setDetailModalOpened(true);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function handleMonthChange(value: string) {
    setSelectedMonth(value);
    setCurrentPage(1);
  }

  function handleStatusChange(value: string) {
    setSelectedStatus(value);
    setCurrentPage(1);
  }

  function handleInstructorChange(value: string) {
    setSelectedInstructor(value);
    setCurrentPage(1);
  }

  function handleVehicleChange(value: string) {
    setSelectedVehicle(value);
    setCurrentPage(1);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
          <BookingHistoryHeader />

          {loading ? (
            <LoadingSpinner label="Memuat riwayat booking paket..." />
          ) : error ? (
            <div className="mt-4 sm:mt-6">
              <ErrorMessage
                message={error}
                action={
                  <Button variant="outline" onClick={() => void loadHistory()}>
                    Muat Ulang
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-4 sm:mt-6">
                <BookingHistoryFilterBar
                  selectedMonth={selectedMonth}
                  onChangeMonth={handleMonthChange}
                  selectedStatus={selectedStatus}
                  onChangeStatus={handleStatusChange}
                  selectedInstructor={selectedInstructor}
                  onChangeInstructor={handleInstructorChange}
                  selectedVehicle={selectedVehicle}
                  onChangeVehicle={handleVehicleChange}
                  monthOptions={monthOptions}
                  instructorOptions={instructorOptions}
                  vehicleOptions={vehicleOptions}
                  onReset={handleResetFilters}
                />
              </div>

              <div className="mt-4 sm:mt-6">
                <BookingHistoryTable
                  items={paginatedItems}
                  totalCount={filteredItems.length}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onViewDetail={handleOpenDetail}
                />
              </div>
            </>
          )}
        </section>
      </div>

      <BookingHistoryDetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        item={selectedItem}
      />
    </>
  );
}
