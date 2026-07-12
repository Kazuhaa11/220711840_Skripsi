import { apiDownload, apiRequest } from "@/services/api";
import type {
  AdminCertificateCandidateListData,
  AdminCertificateItemData,
  AdminCertificateListData,
  AdminCertificateQuery,
  AdminCertificateTemplateItemData,
  AdminCertificateTemplateListData,
  AdminCertificateTemplatePayload,
  AdminIssueCertificatePayload,
  AdminRevokeCertificatePayload,
} from "@/types/adminCertificate";

const DEFAULT_PER_PAGE = 10;
const FETCH_ALL_PAGE_SIZE = 50;

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return;

  if (typeof value === "boolean") {
    formData.append(key, value ? "1" : "0");
    return;
  }

  formData.append(key, String(value));
}

function buildTemplateFormData(payload: AdminCertificateTemplatePayload): FormData {
  const formData = new FormData();

  appendFormValue(formData, "nama_template", payload.nama_template);
  appendFormValue(formData, "judul_sertifikat", payload.judul_sertifikat);
  appendFormValue(formData, "subjudul", payload.subjudul ?? "");
  appendFormValue(formData, "recipient_label", payload.recipient_label ?? "");
  appendFormValue(formData, "program_prefix", payload.program_prefix ?? "");
  appendFormValue(formData, "kalimat_pembuka", payload.kalimat_pembuka ?? "");
  appendFormValue(formData, "kalimat_penutup", payload.kalimat_penutup ?? "");
  appendFormValue(formData, "nama_penyelenggara", payload.nama_penyelenggara ?? "");
  appendFormValue(formData, "institution_address", payload.institution_address ?? "");
  appendFormValue(formData, "nama_penandatangan", payload.nama_penandatangan ?? "");
  appendFormValue(formData, "jabatan_penandatangan", payload.jabatan_penandatangan ?? "");
  appendFormValue(formData, "background_type", payload.background_type);
  appendFormValue(formData, "background_color", payload.background_color);
  appendFormValue(formData, "border_color", payload.border_color);
  appendFormValue(formData, "accent_color", payload.accent_color);
  appendFormValue(formData, "status", payload.status);
  appendFormValue(formData, "is_default", payload.is_default ?? false);
  appendFormValue(formData, "remove_background_image", payload.remove_background_image ?? false);
  appendFormValue(formData, "remove_ttd_digital", payload.remove_ttd_digital ?? false);

  if (payload.background_image_file) {
    formData.append("background_image_file", payload.background_image_file);
  }

  if (payload.ttd_digital_file) {
    formData.append("ttd_digital_file", payload.ttd_digital_file);
  }

  return formData;
}

export async function getAdminCertificateCandidates(
  query: AdminCertificateQuery = {},
): Promise<AdminCertificateCandidateListData> {
  const response = await apiRequest<AdminCertificateCandidateListData>(
    "/admin/sertifikat/kandidat",
    {
      query: {
        per_page: query.per_page ?? DEFAULT_PER_PAGE,
        ...query,
      },
    },
  );

  return ensureData(response.data, "Response kandidat sertifikat tidak valid.");
}

export async function getAdminCertificates(
  query: AdminCertificateQuery = {},
): Promise<AdminCertificateListData> {
  const response = await apiRequest<AdminCertificateListData>("/admin/sertifikat", {
    query: {
      per_page: query.per_page ?? DEFAULT_PER_PAGE,
      ...query,
    },
  });

  return ensureData(response.data, "Response sertifikat tidak valid.");
}

export async function getAllAdminCertificateCandidates(
  query: AdminCertificateQuery = {},
): Promise<AdminCertificateCandidateListData> {
  const items: AdminCertificateCandidateListData["items"] = [];
  let currentPage = 1;
  let lastPage = 1;
  let total = 0;

  do {
    const response = await getAdminCertificateCandidates({
      ...query,
      page: currentPage,
      per_page: query.per_page ?? FETCH_ALL_PAGE_SIZE,
    });

    items.push(...response.items);
    lastPage = response.pagination?.last_page ?? 1;
    total = response.pagination?.total ?? items.length;
    currentPage += 1;
  } while (currentPage <= lastPage);

  return {
    items,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: items.length || FETCH_ALL_PAGE_SIZE,
      total,
    },
  };
}

export async function getAllAdminCertificates(
  query: AdminCertificateQuery = {},
): Promise<AdminCertificateListData> {
  const items: AdminCertificateListData["items"] = [];
  let currentPage = 1;
  let lastPage = 1;
  let total = 0;

  do {
    const response = await getAdminCertificates({
      ...query,
      page: currentPage,
      per_page: query.per_page ?? FETCH_ALL_PAGE_SIZE,
    });

    items.push(...response.items);
    lastPage = response.pagination?.last_page ?? 1;
    total = response.pagination?.total ?? items.length;
    currentPage += 1;
  } while (currentPage <= lastPage);

  return {
    items,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: items.length || FETCH_ALL_PAGE_SIZE,
      total,
    },
  };
}

export async function getAdminCertificateDetail(
  certificateId: string | number,
): Promise<AdminCertificateItemData> {
  const response = await apiRequest<AdminCertificateItemData>(
    `/admin/sertifikat/${certificateId}`,
  );

  return ensureData(response.data, "Response detail sertifikat tidak valid.");
}

export async function issueAdminCertificate(
  payload: AdminIssueCertificatePayload,
): Promise<AdminCertificateItemData> {
  const response = await apiRequest<AdminCertificateItemData>(
    "/admin/sertifikat/terbitkan",
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response penerbitan sertifikat tidak valid.");
}

export async function generateAdminCertificatePdf(
  certificateId: string | number,
): Promise<AdminCertificateItemData> {
  const response = await apiRequest<AdminCertificateItemData>(
    `/admin/sertifikat/${certificateId}/generate-pdf`,
    {
      method: "POST",
    },
  );

  return ensureData(response.data, "Response generate PDF sertifikat tidak valid.");
}

export async function downloadAdminCertificatePdf(
  certificateId: string | number,
): Promise<Blob> {
  return apiDownload(`/admin/sertifikat/${certificateId}/download`);
}

export async function revokeAdminCertificate(
  certificateId: string | number,
  payload: AdminRevokeCertificatePayload = {},
): Promise<AdminCertificateItemData> {
  const response = await apiRequest<AdminCertificateItemData>(
    `/admin/sertifikat/${certificateId}/cabut`,
    {
      method: "PUT",
      body: {
        catatan: payload.catatan?.trim() || null,
      },
    },
  );

  return ensureData(response.data, "Response pencabutan sertifikat tidak valid.");
}

export async function getAdminCertificateTemplates(
  query: AdminCertificateQuery = {},
): Promise<AdminCertificateTemplateListData> {
  const response = await apiRequest<AdminCertificateTemplateListData>(
    "/admin/template-sertifikat",
    {
      query: {
        per_page: query.per_page ?? DEFAULT_PER_PAGE,
        ...query,
      },
    },
  );

  return ensureData(response.data, "Response template sertifikat tidak valid.");
}

export async function getAllAdminCertificateTemplates(): Promise<AdminCertificateTemplateListData> {
  const response = await getAdminCertificateTemplates({ all: true, per_page: FETCH_ALL_PAGE_SIZE });

  return {
    items: response.items,
    pagination: response.pagination ?? {
      current_page: 1,
      last_page: 1,
      per_page: response.items.length,
      total: response.items.length,
    },
  };
}

export async function createAdminCertificateTemplate(
  payload: AdminCertificateTemplatePayload,
): Promise<AdminCertificateTemplateItemData> {
  const response = await apiRequest<AdminCertificateTemplateItemData>(
    "/admin/template-sertifikat",
    {
      method: "POST",
      body: buildTemplateFormData(payload),
    },
  );

  return ensureData(response.data, "Response tambah template sertifikat tidak valid.");
}

export async function updateAdminCertificateTemplate(
  templateId: string | number,
  payload: AdminCertificateTemplatePayload,
): Promise<AdminCertificateTemplateItemData> {
  const formData = buildTemplateFormData(payload);
  formData.append("_method", "PUT");

  const response = await apiRequest<AdminCertificateTemplateItemData>(
    `/admin/template-sertifikat/${templateId}`,
    {
      method: "POST",
      body: formData,
    },
  );

  return ensureData(response.data, "Response update template sertifikat tidak valid.");
}

export async function deleteAdminCertificateTemplate(
  templateId: string | number,
): Promise<AdminCertificateTemplateItemData | undefined> {
  const response = await apiRequest<AdminCertificateTemplateItemData>(
    `/admin/template-sertifikat/${templateId}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}

export async function activateAdminCertificateTemplate(
  templateId: string | number,
): Promise<AdminCertificateTemplateItemData> {
  const response = await apiRequest<AdminCertificateTemplateItemData>(
    `/admin/template-sertifikat/${templateId}/aktifkan`,
    {
      method: "PATCH",
    },
  );

  return ensureData(response.data, "Response aktivasi template sertifikat tidak valid.");
}

export async function setDefaultAdminCertificateTemplate(
  templateId: string | number,
): Promise<AdminCertificateTemplateItemData> {
  const response = await apiRequest<AdminCertificateTemplateItemData>(
    `/admin/template-sertifikat/${templateId}/set-default`,
    {
      method: "PATCH",
    },
  );

  return ensureData(response.data, "Response set default template sertifikat tidak valid.");
}
