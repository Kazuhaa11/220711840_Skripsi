import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import Button from "@/components/ui/Button";
import AdminOperationalReportsFilters from "@/features/admin/components/operational-reports/AdminOperationalReportsFilters";
import AdminOperationalReportsHeader from "@/features/admin/components/operational-reports/AdminOperationalReportsHeader";
import AdminOperationalReportsTable from "@/features/admin/components/operational-reports/AdminOperationalReportsTable";
import AdminOperationalReportsTabs from "@/features/admin/components/operational-reports/AdminOperationalReportsTabs";
import type {
  AdminOperationalReportColumn,
  AdminOperationalReportRow,
  AdminOperationalReportTab,
  AdminReportFilterValues,
} from "@/features/admin/constants/operationalReports";
import {
  createDefaultAdminReportFilterValues,
  operationalReportDefinitions,
  reportInstructorOptions,
  reportPackageOptions,
} from "@/features/admin/constants/operationalReports";
import {
  getAdminOperationalReport,
  getAdminOperationalReportFilterOptions,
} from "@/services/adminOperationalReport.service";
import type {
  AdminOperationalReportFilterOptionsData,
} from "@/types/adminOperationalReport";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function formatCellForExcel(
  row: AdminOperationalReportRow,
  column: AdminOperationalReportColumn,
) {
  const value = row[column.key] ?? "";

  if (column.isCurrency && typeof value === "number") {
    return value;
  }

  return value;
}

function downloadExcelFile(
  title: string,
  columns: AdminOperationalReportColumn[],
  rows: AdminOperationalReportRow[],
) {
  const headerCells = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(formatCellForExcel(row, column))}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <caption>${escapeHtml(title)}</caption>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.xls`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminOperationalReportsView() {
  const [activeTab, setActiveTab] =
    useState<AdminOperationalReportTab>("revenue");
  const [filterValues, setFilterValues] = useState<AdminReportFilterValues>(
    createDefaultAdminReportFilterValues,
  );
  const [appliedFilters, setAppliedFilters] = useState<AdminReportFilterValues>(
    createDefaultAdminReportFilterValues,
  );
  const [rows, setRows] = useState<AdminOperationalReportRow[]>([]);
  const [filterOptions, setFilterOptions] =
    useState<AdminOperationalReportFilterOptionsData>({
      instructors: reportInstructorOptions,
      packages: reportPackageOptions,
    });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const activeReport = useMemo(
    () =>
      operationalReportDefinitions.find((report) => report.id === activeTab) ??
      operationalReportDefinitions[0],
    [activeTab],
  );

  useEffect(() => {
    let isMounted = true;

    getAdminOperationalReportFilterOptions()
      .then((options) => {
        if (!isMounted) {
          return;
        }

        setFilterOptions(options);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setFilterOptions({
          instructors: reportInstructorOptions,
          packages: reportPackageOptions,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage("");

    getAdminOperationalReport(activeTab, appliedFilters)
      .then((reportData) => {
        if (!isMounted) {
          return;
        }

        setRows(reportData.rows);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error
          ? error.message
          : "Laporan operasional gagal dimuat.";

        setRows([]);
        setErrorMessage(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, appliedFilters]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleFilterChange(
    field: keyof AdminReportFilterValues,
    value: string,
  ) {
    setSuccessMessage("");
    setFilterValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleResetFilter() {
    const defaultFilters = createDefaultAdminReportFilterValues();

    setFilterValues(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSuccessMessage("Filter laporan berhasil direset.");
  }

  function handleApplyFilter() {
    setAppliedFilters(filterValues);
    setSuccessMessage("Filter laporan berhasil diterapkan.");
  }

  function handleRetry() {
    setAppliedFilters((current) => ({ ...current }));
  }

  function handleDownloadReport() {
    downloadExcelFile(activeReport.label, activeReport.columns, rows);
    setSuccessMessage(`File Excel ${activeReport.label} berhasil diunduh.`);
  }

  return (
    <div className="mx-auto w-full max-w-295">
      {successMessage ? (
        <div className="mb-6">
          <SuccesBanner message={successMessage} />
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-6">
          <ErrorMessage
            message={errorMessage}
            action={
              <Button
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                onClick={handleRetry}
              >
                Coba Lagi
              </Button>
            }
          />
        </div>
      ) : null}

      <AdminOperationalReportsHeader onDownload={handleDownloadReport} />

      <div className="mt-5 space-y-6">
        <AdminOperationalReportsFilters
          values={filterValues}
          instructorOptions={filterOptions.instructors}
          packageOptions={filterOptions.packages}
          isLoading={isLoading}
          onChange={handleFilterChange}
          onReset={handleResetFilter}
          onApply={handleApplyFilter}
        />

        <div>
          <AdminOperationalReportsTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="mt-4">
            {isLoading ? (
              <LoadingSpinner label="Memuat laporan operasional..." />
            ) : (
              <AdminOperationalReportsTable
                report={activeReport}
                rows={rows}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
