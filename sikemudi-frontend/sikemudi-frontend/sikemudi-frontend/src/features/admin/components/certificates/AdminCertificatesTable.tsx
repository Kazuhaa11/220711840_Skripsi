import { Ban, Download, FileSignature, FileText, QrCode } from "lucide-react";
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
import type {
  AdminCertificateStatus,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import { adminCertificateMessages } from "@/features/admin/constants/certificates";

interface AdminCertificatesTableProps {
  certificates: AdminDigitalCertificate[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onIssue: (certificate: AdminDigitalCertificate) => void;
  onGeneratePdf?: (certificate: AdminDigitalCertificate) => void;
  onDownloadPdf?: (certificate: AdminDigitalCertificate) => void;
  onRevoke?: (certificate: AdminDigitalCertificate) => void;
}

const statusClass: Record<AdminCertificateStatus, string> = {
  "Menunggu Penerbitan": "bg-blue-100 text-blue-700",
  Draft: "bg-slate-100 text-slate-700",
  Terbit: "bg-emerald-100 text-emerald-700",
  Dicabut: "bg-red-100 text-red-700",
};

export default function AdminCertificatesTable({
  certificates,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  onIssue,
  onGeneratePdf,
  onDownloadPdf,
  onRevoke,
}: AdminCertificatesTableProps) {
  if (certificates.length === 0) {
    return (
      <EmptyState
        title={adminCertificateMessages.emptyTitle}
        description={adminCertificateMessages.emptyDescription}
      />
    );
  }

  return (
    <TableWrapper className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
      <Table>
        <TableHead className="bg-slate-100">
          <TableRow>
            <TableHeaderCell>Nomor Sertifikat</TableHeaderCell>
            <TableHeaderCell>Nama Peserta</TableHeaderCell>
            <TableHeaderCell>Paket/Kursus</TableHeaderCell>
            <TableHeaderCell>Tanggal Lulus</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Verifikasi</TableHeaderCell>
            <TableHeaderCell>PDF</TableHeaderCell>
            <TableHeaderCell className="min-w-50 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {certificates.map((certificate) => (
            <TableRow key={certificate.id} className="border-slate-100">
              <TableCell className="px-5 py-4">
                <span className="rounded-lg bg-blue-100 px-2 py-1 text-sm font-bold text-blue-950">
                  {certificate.certificateNumber || "Belum Terbit"}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4">
                <p className="font-bold text-slate-950">
                  {certificate.participantName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {certificate.participantId}
                </p>
              </TableCell>

              <TableCell className="px-5 py-4">
                <p className="max-w-44 leading-6 text-slate-700">
                  {certificate.packageName}
                </p>
              </TableCell>

              <TableCell className="px-5 py-4 text-slate-700">
                {certificate.graduationDate}
              </TableCell>

              <TableCell className="px-5 py-4">
                <Badge
                  className={`font-bold uppercase ${statusClass[certificate.status]}`}
                >
                  {certificate.status}
                </Badge>
              </TableCell>

              <TableCell className="px-5 py-4">
                <Badge
                  className={
                    certificate.verificationStatus === "Terverifikasi"
                      ? "bg-blue-100 font-bold text-blue-700"
                      : certificate.verificationStatus === "Dicabut"
                        ? "bg-red-100 font-bold text-red-700"
                        : "bg-slate-100 font-bold text-slate-600"
                  }
                >
                  {certificate.verificationStatus}
                </Badge>
              </TableCell>

              <TableCell className="px-5 py-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    certificate.status === "Dicabut"
                      ? "bg-red-100 text-red-700"
                      : certificate.hasPdf
                        ? "bg-emerald-100 text-emerald-700"
                        : certificate.status === "Terbit"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-50 text-slate-300"
                  }`}
                  title={certificate.status === "Dicabut" ? "Sertifikat dicabut" : certificate.hasPdf ? "PDF siap" : "PDF belum dibuat"}
                >
                  {certificate.hasPdf ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <QrCode className="h-5 w-5" />
                  )}
                </div>
              </TableCell>

              <TableCell className="min-w-50 px-5 py-4">
                <div className="grid justify-items-end gap-2 sm:grid-cols-[auto_auto] sm:justify-end">
                  {certificate.status === "Terbit" ? (
                    <>
                      {certificate.hasPdf ? (
                        <Button
                          size="sm"
                          className="h-9 w-full min-w-28 rounded-xl bg-emerald-600 px-4 font-bold hover:bg-emerald-700 sm:w-auto"
                          onClick={() => onDownloadPdf?.(certificate)}
                          disabled={loading}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Unduh
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-9 w-full min-w-28 rounded-xl bg-slate-950 px-4 font-bold hover:bg-slate-800 sm:w-auto"
                          onClick={() => onGeneratePdf?.(certificate)}
                          disabled={loading}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Buat PDF
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 w-full min-w-28 rounded-xl border-red-200 px-4 font-bold text-red-700 hover:bg-red-50 sm:w-auto"
                        onClick={() => onRevoke?.(certificate)}
                        disabled={loading}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cabut
                      </Button>
                    </>
                  ) : certificate.sourceType === "candidate" ? (
                    <Button
                      size="sm"
                      className="h-9 w-full min-w-28 rounded-xl bg-slate-950 px-4 font-bold hover:bg-slate-800 sm:w-auto"
                      onClick={() => onIssue(certificate)}
                      disabled={loading}
                    >
                      <FileSignature className="mr-2 h-4 w-4" />
                      Terbitkan
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TableFooter className="bg-slate-50">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          label={
            <>
              Menampilkan <span className="font-bold">{startItem}-{endItem}</span> dari{" "}
              <span className="font-bold">{totalItems}</span> data sertifikat
            </>
          }
          onPageChange={onPageChange}
        />
      </TableFooter>
    </TableWrapper>
  );
}
