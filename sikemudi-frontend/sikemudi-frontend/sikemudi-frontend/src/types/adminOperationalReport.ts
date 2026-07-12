import type {
  AdminOperationalReportRow,
  AdminOperationalReportTab,
  AdminReportFilterValues,
} from "@/features/admin/constants/operationalReports";

export interface AdminOperationalReportSummaryStats {
  grossRevenue: number;
  activeBookings: number;
  finishedSessions: number;
  graduationRate: number;
  refundAmount: number;
  netRevenue: number;
}

export interface AdminOperationalReportApiData {
  rows: AdminOperationalReportRow[];
  stats: AdminOperationalReportSummaryStats;
  generated_at: string;
  filters?: Record<string, string>;
}

export interface AdminOperationalReportFilterOptionsData {
  instructors: Array<{ label: string; value: string }>;
  packages: Array<{ label: string; value: string }>;
}

export type AdminOperationalReportQuery = AdminReportFilterValues;

export interface AdminOperationalReportRequest {
  tab: AdminOperationalReportTab;
  filters: AdminOperationalReportQuery;
}
