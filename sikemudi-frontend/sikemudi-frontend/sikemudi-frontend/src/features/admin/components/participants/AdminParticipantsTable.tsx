import { Eye, Pencil, UserCheck, UserX } from "lucide-react";
import PaginationBar from "@/components/common/PaginationBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminParticipant,
  AdminParticipantCertificateStatus,
  AdminParticipantStatus,
} from "@/features/admin/constants/participants";
import { adminParticipantMessages } from "@/features/admin/constants/participants";

interface AdminParticipantsTableProps {
  participants: AdminParticipant[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onDetail: (participant: AdminParticipant) => void;
  onEdit: (participant: AdminParticipant) => void;
  onStatusAction: (participant: AdminParticipant) => void;
}

const avatarToneClass: Record<AdminParticipant["avatarTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

const accountStatusClass: Record<AdminParticipantStatus, string> = {
  Aktif: "bg-emerald-100 text-emerald-700",
  Verifikasi: "bg-amber-100 text-amber-700",
  Nonaktif: "bg-slate-100 text-slate-600",
};

const certificateStatusClass: Record<AdminParticipantCertificateStatus, string> = {
  Terbit: "bg-emerald-100 text-emerald-700",
  "Dalam Proses": "bg-blue-100 text-blue-700",
  "Belum Ada": "bg-slate-100 text-slate-500",
};

function AccountStatusBadge({ status }: { status: AdminParticipantStatus }) {
  return (
    <Badge className={cn("gap-1.5 px-2.5 py-1 text-[11px] font-bold", accountStatusClass[status])}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "Aktif" && "bg-emerald-500",
          status === "Verifikasi" && "bg-amber-500",
          status === "Nonaktif" && "bg-slate-500",
        )}
      />
      {status}
    </Badge>
  );
}

function CertificateStatusBadge({
  status,
}: {
  status: AdminParticipantCertificateStatus;
}) {
  return (
    <Badge
      className={cn(
        "px-2.5 py-1 text-[10px] font-bold uppercase",
        certificateStatusClass[status],
      )}
    >
      {status}
    </Badge>
  );
}

function getPaginationLabel(participants: AdminParticipant[], pagination?: PaginationMeta | null) {
  if (!pagination) {
    return (
      <>
        Menampilkan <span className="font-bold">{participants.length}</span> peserta
      </>
    );
  }

  const start = pagination.total === 0 ? 0 : (pagination.current_page - 1) * pagination.per_page + 1;
  const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return (
    <>
      Menampilkan <span className="font-bold">{start} - {end}</span> dari{" "}
      <span className="font-bold">{pagination.total}</span> peserta
    </>
  );
}

export default function AdminParticipantsTable({
  participants,
  pagination,
  onPageChange,
  onDetail,
  onEdit,
  onStatusAction,
}: AdminParticipantsTableProps) {
  if (participants.length === 0) {
    return (
      <EmptyState
        title={adminParticipantMessages.emptyTitle}
        description={adminParticipantMessages.emptyDescription}
      />
    );
  }

  const currentPage = pagination?.current_page ?? 1;
  const totalPages = Math.max(1, pagination?.last_page ?? 1);

  return (
    <TableWrapper className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
      <Table>
        <TableHead className="bg-slate-100">
          <TableRow>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">ID & Peserta</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">Kontak</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">Paket Aktif</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">Status Akun</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">Sertifikat</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-[10px] text-slate-500">Bergabung</TableHeaderCell>
            <TableHeaderCell className="w-36 px-4 py-3 text-right text-[10px] text-slate-500">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id} className="border-slate-100">
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                      avatarToneClass[participant.avatarTone],
                    )}
                  >
                    {participant.initials}
                  </div>

                  <div>
                    <p className="text-sm font-bold leading-5 text-slate-950">
                      {participant.fullName}
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                      {participant.id}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-4 py-3">
                <p className="text-sm font-medium text-slate-700">{participant.email}</p>
                <p className="mt-0.5 text-xs text-slate-400">{participant.phone}</p>
              </TableCell>

              <TableCell className="px-4 py-3">
                <div className="inline-flex max-w-44 items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-blue-800">
                  <span className="text-[10px] font-bold uppercase leading-4">
                    {participant.activePackage}
                    {participant.packageCode ? <><br />({participant.packageCode})</> : null}
                  </span>
                </div>
              </TableCell>

              <TableCell className="px-4 py-3">
                <AccountStatusBadge status={participant.accountStatus} />
              </TableCell>

              <TableCell className="px-4 py-3">
                <CertificateStatusBadge status={participant.certificateStatus} />
              </TableCell>

              <TableCell className="px-4 py-3">
                <p className="max-w-20 text-xs font-medium leading-5 text-slate-700">
                  {participant.joinedAt}
                </p>
              </TableCell>

              <TableCell className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-xl p-0"
                    aria-label={`Lihat detail ${participant.fullName}`}
                    onClick={() => onDetail(participant)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-xl p-0"
                    aria-label={`Ubah ${participant.fullName}`}
                    onClick={() => onEdit(participant)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  {participant.accountStatus === "Nonaktif" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-xl border-emerald-200 p-0 text-emerald-700 hover:bg-emerald-50"
                      aria-label={`Aktifkan kembali ${participant.fullName}`}
                      title="Aktifkan kembali"
                      onClick={() => onStatusAction(participant)}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      className="h-8 w-8 rounded-xl p-0"
                      aria-label={`Nonaktifkan ${participant.fullName}`}
                      title="Nonaktifkan"
                      onClick={() => onStatusAction(participant)}
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TableFooter className="bg-slate-50 px-4 py-3">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          label={getPaginationLabel(participants, pagination)}
          onPageChange={onPageChange ?? (() => undefined)}
          className={totalPages <= 1 ? "hidden" : undefined}
        />
      </TableFooter>
    </TableWrapper>
  );
}
