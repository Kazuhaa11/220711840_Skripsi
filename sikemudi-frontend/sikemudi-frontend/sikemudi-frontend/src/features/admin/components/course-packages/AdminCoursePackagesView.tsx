import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import AddCoursePackageModal from "@/features/admin/components/course-packages/AddCoursePackageModal";
import AdminCoursePackagesFilters from "@/features/admin/components/course-packages/AdminCoursePackagesFilters";
import AdminCoursePackagesHeader from "@/features/admin/components/course-packages/AdminCoursePackagesHeader";
import AdminCoursePackagesTable from "@/features/admin/components/course-packages/AdminCoursePackagesTable";
import CoursePackageDetailModal from "@/features/admin/components/course-packages/CoursePackageDetailModal";
import DeleteCoursePackageModal from "@/features/admin/components/course-packages/DeleteCoursePackageModal";
import EditCoursePackageModal from "@/features/admin/components/course-packages/EditCoursePackageModal";
import type {
  AdminCoursePackage,
  AdminCoursePackageFormValues,
} from "@/features/admin/constants/coursePackages";
import {
  adminCoursePackageMessages,
  emptyCoursePackageFormValues,
} from "@/features/admin/constants/coursePackages";
import type { PaginationMeta } from "@/types/api";
import {
  getAdminMasterApiId,
  mapCoursePackageApiToAdmin,
  mapCoursePackageFormToPayload,
  mapCoursePackageToForm,
} from "@/features/admin/utils/adminMasterDataMapper";
import {
  activateAdminCoursePackage,
  createAdminCoursePackage,
  deleteAdminCoursePackage,
  getAdminCoursePackages,
  updateAdminCoursePackage,
} from "@/services/adminMasterData.service";

const ITEMS_PER_PAGE = 10;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function hasCompleteCoursePackagePrices(values: AdminCoursePackageFormValues) {
  return Boolean(
    values.priceNoPickup.trim() &&
      values.pricePickup.trim() &&
      values.priceSimNoPickup.trim() &&
      values.priceSimPickup.trim(),
  );
}

function buildPagination(total: number, page: number): PaginationMeta {
  return {
    current_page: page,
    last_page: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
    per_page: ITEMS_PER_PAGE,
    total,
  };
}

export default function AdminCoursePackagesView() {
  const { showNotification } = useFloatingNotification();
  const [coursePackages, setCoursePackages] = useState<AdminCoursePackage[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedCoursePackage, setSelectedCoursePackage] =
    useState<AdminCoursePackage | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [addFormValues, setAddFormValues] =
    useState<AdminCoursePackageFormValues>(emptyCoursePackageFormValues);
  const [editFormValues, setEditFormValues] =
    useState<AdminCoursePackageFormValues>(emptyCoursePackageFormValues);

  const fetchCoursePackages = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminCoursePackages({
        q: searchValue.trim() || undefined,
        status: statusValue === "all" ? undefined : statusValue,
        per_page: 100,
      });

      setCoursePackages(response.items.map(mapCoursePackageApiToAdmin));
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data paket kursus gagal dimuat."),
      });
    } finally {
      setLoading(false);
    }
  }, [searchValue, showNotification, statusValue]);

  useEffect(() => {
    void fetchCoursePackages();
  }, [fetchCoursePackages]);
  const filteredCoursePackages = coursePackages;


  const pagination = useMemo(
    () => buildPagination(filteredCoursePackages.length, page),
    [filteredCoursePackages.length, page],
  );

  const paginatedCoursePackages = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCoursePackages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCoursePackages, page]);

  useEffect(() => {
    if (page > pagination.last_page) {
      setPage(pagination.last_page);
    }
  }, [page, pagination.last_page]);

  function handleAddChange(
    field: keyof AdminCoursePackageFormValues,
    value: string | boolean,
  ) {
    setAddFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleEditChange(
    field: keyof AdminCoursePackageFormValues,
    value: string | boolean,
  ) {
    setEditFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOpenAddModal() {
    setAddFormValues(emptyCoursePackageFormValues);
    setAddModalOpen(true);
  }

  async function handleSubmitAdd() {
    if (
      !addFormValues.name.trim() ||
      !addFormValues.durationHours.trim() ||
      !hasCompleteCoursePackagePrices(addFormValues)
    ) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama paket, durasi, dan seluruh varian harga paket wajib diisi.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await createAdminCoursePackage(mapCoursePackageFormToPayload(addFormValues));
      setAddModalOpen(false);
      setAddFormValues(emptyCoursePackageFormValues);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminCoursePackageMessages.addSuccess,
      });
      setPage(1);
      await fetchCoursePackages();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Paket kursus gagal ditambahkan."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDetail(coursePackage: AdminCoursePackage) {
    setSelectedCoursePackage(coursePackage);
    setDetailModalOpen(true);
  }

  function handleOpenEdit(coursePackage: AdminCoursePackage) {
    setSelectedCoursePackage(coursePackage);
    setEditFormValues(mapCoursePackageToForm(coursePackage));
    setEditModalOpen(true);
  }

  async function handleSubmitEdit() {
    if (!selectedCoursePackage) return;

    if (
      !editFormValues.name.trim() ||
      !editFormValues.durationHours.trim() ||
      !hasCompleteCoursePackagePrices(editFormValues)
    ) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama paket, durasi, dan seluruh varian harga paket wajib diisi.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateAdminCoursePackage(
        getAdminMasterApiId(selectedCoursePackage),
        mapCoursePackageFormToPayload(editFormValues),
      );

      setEditModalOpen(false);
      setDetailModalOpen(false);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminCoursePackageMessages.editSuccess,
      });
      await fetchCoursePackages();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Paket kursus gagal diperbarui."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenStatusAction(coursePackage: AdminCoursePackage) {
    setSelectedCoursePackage(coursePackage);
    setDeleteModalOpen(true);
  }

  async function handleConfirmStatusAction() {
    if (!selectedCoursePackage) return;

    const isInactive = selectedCoursePackage.status === "Nonaktif";

    try {
      setActionLoading(true);

      if (isInactive) {
        await activateAdminCoursePackage(getAdminMasterApiId(selectedCoursePackage));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminCoursePackageMessages.activateSuccess,
        });
      } else {
        await deleteAdminCoursePackage(getAdminMasterApiId(selectedCoursePackage));
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminCoursePackageMessages.deactivateSuccess,
        });
      }

      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      await fetchCoursePackages();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(
          error,
          isInactive
            ? "Paket kursus gagal diaktifkan kembali."
            : "Paket kursus gagal dinonaktifkan.",
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

  function handleResetFilter() {
    setSearchValue("");
    setStatusValue("all");
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      <AdminCoursePackagesHeader onAdd={handleOpenAddModal} />

      <div className="mt-5">
        <AdminCoursePackagesFilters
          searchValue={searchValue}
          statusValue={statusValue}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <LoadingSpinner label="Memuat data paket kursus..." />
        ) : (
          <AdminCoursePackagesTable
            packages={paginatedCoursePackages}
            pagination={pagination}
            onPageChange={setPage}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleOpenStatusAction}
          />
        )}
      </div>

      <AddCoursePackageModal
        opened={addModalOpen}
        values={addFormValues}
        loading={actionLoading}
        onChange={handleAddChange}
        onClose={() => !actionLoading && setAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
      />

      <EditCoursePackageModal
        opened={editModalOpen}
        coursePackage={selectedCoursePackage}
        values={editFormValues}
        loading={actionLoading}
        onChange={handleEditChange}
        onClose={() => !actionLoading && setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      <CoursePackageDetailModal
        opened={detailModalOpen}
        coursePackage={selectedCoursePackage}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(coursePackage) => {
          setDetailModalOpen(false);
          handleOpenEdit(coursePackage);
        }}
      />

      <DeleteCoursePackageModal
        opened={deleteModalOpen}
        coursePackage={selectedCoursePackage}
        loading={actionLoading}
        onClose={() => !actionLoading && setDeleteModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
      />
    </div>
  );
}
