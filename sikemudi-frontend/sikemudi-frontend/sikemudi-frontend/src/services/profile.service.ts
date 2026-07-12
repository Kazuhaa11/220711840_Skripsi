import { apiRequest } from "@/services/api";
import {
  ADMIN_ENDPOINTS,
  INSTRUCTOR_ENDPOINTS,
  PARTICIPANT_ENDPOINTS,
} from "@/services/endpoints";
import type { RoleSlug } from "@/types/auth";
import type {
  ProfileItemData,
  UpdateProfilePayload,
  UserProfileItem,
} from "@/types/profile";

const PROFILE_ENDPOINTS: Record<RoleSlug, { profile: string; photo: string }> = {
  admin: {
    profile: ADMIN_ENDPOINTS.profile,
    photo: ADMIN_ENDPOINTS.profilePhoto,
  },
  peserta: {
    profile: PARTICIPANT_ENDPOINTS.profile,
    photo: PARTICIPANT_ENDPOINTS.profilePhoto,
  },
  instruktur: {
    profile: INSTRUCTOR_ENDPOINTS.profile,
    photo: INSTRUCTOR_ENDPOINTS.profilePhoto,
  },
};

function getEndpoints(role: RoleSlug) {
  return PROFILE_ENDPOINTS[role];
}

function unwrapProfile(data?: ProfileItemData): UserProfileItem {
  if (!data?.item) {
    throw new Error("Response profil tidak valid.");
  }

  return data.item;
}

export async function getProfile(role: RoleSlug): Promise<UserProfileItem> {
  const response = await apiRequest<ProfileItemData>(getEndpoints(role).profile);
  return unwrapProfile(response.data);
}

export async function updateProfile(
  role: RoleSlug,
  payload: UpdateProfilePayload,
): Promise<UserProfileItem> {
  const response = await apiRequest<ProfileItemData>(getEndpoints(role).profile, {
    method: "PUT",
    body: payload as Record<string, unknown>,
  });

  return unwrapProfile(response.data);
}

export async function uploadProfilePhoto(
  role: RoleSlug,
  file: File,
): Promise<UserProfileItem> {
  const formData = new FormData();
  formData.append("foto_profil", file);

  const response = await apiRequest<ProfileItemData>(getEndpoints(role).photo, {
    method: "POST",
    body: formData,
  });

  return unwrapProfile(response.data);
}

export async function deleteProfilePhoto(role: RoleSlug): Promise<UserProfileItem> {
  const response = await apiRequest<ProfileItemData>(getEndpoints(role).photo, {
    method: "DELETE",
  });

  return unwrapProfile(response.data);
}
