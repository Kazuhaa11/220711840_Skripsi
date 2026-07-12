import { apiRequest } from "@/services/api";
import { INSTRUCTOR_ENDPOINTS } from "@/services/endpoints";
import type {
  InstructorTeachingScheduleDetailData,
  InstructorSlotAssignmentListData,
  InstructorTeachingScheduleListData,
  InstructorTeachingSchedulePackageDetailData,
  InstructorTeachingScheduleQuery,
  InstructorTrainingResultCandidateListData,
  InstructorTrainingResultCandidateQuery,
  InstructorTrainingResultItemData,
  InstructorTrainingResultListData,
  InstructorTrainingResultQuery,
  SaveInstructorTrainingResultPayload,
} from "@/types/instructor";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}


export async function getInstructorSlotAssignments(): Promise<InstructorSlotAssignmentListData> {
  const response = await apiRequest<InstructorSlotAssignmentListData>(
    INSTRUCTOR_ENDPOINTS.slotAssignments,
  );

  return ensureData(response.data, "Response assignment slot instruktur tidak valid.");
}

export async function getInstructorTeachingSchedules(
  query: InstructorTeachingScheduleQuery = {},
): Promise<InstructorTeachingScheduleListData> {
  const response = await apiRequest<InstructorTeachingScheduleListData>(
    INSTRUCTOR_ENDPOINTS.teachingSchedules,
    { query: { ...query } },
  );

  return ensureData(response.data, "Response jadwal mengajar tidak valid.");
}

export async function getInstructorTeachingScheduleDetail(
  id: string | number,
): Promise<InstructorTeachingScheduleDetailData> {
  const response = await apiRequest<InstructorTeachingScheduleDetailData>(
    INSTRUCTOR_ENDPOINTS.teachingScheduleDetail(id),
  );

  return ensureData(response.data, "Response detail jadwal mengajar tidak valid.");
}

export async function getInstructorTeachingSchedulePackageDetail(
  id: string | number,
): Promise<InstructorTeachingSchedulePackageDetailData> {
  const response = await apiRequest<InstructorTeachingSchedulePackageDetailData>(
    INSTRUCTOR_ENDPOINTS.teachingSchedulePackageDetail(id),
  );

  return ensureData(response.data, "Response detail paket jadwal mengajar tidak valid.");
}

export async function getInstructorTrainingResultCandidates(
  query: InstructorTrainingResultCandidateQuery = {},
): Promise<InstructorTrainingResultCandidateListData> {
  const response = await apiRequest<InstructorTrainingResultCandidateListData>(
    INSTRUCTOR_ENDPOINTS.trainingResultCandidates,
    { query: { ...query } },
  );

  return ensureData(response.data, "Response kandidat hasil latihan tidak valid.");
}

export async function getInstructorTrainingResults(
  query: InstructorTrainingResultQuery = {},
): Promise<InstructorTrainingResultListData> {
  const response = await apiRequest<InstructorTrainingResultListData>(
    INSTRUCTOR_ENDPOINTS.trainingResults,
    { query: { ...query } },
  );

  return ensureData(response.data, "Response hasil latihan tidak valid.");
}

export async function createInstructorTrainingResult(
  payload: SaveInstructorTrainingResultPayload,
): Promise<InstructorTrainingResultItemData> {
  const response = await apiRequest<InstructorTrainingResultItemData>(
    INSTRUCTOR_ENDPOINTS.trainingResults,
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response simpan hasil latihan tidak valid.");
}

export async function getInstructorTrainingResultDetail(
  id: string | number,
): Promise<InstructorTrainingResultItemData> {
  const response = await apiRequest<InstructorTrainingResultItemData>(
    INSTRUCTOR_ENDPOINTS.trainingResultDetail(id),
  );

  return ensureData(response.data, "Response detail hasil latihan tidak valid.");
}

export async function updateInstructorTrainingResult(
  id: string | number,
  payload: SaveInstructorTrainingResultPayload,
): Promise<InstructorTrainingResultItemData> {
  const { booking_id: _bookingId, ...body } = payload;

  const response = await apiRequest<InstructorTrainingResultItemData>(
    INSTRUCTOR_ENDPOINTS.trainingResultDetail(id),
    {
      method: "PUT",
      body: body as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response update hasil latihan tidak valid.");
}
