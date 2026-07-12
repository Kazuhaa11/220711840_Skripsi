import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type {
  AdminInstructorSlotAssignmentMatrixApiResponse,
  AdminInstructorSlotAssignmentMatrixSlotApiItem,
} from "@/services/adminMasterData.service";

interface InstructorSlotAssignmentMatrixProps {
  matrix: AdminInstructorSlotAssignmentMatrixApiResponse | null;
}

function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return "-";
  return `${start} - ${end}`;
}

function getInstructorInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "I";
}

function getSlotCell(
  rowSlots: AdminInstructorSlotAssignmentMatrixSlotApiItem[],
  slotId: number,
) {
  return rowSlots.find((item) => item.time_slot.id === slotId) ?? null;
}

export default function InstructorSlotAssignmentMatrix({
  matrix,
}: InstructorSlotAssignmentMatrixProps) {
  if (!matrix || matrix.time_slots.length === 0) {
    return (
      <EmptyState
        title="Matriks assignment belum tersedia"
        description="Tambahkan slot waktu aktif dan data instruktur aktif terlebih dahulu untuk mengatur assignment mingguan."
      />
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-black text-slate-950">
            Matriks Assignment Mingguan
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Ringkasan instruktur yang tersedia untuk setiap kombinasi hari dan sesi.
            Gunakan tombol Atur Assignment di atas untuk mengubah data.
          </p>
        </div>

        <Badge className="w-fit bg-blue-50 px-3 py-1.5 text-blue-700">
          {matrix.time_slots.length} slot aktif
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-[120px] border border-slate-200 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                Hari
              </th>

              {matrix.time_slots.map((slot) => (
                <th
                  key={slot.id}
                  className="min-w-[190px] border border-slate-200 px-4 py-3 text-left align-top"
                >
                  <p className="text-sm font-black text-slate-950">
                    {slot.nama_slot}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatTimeRange(slot.jam_mulai, slot.jam_selesai)}
                  </p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {matrix.items.map((row) => (
              <tr key={row.day_of_week} className="bg-white">
                <td className="border border-slate-200 px-4 py-3 align-top font-black text-slate-950">
                  {row.day_of_week}
                </td>

                {matrix.time_slots.map((slot) => {
                  const cell = getSlotCell(row.slots, slot.id);
                  const instructors = cell?.instructors ?? [];
                  const visibleInstructors = instructors.slice(0, 2);
                  const hiddenCount = Math.max(0, instructors.length - visibleInstructors.length);

                  return (
                    <td
                      key={`${row.day_of_week}-${slot.id}`}
                      className="border border-slate-200 px-3 py-3 align-top"
                    >
                      {instructors.length > 0 ? (
                        <div className="space-y-2">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                            {instructors.length} instruktur
                          </span>

                          <div className="space-y-1">
                            {visibleInstructors.map((instructor) => {
                              const label =
                                instructor.nama_instruktur ||
                                instructor.email ||
                                `Instruktur #${instructor.id}`;

                              return (
                                <div
                                  key={instructor.id}
                                  className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5"
                                  title={label}
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-black text-white">
                                    {getInstructorInitial(label)}
                                  </span>

                                  <span className="min-w-0 truncate text-xs font-bold text-slate-700">
                                    {label}
                                  </span>
                                </div>
                              );
                            })}

                            {hiddenCount > 0 ? (
                              <p className="rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                                +{hiddenCount} instruktur lainnya
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400">
                          Belum diatur
                        </p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
