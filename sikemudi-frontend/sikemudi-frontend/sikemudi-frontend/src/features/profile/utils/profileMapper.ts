import { API_BASE_URL } from "@/services/endpoints";
import type { UserProfileItem } from "@/types/profile";

export function getInitials(name: string | null | undefined, fallback = "U"): string {
  if (!name) return fallback;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || fallback;
}

export function resolveBackendAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.startsWith("data:")) return url;
  if (/^https?:\/\//i.test(url)) return url;

  const apiUrl = new URL(API_BASE_URL);
  const apiOrigin = apiUrl.origin;

  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getProfilePhotoUrl(profile: UserProfileItem | null): string | null {
  if (!profile) return null;

  return resolveBackendAssetUrl(profile.user.foto_profil_url ?? profile.user.foto_profil);
}

export function formatFileSize(size: number | null | undefined): string {
  if (!size) return "-";

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
