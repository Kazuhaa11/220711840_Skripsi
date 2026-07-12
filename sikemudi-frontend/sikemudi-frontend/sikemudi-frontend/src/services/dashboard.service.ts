import { apiRequest } from "@/services/api";
import {
  ADMIN_ENDPOINTS,
  INSTRUCTOR_ENDPOINTS,
  PARTICIPANT_ENDPOINTS,
} from "@/services/endpoints";
import type {
  AdminDashboardData,
  InstructorDashboardData,
  ParticipantDashboardData,
} from "@/types/dashboard";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiRequest<AdminDashboardData>(ADMIN_ENDPOINTS.dashboard);

  return ensureData(response.data, "Response dashboard admin tidak valid.");
}

export async function getParticipantDashboard(): Promise<ParticipantDashboardData> {
  const response = await apiRequest<ParticipantDashboardData>(
    PARTICIPANT_ENDPOINTS.dashboard,
  );

  return ensureData(response.data, "Response dashboard peserta tidak valid.");
}

export async function getInstructorDashboard(): Promise<InstructorDashboardData> {
  const response = await apiRequest<InstructorDashboardData>(
    INSTRUCTOR_ENDPOINTS.dashboard,
  );

  return ensureData(response.data, "Response dashboard instruktur tidak valid.");
}
