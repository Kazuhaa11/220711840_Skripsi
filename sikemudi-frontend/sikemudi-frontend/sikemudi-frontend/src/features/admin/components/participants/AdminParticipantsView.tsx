import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectOption } from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import AddParticipantModal from "@/features/admin/components/participants/AddParticipantModal";
import AdminParticipantsFilters from "@/features/admin/components/participants/AdminParticipantsFilters";
import AdminParticipantsHeader from "@/features/admin/components/participants/AdminParticipantsHeader";
import AdminParticipantsTable from "@/features/admin/components/participants/AdminParticipantsTable";
import DeleteParticipantModal from "@/features/admin/components/participants/DeleteParticipantModal";
import EditParticipantModal from "@/features/admin/components/participants/EditParticipantModal";
import ParticipantDetailModal from "@/features/admin/components/participants/ParticipantDetailModal";
import type {
  AdminParticipant,
  AdminParticipantCertificateStatus,
  AdminParticipantFormValues,
  AdminParticipantStatus,
} from "@/features/admin/constants/participants";
import {
  adminParticipantMessages,
  emptyParticipantFormValues,
} from "@/features/admin/constants/participants";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminCoursePackageApiItem,
  AdminParticipantApiItem,
  AdminParticipantPayload,
} from "@/services/adminMasterData.service";
import {
  activateAdminParticipant,
  createAdminParticipant,
  deleteAdminParticipant,
  getAdminCoursePackages,
  getAdminParticipants,
  updateAdminParticipant,
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

function getAvatarTone(index: number): AdminParticipant["avatarTone"] {
  const tones: AdminParticipant["avatarTone"][] = ["blue", "purple", "green", "slate"];
  return tones[index % tones.length];
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function mapParticipantApiToAdmin(
  item: AdminParticipantApiItem,
  index: number,
): AdminParticipant {
  const name = item.nama_peserta ?? item.user?.name ?? "Peserta Tanpa Nama";
  const activePackageName = item.paket_aktif?.nama_paket ?? "Belum memilih paket";
  const packageCode = item.paket_aktif?.kode_paket ?? "-";
  const completedSessions = Number(item.jumlah_sesi_selesai ?? 0);
  const totalSessions = Number(item.jumlah_sesi_total ?? item.paket_aktif?.durasi_jam ?? 0);

  return {
    apiId: item.id,
    id: item.kode_peserta ?? `PST-${item.id}`,
    fullName: name,
    email: item.email ?? item.user?.email ?? "-",
    phone: item.no_telepon ?? item.user?.no_telepon ?? "-",
    address: item.alamat ?? item.user?.alamat ?? null,
    birthDate: item.tanggal_lahir,
    gender: item.gender ?? "",
    activePackage: activePackageName,
    activePackageId: item.paket_aktif?.id ?? null,
    packageCode,
    accountStatus: (item.status_akun ?? item.user?.status_akun ?? "Aktif") as AdminParticipantStatus,
    certificateStatus: (item.status_sertifikat ?? "Belum Ada") as AdminParticipantCertificateStatus,
    joinedAt: item.tanggal_bergabung ?? "-",
    initials: getInitials(name),
    avatarTone: getAvatarTone(index),
    completedSessions,
    totalSessions,
    rating: Number(item.rating_rata_rata ?? 0),
    absenceCount: Number(item.jumlah_absen ?? 0),
    remainingSessions: Math.max(totalSessions - completedSessions, 0),
    lastSessionTitle: "Data sesi terakhir tersedia di riwayat booking.",
    lastSessionDate: "-",
    lastInstructor: "-",
  };
}

function formValuesFromParticipant(participant: AdminParticipant): AdminParticipantFormValues {
  return {
    fullName: participant.fullName,
    email: participant.email === "-" ? "" : participant.email,
    phone: participant.phone === "-" ? "" : participant.phone,
    address: participant.address ?? "",
    birthDate: toDateInput(participant.birthDate),
    gender: participant.gender ?? "",
    password: "",
    passwordConfirmation: "",
    activePackage: participant.activePackageId ? String(participant.activePackageId) : "",
    accountStatus: participant.accountStatus,
    certificateStatus: participant.certificateStatus,
  };
}

function buildParticipantPayload(
  values: AdminParticipantFormValues,
  selectedParticipant?: AdminParticipant | null,
): AdminParticipantPayload {
  const payload: AdminParticipantPayload = {
    name: values.fullName.trim(),
    email: values.email.trim(),
    no_telepon: values.phone.trim(),
    alamat: values.address.trim() || null,
    status_akun: values.accountStatus,
    paket_aktif_id: values.activePackage ? Number(values.activePackage) : null,
    tanggal_lahir: values.birthDate || null,
    gender: values.gender ? (values.gender as "Laki-laki" | "Perempuan") : null,
    status_sertifikat: values.certificateStatus,
    jumlah_sesi_selesai: selectedParticipant?.completedSessions ?? 0,
    jumlah_sesi_total: selectedParticipant?.totalSessions ?? 0,
    jumlah_absen: selectedParticipant?.absenceCount ?? 0,
    rating_rata_rata: selectedParticipant?.rating ?? 0,
  };

  const password = values.password.trim();
  const passwordConfirmation = values.passwordConfirmation.trim();

  if (password) {
    payload.password = password;
    payload.password_confirmation = passwordConfirmation;
  }

  return payload;
}

function packageOptionsFromApi(items: AdminCoursePackageApiItem[]): SelectOption[] {
  return [
    { label: "Tanpa Paket Aktif", value: "" },
    ...items.map((item) => ({
      label: `${item.nama_paket} (${item.durasi_jam} Jam)`,
      value: String(item.id),
    })),
  ];
}

function packageFilterOptionsFromApi(items: AdminCoursePackageApiItem[]): SelectOption[] {
  return [
    { label: "Semua Paket", value: "all" },
    ...items.map((item) => ({
      label: `${item.nama_paket} (${item.durasi_jam} Jam)`,
      value: String(item.id),
    })),
  ];
}

export default function AdminParticipantsView() {
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [coursePackages, setCoursePackages] = useState<AdminCoursePackageApiItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [packageValue, setPackageValue] = useState("all");
  const { showNotification } = useFloatingNotification();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormValues, setAddFormValues] =
    useState<AdminParticipantFormValues>(emptyParticipantFormValues);

  const [selectedParticipant, setSelectedParticipant] =
    useState<AdminParticipant | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusActionModalOpen, setStatusActionModalOpen] = useState(false);

  const [editFormValues, setEditFormValues] =
    useState<AdminParticipantFormValues>(emptyParticipantFormValues);

  const packageOptions = useMemo(() => packageOptionsFromApi(coursePackages), [coursePackages]);
  const packageFilterOptions = useMemo(
    () => packageFilterOptionsFromApi(coursePackages),
    [coursePackages],
  );

  const fetchPackages = useCallback(async () => {
    try {
      const response = await getAdminCoursePackages({ per_page: 100 });
      setCoursePackages(response.items);
    } catch {
      setCoursePackages([]);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminParticipants({
        q: searchValue.trim() || undefined,
        status_akun: statusValue === "all" ? undefined : statusValue,
        paket_id: packageValue === "all" ? undefined : packageValue,
        page,
        per_page: 10,
      });

      setParticipants(response.items.map(mapParticipantApiToAdmin));
      setPagination(response.pagination);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Data peserta gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [packageValue, page, searchValue, statusValue]);

  useEffect(() => {
    void fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    void fetchParticipants();
  }, [fetchParticipants]);

  function showSuccess(message: string) {
    showNotification({
      type: "success",
      title: "Berhasil",
      message,
      duration: 3000,
    });
  }

  function showError(message: string) {
    showNotification({
      type: "error",
      title: "Gagal",
      message,
      duration: 3500,
    });
  }

  function resetMessages() {
    // Floating notification tidak membutuhkan reset state banner.
  }

  function handleAddChange(field: keyof AdminParticipantFormValues, value: string) {
    resetMessages();
    setAddFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleEditChange(field: keyof AdminParticipantFormValues, value: string) {
    resetMessages();
    setEditFormValues((current) => ({ ...current, [field]: value }));
  }

  function handleOpenAddModal() {
    resetMessages();
    setAddFormValues(emptyParticipantFormValues);
    setAddModalOpen(true);
  }

  async function handleSubmitAdd() {
    if (!addFormValues.fullName.trim() || !addFormValues.email.trim()) {
      showError("Nama lengkap dan email peserta wajib diisi.");
      return;
    }

    if (!addFormValues.phone.trim()) {
      showError("Nomor telepon peserta wajib diisi.");
      return;
    }

    if (!addFormValues.password.trim() || addFormValues.password.length < 8) {
      showError("Password peserta wajib diisi minimal 8 karakter.");
      return;
    }

    if (addFormValues.password !== addFormValues.passwordConfirmation) {
      showError("Konfirmasi password peserta tidak sesuai.");
      return;
    }

    try {
      setActionLoading(true);
      await createAdminParticipant(buildParticipantPayload(addFormValues));
      setAddModalOpen(false);
      showSuccess(adminParticipantMessages.addSuccess);
      setPage(1);
      await fetchParticipants();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Data peserta gagal ditambahkan.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenDetail(participant: AdminParticipant) {
    resetMessages();
    setSelectedParticipant(participant);
    setDetailModalOpen(true);
  }

  function handleOpenEdit(participant: AdminParticipant) {
    resetMessages();
    setSelectedParticipant(participant);
    setEditFormValues(formValuesFromParticipant(participant));
    setEditModalOpen(true);
  }

  async function handleSubmitEdit() {
    if (!selectedParticipant) return;

    if (!editFormValues.fullName.trim() || !editFormValues.email.trim()) {
      showError("Nama lengkap dan email peserta wajib diisi.");
      return;
    }

    if (!editFormValues.phone.trim()) {
      showError("Nomor telepon peserta wajib diisi.");
      return;
    }

    const editPassword = editFormValues.password.trim();
    const editPasswordConfirmation = editFormValues.passwordConfirmation.trim();

    if (editPassword || editPasswordConfirmation) {
      if (!editPassword || editPassword.length < 8) {
        showError("Password baru wajib diisi minimal 8 karakter jika ingin diubah.");
        return;
      }

      if (editPassword !== editPasswordConfirmation) {
        showError("Konfirmasi password baru tidak sesuai.");
        return;
      }
    }

    try {
      setActionLoading(true);
      await updateAdminParticipant(
        selectedParticipant.apiId ?? selectedParticipant.id,
        buildParticipantPayload(editFormValues, selectedParticipant),
      );
      setEditModalOpen(false);
      setDetailModalOpen(false);
      showSuccess(adminParticipantMessages.editSuccess);
      await fetchParticipants();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Data peserta gagal diperbarui.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenStatusAction(participant: AdminParticipant) {
    resetMessages();
    setSelectedParticipant(participant);
    setStatusActionModalOpen(true);
  }

  async function handleConfirmStatusAction() {
    if (!selectedParticipant) return;

    const isInactive = selectedParticipant.accountStatus === "Nonaktif";

    try {
      setActionLoading(true);

      if (isInactive) {
        await activateAdminParticipant(selectedParticipant.apiId ?? selectedParticipant.id);
        showSuccess("Peserta berhasil diaktifkan kembali.");
      } else {
        await deleteAdminParticipant(selectedParticipant.apiId ?? selectedParticipant.id);
        showSuccess("Peserta berhasil dinonaktifkan. Riwayat booking, pembayaran, hasil latihan, dan sertifikat tetap tersimpan.");
      }

      setStatusActionModalOpen(false);
      setDetailModalOpen(false);
      await fetchParticipants();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : isInactive
            ? "Data peserta gagal diaktifkan kembali."
            : "Data peserta gagal dinonaktifkan.",
      );
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

  function handlePackageChange(value: string) {
    setPackageValue(value);
    setPage(1);
  }

  function handleResetFilter() {
    setSearchValue("");
    setStatusValue("all");
    setPackageValue("all");
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      <AdminParticipantsHeader onAdd={handleOpenAddModal} />

      <div className="mt-5">
        <AdminParticipantsFilters
          searchValue={searchValue}
          statusValue={statusValue}
          packageValue={packageValue}
          packageOptions={packageFilterOptions}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPackageChange={handlePackageChange}
          onReset={handleResetFilter}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <Card className="rounded-3xl p-8 shadow-sm">
            <LoadingSpinner label="Memuat data peserta..." />
          </Card>
        ) : (
          <AdminParticipantsTable
            participants={participants}
            pagination={pagination}
            onPageChange={setPage}
            onDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onStatusAction={handleOpenStatusAction}
          />
        )}
      </div>

      <AddParticipantModal
        opened={addModalOpen}
        values={addFormValues}
        packageOptions={packageOptions}
        loading={actionLoading}
        onChange={handleAddChange}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
      />

      <EditParticipantModal
        opened={editModalOpen}
        participant={selectedParticipant}
        values={editFormValues}
        packageOptions={packageOptions}
        loading={actionLoading}
        onChange={handleEditChange}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      <ParticipantDetailModal
        opened={detailModalOpen}
        participant={selectedParticipant}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <DeleteParticipantModal
        opened={statusActionModalOpen}
        participant={selectedParticipant}
        loading={actionLoading}
        onClose={() => setStatusActionModalOpen(false)}
        onConfirm={handleConfirmStatusAction}
      />
    </div>
  );
}
