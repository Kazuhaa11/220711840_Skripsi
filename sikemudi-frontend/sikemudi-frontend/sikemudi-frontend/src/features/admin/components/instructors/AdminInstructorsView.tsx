import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import AddInstructorModal from "@/features/admin/components/instructors/AddInstructorModal";
import AdminInstructorsFilters from "@/features/admin/components/instructors/AdminInstructorsFilters";
import AdminInstructorsHeader from "@/features/admin/components/instructors/AdminInstructorsHeader";
import AdminInstructorsTable from "@/features/admin/components/instructors/AdminInstructorsTable";
import DeleteInstructorModal from "@/features/admin/components/instructors/DeleteInstructorModal";
import EditInstructorModal from "@/features/admin/components/instructors/EditInstructorModal";
import InstructorDetailModal from "@/features/admin/components/instructors/InstructorDetailModal";
import type {
  AdminInstructor,
  AdminInstructorFormValues,
  AdminInstructorScheduleStatus,
  AdminInstructorStatus,
} from "@/features/admin/constants/instructors";
import {
  adminInstructorMessages,
  emptyInstructorFormValues,
} from "@/features/admin/constants/instructors";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminInstructorApiItem,
  AdminInstructorPayload,
} from "@/services/adminMasterData.service";
import {
  activateAdminInstructor,
  createAdminInstructor,
  deleteAdminInstructor,
  getAdminInstructors,
  updateAdminInstructor,
} from "@/services/adminMasterData.service";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0])
      .join("")
      .toUpperCase() || "-"
  );
}

function getAvatarTone(index: number): AdminInstructor["avatarTone"] {
  const tones: AdminInstructor["avatarTone"][] = ["blue", "green", "amber", "slate"];
  return tones[index % tones.length];
}

function mapInstructorApiToAdmin(item: AdminInstructorApiItem, index: number): AdminInstructor {
  const name = item.nama_instruktur ?? item.user?.name ?? "Instruktur Tanpa Nama";
  const scheduleStatus = (item.status_jadwal ?? "Terjadwal") as AdminInstructorScheduleStatus;

  return {
    apiId: item.id,
    id: item.kode_instruktur ?? `INS-${item.id}`,
    fullName: name,
    email: item.email ?? item.user?.email ?? "-",
    phone: item.no_telepon ?? item.user?.no_telepon ?? "-",
    address: item.alamat ?? item.user?.alamat ?? null,
    accountStatus: item.status_akun ?? item.user?.status_akun ?? "Aktif",
    role: item.jabatan ?? "Instruktur Mengemudi",
    specialization: item.spesialisasi ?? "Manual & Matic",
    status: (item.status ?? "Aktif") as AdminInstructorStatus,
    scheduleStatus,
    todaySchedule: scheduleStatus,
    remainingSlots:
      scheduleStatus === "Libur / Cuti"
        ? "Tidak tersedia"
        : scheduleStatus === "Mengajar"
          ? "Sedang aktif"
          : "Menunggu jadwal",
    joinedAt: item.tanggal_bergabung ?? "-",
    rating: Number(item.rating ?? 0),
    totalSessions: Number(item.total_sesi ?? 0),
    graduationRate: Number(item.tingkat_kelulusan ?? 0),
    initials: getInitials(name),
    avatarTone: getAvatarTone(index),
    todaySessions: [],
  };
}

function formValuesFromInstructor(instructor: AdminInstructor): AdminInstructorFormValues {
  return {
    fullName: instructor.fullName,
    email: instructor.email === "-" ? "" : instructor.email,
    phone: instructor.phone === "-" ? "" : instructor.phone,
    address: instructor.address ?? "",
    password: "",
    passwordConfirmation: "",
    accountStatus: instructor.accountStatus ?? "Aktif",
    role: instructor.role,
    specialization: instructor.specialization,
    status: instructor.status,
    scheduleStatus: instructor.scheduleStatus,
    todaySchedule: instructor.todaySchedule,
  };
}

function buildInstructorPayload(
  values: AdminInstructorFormValues,
  selectedInstructor?: AdminInstructor | null,
): AdminInstructorPayload {
  const payload: AdminInstructorPayload = {
    name: values.fullName.trim(),
    email: values.email.trim(),
    no_telepon: values.phone.trim(),
    alamat: values.address.trim() || null,
    status_akun: values.accountStatus,
    kode_instruktur: selectedInstructor?.id?.startsWith("INS-") ? selectedInstructor.id : null,
    jabatan: values.role.trim() || "Instruktur Mengemudi",
    spesialisasi: values.specialization.trim() || null,
    status: values.status,
    status_jadwal: values.scheduleStatus,
    rating: selectedInstructor?.rating ?? 0,
    total_sesi: selectedInstructor?.totalSessions ?? 0,
    tingkat_kelulusan: selectedInstructor?.graduationRate ?? 0,
  };

  if (values.password.trim()) {
    payload.password = values.password;
    payload.password_confirmation = values.passwordConfirmation;
  }

  return payload;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminInstructorsView() {
  const { showNotification } = useFloatingNotification();
  const [instructors, setInstructors] = useState<AdminInstructor[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedInstructor, setSelectedInstructor] =
    useState<AdminInstructor | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [addFormValues, setAddFormValues] = useState<AdminInstructorFormValues>(
    emptyInstructorFormValues,
  );
  const [editFormValues, setEditFormValues] =
    useState<AdminInstructorFormValues>(emptyInstructorFormValues);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminInstructors({
        q: searchValue.trim() || undefined,
        status: statusValue === "all" ? undefined : statusValue,
        page,
        per_page: 10,
      });

      setInstructors(response.items.map(mapInstructorApiToAdmin));
      setPagination(response.pagination);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data instruktur gagal dimuat."),
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, showNotification, statusValue]);

  useEffect(() => {
    void fetchInstructors();
  }, [fetchInstructors]);

  function handleAddChange(field: keyof AdminInstructorFormValues, value: string) {
    setAddFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleEditChange(field: keyof AdminInstructorFormValues, value: string) {
    setEditFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleOpenAddModal() {
    setAddFormValues(emptyInstructorFormValues);
    setAddModalOpen(true);
  }

  async function handleSubmitAdd() {
    if (!addFormValues.fullName.trim() || !addFormValues.email.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama lengkap dan email instruktur wajib diisi.",
      });
      return;
    }

    if (!addFormValues.phone.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nomor telepon instruktur wajib diisi.",
      });
      return;
    }

    if (!addFormValues.password.trim() || addFormValues.password.length < 8) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Password instruktur wajib diisi minimal 8 karakter.",
      });
      return;
    }

    if (addFormValues.password !== addFormValues.passwordConfirmation) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Konfirmasi password instruktur tidak sesuai.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await createAdminInstructor(buildInstructorPayload(addFormValues));
      setAddModalOpen(false);
      setAddFormValues(emptyInstructorFormValues);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminInstructorMessages.addSuccess,
      });
      setPage(1);
      await fetchInstructors();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data instruktur gagal ditambahkan."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDetail(instructor: AdminInstructor) {
    setSelectedInstructor(instructor);
    setDetailModalOpen(true);
  }

  function handleOpenEdit(instructor: AdminInstructor) {
    setSelectedInstructor(instructor);
    setEditFormValues(formValuesFromInstructor(instructor));
    setEditModalOpen(true);
  }

  async function handleSubmitEdit() {
    if (!selectedInstructor) return;

    if (!editFormValues.fullName.trim() || !editFormValues.email.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nama lengkap dan email instruktur wajib diisi.",
      });
      return;
    }

    if (!editFormValues.phone.trim()) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Nomor telepon instruktur wajib diisi.",
      });
      return;
    }

    if (editFormValues.password && editFormValues.password.length < 8) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Password baru minimal 8 karakter.",
      });
      return;
    }

    if (editFormValues.password !== editFormValues.passwordConfirmation) {
      showNotification({
        type: "error",
        title: "Validasi Gagal",
        message: "Konfirmasi password baru tidak sesuai.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateAdminInstructor(
        selectedInstructor.apiId ?? selectedInstructor.id,
        buildInstructorPayload(editFormValues, selectedInstructor),
      );
      setEditModalOpen(false);
      setDetailModalOpen(false);
      showNotification({
        type: "success",
        title: "Berhasil",
        message: adminInstructorMessages.editSuccess,
      });
      await fetchInstructors();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Data instruktur gagal diperbarui."),
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDelete(instructor: AdminInstructor) {
    setSelectedInstructor(instructor);
    setDeleteModalOpen(true);
  }

  async function handleConfirmStatusAction() {
    if (!selectedInstructor) return;

    const isInactive = selectedInstructor.accountStatus === "Nonaktif" || selectedInstructor.status === "Nonaktif";

    try {
      setActionLoading(true);

      if (isInactive) {
        await activateAdminInstructor(selectedInstructor.apiId ?? selectedInstructor.id);
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminInstructorMessages.activateSuccess,
        });
      } else {
        await deleteAdminInstructor(selectedInstructor.apiId ?? selectedInstructor.id);
        showNotification({
          type: "success",
          title: "Berhasil",
          message: adminInstructorMessages.deactivateSuccess,
        });
      }

      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      await fetchInstructors();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(
          error,
          isInactive
            ? "Instruktur gagal diaktifkan kembali."
            : "Instruktur gagal dinonaktifkan.",
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
      <AdminInstructorsHeader onAdd={handleOpenAddModal} />

      <div className="mt-5">
        <AdminInstructorsFilters
          searchValue={searchValue}
          statusValue={statusValue}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <Card className="rounded-3xl p-8 shadow-sm">
            <LoadingSpinner label="Memuat data instruktur..." />
          </Card>
        ) : (
          <AdminInstructorsTable
            instructors={instructors}
            pagination={pagination}
            onPageChange={setPage}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      <AddInstructorModal
        opened={addModalOpen}
        values={addFormValues}
        loading={actionLoading}
        onChange={handleAddChange}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
      />

      <EditInstructorModal
        opened={editModalOpen}
        instructor={selectedInstructor}
        values={editFormValues}
        loading={actionLoading}
        onChange={handleEditChange}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      <InstructorDetailModal
        opened={detailModalOpen}
        instructor={selectedInstructor}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <DeleteInstructorModal
        opened={deleteModalOpen}
        instructor={selectedInstructor}
        loading={actionLoading}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
      />
    </div>
  );
}
