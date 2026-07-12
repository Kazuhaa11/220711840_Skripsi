import { useEffect, useMemo, useState } from "react";
import { Check, UsersRound } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import type {
  AdminInstructorSlotAssignmentApiItem,
  AdminTimeSlotApiItem,
} from "@/services/adminMasterData.service";
import type { InlineInstructorOption } from "@/features/admin/components/time-slots/InstructorSlotAssignmentsView";

interface ManageInstructorSlotAssignmentModalProps {
  opened: boolean;
  onClose: () => void;
  days: string[];
  timeSlots: AdminTimeSlotApiItem[];
  instructorOptions: InlineInstructorOption[];
  assignments: AdminInstructorSlotAssignmentApiItem[];
  submitting?: boolean;
  onSubmit: (payload: {
    dayOfWeek: string;
    timeSlotId: number;
    instructorIds: string[];
  }) => void;
}

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "-";
  return `${start} - ${end}`;
}

function getActiveInstructorIds(
  assignments: AdminInstructorSlotAssignmentApiItem[],
  dayOfWeek: string,
  timeSlotId: number,
) {
  return assignments
    .filter((assignment) => {
      return (
        assignment.day_of_week === dayOfWeek &&
        assignment.time_slot?.id === timeSlotId &&
        assignment.status === "Aktif" &&
        Boolean(assignment.instructor?.id)
      );
    })
    .map((assignment) => String(assignment.instructor?.id))
    .filter(Boolean);
}

function getInstructorInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "I";
}

export default function ManageInstructorSlotAssignmentModal({
  opened,
  onClose,
  days,
  timeSlots,
  instructorOptions,
  assignments,
  submitting = false,
  onSubmit,
}: ManageInstructorSlotAssignmentModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);

  const dayOptions = useMemo(
    () => days.map((day) => ({ label: day, value: day })),
    [days],
  );

  const slotOptions = useMemo(
    () =>
      timeSlots.map((slot) => ({
        label: `${slot.nama_slot} (${formatTimeRange(slot.jam_mulai, slot.jam_selesai)})`,
        value: String(slot.id),
      })),
    [timeSlots],
  );

  const selectedSlot = useMemo(
    () => timeSlots.find((slot) => String(slot.id) === timeSlotId) ?? null,
    [timeSlotId, timeSlots],
  );

  const selectedInstructorSet = useMemo(
    () => new Set(selectedInstructorIds),
    [selectedInstructorIds],
  );

  const selectedInstructorOptions = useMemo(
    () =>
      instructorOptions.filter((option) => selectedInstructorSet.has(option.value)),
    [instructorOptions, selectedInstructorSet],
  );

  useEffect(() => {
    if (!opened) return;

    setDayOfWeek((current) => current || days[0] || "");
    setTimeSlotId((current) => current || (timeSlots[0] ? String(timeSlots[0].id) : ""));
  }, [days, opened, timeSlots]);

  useEffect(() => {
    if (!opened || !dayOfWeek || !timeSlotId) return;

    setSelectedInstructorIds(
      getActiveInstructorIds(assignments, dayOfWeek, Number(timeSlotId)),
    );
  }, [assignments, dayOfWeek, opened, timeSlotId]);

  function toggleInstructor(instructorId: string) {
    setSelectedInstructorIds((current) => {
      if (current.includes(instructorId)) {
        return current.filter((id) => id !== instructorId);
      }

      return [...current, instructorId];
    });
  }

  function handleSubmit() {
    if (!dayOfWeek || !timeSlotId) return;

    onSubmit({
      dayOfWeek,
      timeSlotId: Number(timeSlotId),
      instructorIds: selectedInstructorIds,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={submitting ? () => undefined : onClose}
      title="Atur Assignment Instruktur"
      description="Pilih hari, sesi/slot waktu, lalu tentukan satu atau beberapa instruktur yang tersedia."
      size="xl"
      closeOnOverlayClick={!submitting}
      headerClassName="px-6 py-5 sm:px-7 sm:py-5"
      bodyClassName="max-h-[calc(100dvh-13rem)] px-6 py-5 sm:px-7 sm:py-5"
      footerClassName="px-6 py-4 sm:px-7"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-slate-500">
            {selectedInstructorIds.length > 0
              ? `${selectedInstructorIds.length} instruktur akan ditugaskan.`
              : "Jika kosong, assignment pada hari dan sesi ini akan dikosongkan."}
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Batal
            </Button>

            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!dayOfWeek || !timeSlotId}
            >
              Simpan Assignment
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Select
                label="Hari"
                value={dayOfWeek}
                options={dayOptions}
                placeholder="Pilih hari"
                onChange={(event) => setDayOfWeek(event.target.value)}
                disabled={submitting}
              />

              <Select
                label="Sesi / Slot Waktu"
                value={timeSlotId}
                options={slotOptions}
                placeholder="Pilih sesi"
                onChange={(event) => setTimeSlotId(event.target.value)}
                disabled={submitting}
              />
            </div>

            {selectedSlot ? (
              <div className="mt-4 rounded-2xl bg-white p-3 text-sm text-slate-600 shadow-sm shadow-slate-200/50">
                <p className="font-black text-slate-950">{selectedSlot.nama_slot}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {formatTimeRange(selectedSlot.jam_mulai, selectedSlot.jam_selesai)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <UsersRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-blue-950">
                  Ringkasan Pilihan
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  {dayOfWeek && selectedSlot
                    ? `${dayOfWeek} • ${selectedSlot.nama_slot} • ${selectedInstructorIds.length} instruktur`
                    : "Pilih hari dan sesi terlebih dahulu."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-sm font-black text-slate-950">
                Pilih Instruktur
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Bisa memilih lebih dari satu instruktur.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {selectedInstructorIds.length}/{instructorOptions.length}
            </span>
          </div>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {instructorOptions.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500">
                Belum ada instruktur aktif.
              </p>
            ) : (
              instructorOptions.map((option) => {
                const checked = selectedInstructorSet.has(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleInstructor(option.value)}
                    disabled={submitting}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                      checked
                        ? "border-blue-200 bg-blue-50 text-blue-950"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black",
                        checked
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-slate-50 text-slate-500",
                      )}
                    >
                      {checked ? <Check className="h-4 w-4" /> : getInstructorInitial(option.label)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">
                        {option.label}
                      </span>

                      {option.subtitle ? (
                        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                          {option.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedInstructorOptions.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {selectedInstructorOptions.slice(0, 5).map((option) => (
                <span
                  key={option.value}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800"
                >
                  {option.label}
                </span>
              ))}

              {selectedInstructorOptions.length > 5 ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  +{selectedInstructorOptions.length - 5} lainnya
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
