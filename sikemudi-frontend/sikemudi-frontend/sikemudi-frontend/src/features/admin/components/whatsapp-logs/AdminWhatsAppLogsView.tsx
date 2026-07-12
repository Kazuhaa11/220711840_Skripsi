import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import {
  getAdminWhatsAppLogDetail,
  getAdminWhatsAppLogs,
  retryAdminWhatsAppLog,
} from "@/services/adminWhatsAppLog.service";
import AdminWhatsAppLogDetailModal from "@/features/admin/components/whatsapp-logs/AdminWhatsAppLogDetailModal";
import AdminWhatsAppLogsFilters from "@/features/admin/components/whatsapp-logs/AdminWhatsAppLogsFilters";
import AdminWhatsAppLogsStats from "@/features/admin/components/whatsapp-logs/AdminWhatsAppLogsStats";
import AdminWhatsAppLogsTable from "@/features/admin/components/whatsapp-logs/AdminWhatsAppLogsTable";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminWhatsAppLogFilterOptions,
  AdminWhatsAppLogItem,
  AdminWhatsAppLogStats,
} from "@/types/adminWhatsAppLog";

const DEFAULT_STATS: AdminWhatsAppLogStats = {
  total: 0,
  pending: 0,
  sent: 0,
  skipped: 0,
  failed: 0,
};

const DEFAULT_FILTER_OPTIONS: AdminWhatsAppLogFilterOptions = {
  statuses: [
    { label: "Semua Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Terkirim", value: "Terkirim" },
    { label: "Dilewati", value: "Dilewati" },
    { label: "Gagal", value: "Gagal" },
  ],
  event_types: [{ label: "Semua Event", value: "all" }],
};

export default function AdminWhatsAppLogsView() {
  const [items, setItems] = useState<AdminWhatsAppLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<AdminWhatsAppLogStats>(DEFAULT_STATS);
  const [filterOptions, setFilterOptions] = useState<AdminWhatsAppLogFilterOptions>(DEFAULT_FILTER_OPTIONS);

  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<AdminWhatsAppLogItem | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);

  const fetchLogs = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        setError(null);

        const response = await getAdminWhatsAppLogs({
          q: searchValue.trim() || undefined,
          status: status === "all" ? undefined : status,
          event_type: eventType === "all" ? undefined : eventType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page,
          per_page: 10,
        });

        setItems(response.items);
        setPagination(response.pagination);
        setStats(response.stats ?? DEFAULT_STATS);
        setFilterOptions(response.filter_options ?? DEFAULT_FILTER_OPTIONS);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Data log WhatsApp gagal dimuat.");
      } finally {
        setLoading(false);
      }
    },
    [endDate, eventType, page, searchValue, startDate, status],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchLogs]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => setSuccessMessage(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function resetFilters() {
    setSearchValue("");
    setStatus("all");
    setEventType("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  async function handleOpenDetail(item: AdminWhatsAppLogItem) {
    try {
      setActionLoading(true);
      setError(null);
      setSelectedItem(item);
      setDetailOpened(true);

      const response = await getAdminWhatsAppLogDetail(item.id);
      setSelectedItem(response.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detail log WhatsApp gagal dimuat.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRetry(item: AdminWhatsAppLogItem) {
    if (!item.can_retry) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await retryAdminWhatsAppLog(item.id);
      setSelectedItem(response.item);
      setSuccessMessage("Pengiriman ulang WhatsApp berhasil diproses.");
      await fetchLogs({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pengiriman ulang WhatsApp gagal.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      {successMessage ? <SuccesBanner message={successMessage} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <AdminWhatsAppLogsStats stats={stats} />

      <AdminWhatsAppLogsFilters
        searchValue={searchValue}
        status={status}
        eventType={eventType}
        startDate={startDate}
        endDate={endDate}
        filterOptions={filterOptions}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onEventTypeChange={(value) => {
          setEventType(value);
          setPage(1);
        }}
        onStartDateChange={(value) => {
          setStartDate(value);
          setPage(1);
        }}
        onEndDateChange={(value) => {
          setEndDate(value);
          setPage(1);
        }}
        onReset={resetFilters}
      />

      {loading ? (
        <LoadingSpinner label="Memuat log WhatsApp..." />
      ) : (
        <AdminWhatsAppLogsTable
          items={items}
          pagination={pagination}
          loading={loading}
          actionLoading={actionLoading}
          onPageChange={setPage}
          onDetail={(item) => void handleOpenDetail(item)}
          onRetry={(item) => void handleRetry(item)}
        />
      )}

      <AdminWhatsAppLogDetailModal
        opened={detailOpened}
        item={selectedItem}
        loading={actionLoading}
        onClose={() => setDetailOpened(false)}
        onRetry={(item) => void handleRetry(item)}
      />
    </div>
  );
}
