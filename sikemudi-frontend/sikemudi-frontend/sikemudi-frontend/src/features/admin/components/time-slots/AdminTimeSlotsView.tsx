import { useCallback, useEffect, useState } from "react";
import { CalendarClock, ListChecks } from "lucide-react";
import DataTabs, { type DataTabItem } from "@/components/common/DataTabs";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import AddTimeSlotModal from "@/features/admin/components/time-slots/AddTimeSlotModal";
import AdminTimeSlotsFilters from "@/features/admin/components/time-slots/AdminTimeSlotsFilters";
import AdminTimeSlotsHeader from "@/features/admin/components/time-slots/AdminTimeSlotsHeader";
import AdminTimeSlotsTable from "@/features/admin/components/time-slots/AdminTimeSlotsTable";
import DeleteTimeSlotModal from "@/features/admin/components/time-slots/DeleteTimeSlotModal";
import EditTimeSlotModal from "@/features/admin/components/time-slots/EditTimeSlotModal";
import TimeSlotDetailModal from "@/features/admin/components/time-slots/TimeSlotDetailModal";
import InstructorSlotAssignmentsView from "@/features/admin/components/time-slots/InstructorSlotAssignmentsView";
import type {
  AdminTimeSlot,
  AdminTimeSlotFormValues,
} from "@/features/admin/constants/timeSlots";
import {
  adminTimeSlotMessages,
  emptyTimeSlotFormValues,
} from "@/features/admin/constants/timeSlots";
import type { PaginationMeta } from "@/types/api";
import {
  getAdminMasterApiId,
  mapTimeSlotApiToAdmin,
  mapTimeSlotFormToPayload,
  mapTimeSlotToForm,
} from "@/features/admin/utils/adminMasterDataMapper";
import {
  activateAdminTimeSlot,
  createAdminTimeSlot,
  deleteAdminTimeSlot,
  getAdminTimeSlots,
  updateAdminTimeSlot,
} from "@/services/adminMasterData.service";

type TimeSlotTab = "slots" | "assignments";

const timeSlotTabs: DataTabItem<TimeSlotTab>[] = [
  { id: "slots", label: "Data Slot Waktu", icon: CalendarClock },
  { id: "assignments", label: "Assignment Instruktur", icon: ListChecks },
];

function calculateDurationMinutes(startTime: string, endTime: string) {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminTimeSlotsView() {
  const { showNotification } = useFloatingNotification();
  const [activeTab, setActiveTab] = useState<TimeSlotTab>("slots");
  const [timeSlots, setTimeSlots] = useState<AdminTimeSlot[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AdminTimeSlot | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [addFormValues, setAddFormValues] =
    useState<AdminTimeSlotFormValues>(emptyTimeSlotFormValues);
  const [editFormValues, setEditFormValues] =
    useState<AdminTimeSlotFormValues>(emptyTimeSlotFormValues);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminTimeSlots({
        q: searchValue.trim() || undefined,
        status: statusValue === "all" ? undefined : statusValue,
        page,
        per_page: 10,
      });

      setTimeSlots(response.items.map(mapTimeSlotApiToAdmin));
      setPagination(response.pagination);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data slot waktu gagal dimuat."),
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, showNotification, statusValue]);

  useEffect(() => {
    void fetchTimeSlots();
  }, [fetchTimeSlots]);

  function handleAddChange(field: keyof AdminTimeSlotFormValues, value: string) {
    setAddFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleEditChange(field: keyof AdminTimeSlotFormValues, value: string) {
    setEditFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleOpenAddModal() {
    setAddFormValues(emptyTimeSlotFormValues);
    setAddModalOpen(true);
  }

  function validateForm(values: AdminTimeSlotFormValues) {
    if (!values.name.trim() || !values.startTime || !values.endTime) {
      return "Nama slot, jam mulai, dan jam selesai wajib diisi.";
    }

    if (calculateDurationMinutes(values.startTime, values.endTime) <= 0) {
      return "Jam selesai harus lebih besar dari jam mulai.";
    }

    return "";
  }

  async function handleSubmitAdd() {
    const validationMessage = validateForm(addFormValues);

    if (validationMessage) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: validationMessage,
      });
      return;
    }

    try {
      setActionLoading(true);
      await createAdminTimeSlot(mapTimeSlotFormToPayload(addFormValues));
      setAddModalOpen(false);
      setAddFormValues(emptyTimeSlotFormValues);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminTimeSlotMessages.addSuccess,
      });
      setPage(1);
      await fetchTimeSlots();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Slot waktu gagal ditambahkan."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDetail(timeSlot: AdminTimeSlot) {
    setSelectedTimeSlot(timeSlot);
    setDetailModalOpen(true);
  }

  function handleOpenEdit(timeSlot: AdminTimeSlot) {
    setSelectedTimeSlot(timeSlot);
    setEditFormValues(mapTimeSlotToForm(timeSlot));
    setEditModalOpen(true);
  }

  async function handleSubmitEdit() {
    if (!selectedTimeSlot) return;

    const validationMessage = validateForm(editFormValues);

    if (validationMessage) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: validationMessage,
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateAdminTimeSlot(
        getAdminMasterApiId(selectedTimeSlot),
        mapTimeSlotFormToPayload(editFormValues),
      );

      setEditModalOpen(false);
      setDetailModalOpen(false);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminTimeSlotMessages.editSuccess,
      });
      await fetchTimeSlots();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Slot waktu gagal diperbarui."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenStatusAction(timeSlot: AdminTimeSlot) {
    setSelectedTimeSlot(timeSlot);
    setDeleteModalOpen(true);
  }

  async function handleConfirmStatusAction() {
    if (!selectedTimeSlot) return;

    const isInactive = selectedTimeSlot.status === "Nonaktif";

    try {
      setActionLoading(true);

      if (isInactive) {
        await activateAdminTimeSlot(getAdminMasterApiId(selectedTimeSlot));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminTimeSlotMessages.activateSuccess,
        });
      } else {
        await deleteAdminTimeSlot(getAdminMasterApiId(selectedTimeSlot));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminTimeSlotMessages.deactivateSuccess,
        });
      }

      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      await fetchTimeSlots();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(
          error,
          isInactive
            ? "Slot waktu gagal diaktifkan kembali."
            : "Slot waktu gagal dinonaktifkan.",
        ),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusValue(value);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      <AdminTimeSlotsHeader
        onAdd={handleOpenAddModal}
        actionLabel="Tambah Slot Waktu"
        showAction={activeTab === "slots"}
      />

      <div className="mt-5">
        <DataTabs
          tabs={timeSlotTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
          className="max-w-xl"
        />
      </div>

      {activeTab === "assignments" ? (
        <div className="mt-5">
          <InstructorSlotAssignmentsView />
        </div>
      ) : (
        <>
          <div className="mt-5">
            <AdminTimeSlotsFilters
              searchValue={searchValue}
              statusValue={statusValue}
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="mt-5">
            {loading ? (
              <LoadingSpinner label="Memuat data slot waktu..." />
            ) : (
              <AdminTimeSlotsTable
                timeSlots={timeSlots}
                pagination={pagination}
                onPageChange={setPage}
                onDetail={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleOpenStatusAction}
              />
            )}
          </div>
        </>
      )}

      <AddTimeSlotModal
        opened={addModalOpen}
        values={addFormValues}
        loading={actionLoading}
        onChange={handleAddChange}
        onClose={() => !actionLoading && setAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
      />

      <EditTimeSlotModal
        opened={editModalOpen}
        timeSlot={selectedTimeSlot}
        values={editFormValues}
        loading={actionLoading}
        onChange={handleEditChange}
        onClose={() => !actionLoading && setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      <TimeSlotDetailModal
        opened={detailModalOpen}
        timeSlot={selectedTimeSlot}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <DeleteTimeSlotModal
        opened={deleteModalOpen}
        timeSlot={selectedTimeSlot}
        loading={actionLoading}
        onClose={() => !actionLoading && setDeleteModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
      />
    </div>
  );
}
