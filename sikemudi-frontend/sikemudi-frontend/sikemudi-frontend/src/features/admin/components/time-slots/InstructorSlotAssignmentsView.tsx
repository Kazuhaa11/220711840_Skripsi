import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InstructorSlotAssignmentMatrix from "@/features/admin/components/time-slots/InstructorSlotAssignmentMatrix";
import ManageInstructorSlotAssignmentModal from "@/features/admin/components/time-slots/ManageInstructorSlotAssignmentModal";
import type {
  AdminInstructorApiItem,
  AdminInstructorSlotAssignmentApiItem,
  AdminInstructorSlotAssignmentMatrixApiResponse,
  AdminTimeSlotApiItem,
} from "@/services/adminMasterData.service";
import {
  createAdminInstructorSlotAssignment,
  deleteAdminInstructorSlotAssignment,
  getAdminInstructorSlotAssignmentMatrix,
  getAdminInstructorSlotAssignments,
  getAdminInstructors,
  getAdminTimeSlots,
} from "@/services/adminMasterData.service";

export type InlineInstructorOption = {
  label: string;
  value: string;
  subtitle?: string;
};

function mapInstructorOption(instructor: AdminInstructorApiItem): InlineInstructorOption {
  return {
    label:
      instructor.nama_instruktur ||
      instructor.user?.name ||
      `Instruktur #${instructor.id}`,
    value: String(instructor.id),
    subtitle: [instructor.kode_instruktur, instructor.email, instructor.status]
      .filter(Boolean)
      .join(" • "),
  };
}

function getActiveAssignmentsByCell(
  assignments: AdminInstructorSlotAssignmentApiItem[],
  dayOfWeek: string,
  timeSlotId: number,
) {
  return assignments.filter((assignment) => {
    return (
      assignment.day_of_week === dayOfWeek &&
      assignment.time_slot?.id === timeSlotId &&
      assignment.status === "Aktif" &&
      Boolean(assignment.instructor?.id)
    );
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function InstructorSlotAssignmentsView() {
  const { showNotification } = useFloatingNotification();
  const [matrix, setMatrix] =
    useState<AdminInstructorSlotAssignmentMatrixApiResponse | null>(null);
  const [assignments, setAssignments] = useState<
    AdminInstructorSlotAssignmentApiItem[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<AdminTimeSlotApiItem[]>([]);
  const [instructors, setInstructors] = useState<AdminInstructorApiItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [assignmentModalOpened, setAssignmentModalOpened] = useState(false);

  const instructorOptions = useMemo(
    () =>
      instructors
        .filter((item) => item.status === "Aktif")
        .map(mapInstructorOption),
    [instructors],
  );

  const activeDays = useMemo(
    () => matrix?.days ?? ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    [matrix?.days],
  );

  const fetchAssignments = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const [matrixResponse, assignmentResponse, slotResponse, instructorResponse] =
          await Promise.all([
            getAdminInstructorSlotAssignmentMatrix(),
            getAdminInstructorSlotAssignments({ per_page: 100 }),
            getAdminTimeSlots({ per_page: 100, status: "Aktif" }),
            getAdminInstructors({ per_page: 100, status: "Aktif" }),
          ]);

        setMatrix(matrixResponse);
        setAssignments(assignmentResponse.items);
        setTimeSlots(slotResponse.items);
        setInstructors(instructorResponse.items);
      } catch (error) {
        showNotification({
          type: "error",
          title: "Gagal",
          message: getErrorMessage(error, "Data assignment slot instruktur gagal dimuat."),
        });
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  async function handleSaveAssignment(payload: {
    dayOfWeek: string;
    timeSlotId: number;
    instructorIds: string[];
  }) {
    const activeCellAssignments = getActiveAssignmentsByCell(
      assignments,
      payload.dayOfWeek,
      payload.timeSlotId,
    );

    const currentInstructorIds = activeCellAssignments
      .map((assignment) => assignment.instructor?.id)
      .filter((id): id is number => typeof id === "number");

    const currentSet = new Set(currentInstructorIds);
    const nextIds = payload.instructorIds.map(Number).filter(Number.isFinite);
    const nextSet = new Set(nextIds);

    const idsToAdd = nextIds.filter((id) => !currentSet.has(id));
    const assignmentsToDelete = activeCellAssignments.filter((assignment) => {
      const instructorId = assignment.instructor?.id;
      return typeof instructorId === "number" && !nextSet.has(instructorId);
    });

    if (idsToAdd.length === 0 && assignmentsToDelete.length === 0) {
      setAssignmentModalOpened(false);
      showNotification({
        type: "info",
        title: "Tidak Ada Perubahan",
        message: "Assignment instruktur sudah sesuai pilihan.",
        duration: 2500,
      });
      return;
    }

    try {
      setSavingAssignment(true);

      if (idsToAdd.length > 0) {
        await createAdminInstructorSlotAssignment({
          day_of_week: payload.dayOfWeek,
          time_slot_id: payload.timeSlotId,
          instructor_ids: idsToAdd,
          status: "Aktif",
          catatan: null,
        });
      }

      if (assignmentsToDelete.length > 0) {
        await Promise.all(
          assignmentsToDelete.map((assignment) =>
            deleteAdminInstructorSlotAssignment(assignment.id),
          ),
        );
      }

      showNotification({
        type: "success",
        title: "Berhasil",
        message: "Assignment instruktur berhasil diperbarui.",
        duration: 2500,
      });

      setAssignmentModalOpened(false);
      await fetchAssignments({ silent: true });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Gagal",
        message: getErrorMessage(error, "Assignment instruktur gagal diperbarui."),
      });
    } finally {
      setSavingAssignment(false);
    }
  }

  const cannotManageAssignment =
    loading || savingAssignment || timeSlots.length === 0 || instructorOptions.length === 0;

  return (
    <div className="space-y-5">
      <Card className="rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-black text-slate-950">
              Assignment Instruktur
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Tentukan instruktur yang tersedia berdasarkan hari dan sesi. Klik
              Atur Assignment untuk memilih hari, slot waktu, dan satu atau lebih
              instruktur dalam satu modal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setAssignmentModalOpened(true)}
              disabled={cannotManageAssignment}
            >
              Atur Assignment
            </Button>

            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void fetchAssignments()}
              disabled={loading || savingAssignment}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner label="Memuat assignment instruktur..." />
      ) : (
        <InstructorSlotAssignmentMatrix matrix={matrix} />
      )}

      <p className="text-xs text-slate-500">
        Matrix hanya menampilkan ringkasan. Perubahan assignment dilakukan dari tombol
        Atur Assignment agar tabel tetap compact walaupun instruktur yang dipilih banyak.
      </p>

      <ManageInstructorSlotAssignmentModal
        opened={assignmentModalOpened}
        onClose={() => setAssignmentModalOpened(false)}
        days={activeDays}
        timeSlots={timeSlots}
        instructorOptions={instructorOptions}
        assignments={assignments}
        submitting={savingAssignment}
        onSubmit={handleSaveAssignment}
      />
    </div>
  );
}
