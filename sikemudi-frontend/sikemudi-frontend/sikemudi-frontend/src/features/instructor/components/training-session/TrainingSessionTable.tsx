import { CheckCircle2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type {
  InstructorSlotAssignmentMatrixRowApi,
  InstructorTimeSlotApi,
} from "@/types/instructor";
import { trainingSessionEmptyMessage } from "@/features/instructor/constants/trainingSession";

interface TrainingSessionTableProps {
  items: InstructorSlotAssignmentMatrixRowApi[];
  timeSlots: InstructorTimeSlotApi[];
}

function hasAnyAssignment(items: InstructorSlotAssignmentMatrixRowApi[]) {
  return items.some((row) => row.slots.some((slot) => slot.is_assigned));
}

function getSlotName(slot: InstructorTimeSlotApi) {
  return slot.nama_slot ?? slot.kode_slot ?? `Slot #${slot.id}`;
}

export default function TrainingSessionTable({
  items,
  timeSlots,
}: TrainingSessionTableProps) {
  if (timeSlots.length === 0 || items.length === 0 || !hasAnyAssignment(items)) {
    return (
      <EmptyState
        title={trainingSessionEmptyMessage.title}
        description={trainingSessionEmptyMessage.description}
      />
    );
  }

  return (
    <TableWrapper className="rounded-2xl border border-slate-200 shadow-sm">
      <Table className="w-full table-fixed text-sm">
        <TableHead className="bg-slate-50">
          <TableRow>
            <TableHeaderCell className="w-24 px-3 py-3 text-[11px] tracking-[0.14em] text-slate-600 sm:w-28">
              Hari
            </TableHeaderCell>

            {timeSlots.map((slot) => (
              <TableHeaderCell
                key={slot.id}
                className="px-2 py-3 text-center text-[11px] tracking-[0.12em] text-slate-700"
              >
                {getSlotName(slot)}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((row) => (
            <TableRow key={row.day_of_week} className="border-slate-100">
              <TableCell className="px-3 py-3 align-middle text-sm font-black text-slate-950">
                {row.day_of_week}
              </TableCell>

              {timeSlots.map((slot) => {
                const cell = row.slots.find((item) => item.time_slot.id === slot.id);
                const isAssigned = Boolean(cell?.is_assigned);

                return (
                  <TableCell
                    key={`${row.day_of_week}-${slot.id}`}
                    className="px-2 py-2 align-middle text-center"
                  >
                    {isAssigned ? (
                      <div className="mx-auto flex w-fit items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Ditugaskan</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-300">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
