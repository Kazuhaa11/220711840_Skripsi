import { apiRequest } from "@/services/api";
import { ADMIN_ENDPOINTS } from "@/services/endpoints";
import type { ApiQueryParams } from "@/types/api";
import type {
  AdminOperationalReportApiData,
  AdminOperationalReportFilterOptionsData,
  AdminOperationalReportQuery,
} from "@/types/adminOperationalReport";
import type { AdminOperationalReportTab } from "@/features/admin/constants/operationalReports";

const reportEndpointMap: Record<AdminOperationalReportTab, string> = {
  revenue: ADMIN_ENDPOINTS.operationalReportRevenue,
  bookingPackages: ADMIN_ENDPOINTS.operationalReportBookingPackages,
  vehicleUsage: ADMIN_ENDPOINTS.operationalReportVehicleUsage,
  instructorSchedules: ADMIN_ENDPOINTS.operationalReportInstructorSchedules,
  participantProgress: ADMIN_ENDPOINTS.operationalReportParticipantProgress,
  trainingOutcomes: ADMIN_ENDPOINTS.operationalReportTrainingOutcomes,
};

function buildReportQuery(filters: AdminOperationalReportQuery): ApiQueryParams {
  return {
    q: filters.search,
    start_date: filters.startDate,
    end_date: filters.endDate,
    period_type: filters.periodType,
    status: filters.status,
    instructor: filters.instructor,
    package_name: filters.packageName,
    metode_pembayaran: filters.paymentMethod,
  };
}

export async function getAdminOperationalReport(
  tab: AdminOperationalReportTab,
  filters: AdminOperationalReportQuery,
): Promise<AdminOperationalReportApiData> {
  const response = await apiRequest<AdminOperationalReportApiData>(reportEndpointMap[tab], {
    query: buildReportQuery(filters),
  });

  return response.data ?? {
    rows: [],
    stats: {
      grossRevenue: 0,
      activeBookings: 0,
      finishedSessions: 0,
      graduationRate: 0,
      refundAmount: 0,
      netRevenue: 0,
    },
    generated_at: "",
  };
}

export async function getAdminOperationalReportFilterOptions(): Promise<AdminOperationalReportFilterOptionsData> {
  const response = await apiRequest<AdminOperationalReportFilterOptionsData>(
    ADMIN_ENDPOINTS.operationalReportFilterOptions,
  );

  return response.data ?? {
    instructors: [{ label: "Semua Instruktur", value: "all" }],
    packages: [{ label: "Semua Paket", value: "all" }],
  };
}
