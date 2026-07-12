import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import AddVehicleModal from "@/features/admin/components/vehicles/AddVehicleModal";
import AdminVehiclesFilters from "@/features/admin/components/vehicles/AdminVehiclesFilters";
import AdminVehiclesHeader from "@/features/admin/components/vehicles/AdminVehiclesHeader";
import AdminVehiclesTable from "@/features/admin/components/vehicles/AdminVehiclesTable";
import DeleteVehicleModal from "@/features/admin/components/vehicles/DeleteVehicleModal";
import EditVehicleModal from "@/features/admin/components/vehicles/EditVehicleModal";
import VehicleDetailModal from "@/features/admin/components/vehicles/VehicleDetailModal";
import type {
  AdminVehicle,
  AdminVehicleFormValues,
} from "@/features/admin/constants/vehicles";
import {
  adminVehicleMessages,
  emptyVehicleFormValues,
} from "@/features/admin/constants/vehicles";
import type { PaginationMeta } from "@/types/api";
import {
  getAdminMasterApiId,
  mapVehicleApiToAdmin,
  mapVehicleFormToPayload,
  mapVehicleToForm,
} from "@/features/admin/utils/adminMasterDataMapper";
import {
  activateAdminVehicle,
  createAdminVehicle,
  deleteAdminVehicle,
  getAdminVehicles,
  updateAdminVehicle,
} from "@/services/adminMasterData.service";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminVehiclesView() {
  const { showNotification } = useFloatingNotification();
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [transmissionValue, setTransmissionValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [addFormValues, setAddFormValues] =
    useState<AdminVehicleFormValues>(emptyVehicleFormValues);
  const [editFormValues, setEditFormValues] =
    useState<AdminVehicleFormValues>(emptyVehicleFormValues);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminVehicles({
        q: searchValue.trim() || undefined,
        status: statusValue === "all" ? undefined : statusValue,
        transmisi: transmissionValue === "all" ? undefined : transmissionValue,
        page,
        per_page: 10,
      });

      setVehicles(response.items.map(mapVehicleApiToAdmin));
      setPagination(response.pagination);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data kendaraan gagal dimuat."),
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, showNotification, statusValue, transmissionValue]);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  function handleAddChange(field: keyof AdminVehicleFormValues, value: string) {
    setAddFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleEditChange(field: keyof AdminVehicleFormValues, value: string) {
    setEditFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleOpenAddModal() {
    setAddFormValues(emptyVehicleFormValues);
    setAddModalOpen(true);
  }

  async function handleSubmitAdd() {
    if (!addFormValues.name.trim() || !addFormValues.model.trim() || !addFormValues.plateNumber.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama, model, dan plat nomor kendaraan wajib diisi.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await createAdminVehicle(mapVehicleFormToPayload(addFormValues));
      setAddModalOpen(false);
      setAddFormValues(emptyVehicleFormValues);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminVehicleMessages.addSuccess,
      });
      setPage(1);
      await fetchVehicles();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Kendaraan gagal ditambahkan."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDetail(vehicle: AdminVehicle) {
    setSelectedVehicle(vehicle);
    setDetailModalOpen(true);
  }

  function handleOpenEdit(vehicle: AdminVehicle) {
    setSelectedVehicle(vehicle);
    setEditFormValues(mapVehicleToForm(vehicle));
    setEditModalOpen(true);
  }

  async function handleSubmitEdit() {
    if (!selectedVehicle) return;

    if (!editFormValues.name.trim() || !editFormValues.model.trim() || !editFormValues.plateNumber.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama, model, dan plat nomor kendaraan wajib diisi.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateAdminVehicle(
        getAdminMasterApiId(selectedVehicle),
        mapVehicleFormToPayload(editFormValues),
      );

      setEditModalOpen(false);
      setDetailModalOpen(false);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminVehicleMessages.editSuccess,
      });
      await fetchVehicles();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Kendaraan gagal diperbarui."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenStatusAction(vehicle: AdminVehicle) {
    setSelectedVehicle(vehicle);
    setDeleteModalOpen(true);
  }

  async function handleConfirmStatusAction() {
    if (!selectedVehicle) return;

    const isInactive = selectedVehicle.status === "Nonaktif";

    try {
      setActionLoading(true);

      if (isInactive) {
        await activateAdminVehicle(getAdminMasterApiId(selectedVehicle));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminVehicleMessages.activateSuccess,
        });
      } else {
        await deleteAdminVehicle(getAdminMasterApiId(selectedVehicle));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminVehicleMessages.deactivateSuccess,
        });
      }

      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      await fetchVehicles();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(
          error,
          isInactive
            ? "Kendaraan gagal diaktifkan kembali."
            : "Kendaraan gagal dinonaktifkan.",
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

  function handleTransmissionChange(value: string) {
    setTransmissionValue(value);
    setPage(1);
  }

  function handleResetFilter() {
    setSearchValue("");
    setStatusValue("all");
    setTransmissionValue("all");
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      <AdminVehiclesHeader onAdd={handleOpenAddModal} />

      <div className="mt-5">
        <AdminVehiclesFilters
          searchValue={searchValue}
          statusValue={statusValue}
          transmissionValue={transmissionValue}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onTransmissionChange={handleTransmissionChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <Card className="rounded-3xl p-8 shadow-sm">
            <LoadingSpinner label="Memuat data kendaraan..." />
          </Card>
        ) : (
          <AdminVehiclesTable
            vehicles={vehicles}
            pagination={pagination}
            onPageChange={setPage}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleOpenStatusAction}
          />
        )}
      </div>

      <AddVehicleModal
        opened={addModalOpen}
        values={addFormValues}
        loading={actionLoading}
        onChange={handleAddChange}
        onClose={() => !actionLoading && setAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
      />

      <EditVehicleModal
        opened={editModalOpen}
        vehicle={selectedVehicle}
        values={editFormValues}
        loading={actionLoading}
        onChange={handleEditChange}
        onClose={() => !actionLoading && setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      <VehicleDetailModal
        opened={detailModalOpen}
        vehicle={selectedVehicle}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <DeleteVehicleModal
        opened={deleteModalOpen}
        vehicle={selectedVehicle}
        loading={actionLoading}
        onClose={() => !actionLoading && setDeleteModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
      />
    </div>
  );
}
