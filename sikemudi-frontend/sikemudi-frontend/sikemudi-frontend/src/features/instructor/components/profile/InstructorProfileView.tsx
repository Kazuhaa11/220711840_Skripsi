import { useEffect, useMemo, useRef, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import AccountSecurityCard from "@/features/participant/components/participant-profile/AccountSecurityCard";
import InstructorProfileFormCard from "@/features/instructor/components/profile/InstructorProfileFormCard";
import InstructorProfileHeader from "@/features/instructor/components/profile/InstructorProfileHeader";
import InstructorProfileSummaryCard from "@/features/instructor/components/profile/InstructorProfileSummaryCard";
import type {
  InstructorProfileData,
  InstructorProfileFormValues,
} from "@/features/instructor/constants/instructorProfile";

interface AccountSecurityValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
import { useAuth } from "@/features/auth/context/AuthContext";
import { getPasswordStrengthError } from "@/features/auth/utils/passwordStrength";
import { getProfilePhotoUrl } from "@/features/profile/utils/profileMapper";
import { getFriendlyApiErrorMessage } from "@/services/api";
import * as profileService from "@/services/profile.service";
import type { UserProfileItem } from "@/types/profile";

function getErrorMessage(error: unknown): string {
  return getFriendlyApiErrorMessage(error, "Terjadi kesalahan. Silakan coba lagi.");
}

function mapProfileToInstructorData(profile: UserProfileItem | null): InstructorProfileData {
  const user = profile?.user;
  const instruktur = profile?.instruktur;

  return {
    id: instruktur?.kode_instruktur ?? (user ? `USR-${user.id}` : "-"),
    fullName: user?.name ?? "Instruktur",
    email: user?.email ?? "-",
    phoneCountryCode: "+62",
    phoneNumber: user?.no_telepon ?? "",
    birthDate: "",
    specialization: instruktur?.spesialisasi ?? "",
    address: user?.alamat ?? "",
    status: instruktur?.status === "Nonaktif" ? "Tidak Aktif" : "Aktif",
    drivingType: instruktur?.spesialisasi ?? "Belum diatur",
    joinDate: instruktur?.tanggal_bergabung ?? "-",
    totalSessions: instruktur?.total_sesi ?? 0,
    rating: instruktur?.rating ?? 0,
    verificationStatus: user?.status_akun === "Aktif" ? "Akun Aktif" : "Akun Nonaktif",
    accountType: user?.role?.nama_role ?? "Instruktur",
    experience: `${instruktur?.total_sesi ?? 0} Sesi`,
    certification: instruktur?.jabatan ?? "Instruktur",
    avatarUrl: getProfilePhotoUrl(profile) ?? "",
  };
}

function mapProfileToForm(profile: UserProfileItem | null): InstructorProfileFormValues {
  const mapped = mapProfileToInstructorData(profile);

  return {
    fullName: mapped.fullName,
    email: mapped.email,
    phoneCountryCode: mapped.phoneCountryCode,
    phoneNumber: mapped.phoneNumber,
    birthDate: mapped.birthDate,
    specialization: mapped.specialization,
    address: mapped.address,
  };
}

export default function InstructorProfileView() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileItem, setProfileItem] = useState<UserProfileItem | null>(null);
  const [formValues, setFormValues] = useState<InstructorProfileFormValues>(() =>
    mapProfileToForm(null),
  );
  const [securityInfo, setSecurityInfo] = useState<AccountSecurityValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profile = useMemo(
    () => mapProfileToInstructorData(profileItem),
    [profileItem],
  );

  async function loadProfile() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const nextProfile = await profileService.getProfile("instruktur");
      setProfileItem(nextProfile);
      setFormValues(mapProfileToForm(nextProfile));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function handleChange(
    field: keyof InstructorProfileFormValues,
    value: string,
  ) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleChangeSecurityInfo(
    field: keyof AccountSecurityValues,
    value: string,
  ) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setSecurityInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSaveProfile() {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const nextProfile = await profileService.updateProfile("instruktur", {
        name: formValues.fullName,
        email: formValues.email,
        no_telepon: formValues.phoneNumber,
        alamat: formValues.address,
        spesialisasi: formValues.specialization,
      });

      setProfileItem(nextProfile);
      setFormValues(mapProfileToForm(nextProfile));
      setSuccessMessage("Profil instruktur berhasil diperbarui.");
      await refreshUser();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelProfile() {
    setFormValues(mapProfileToForm(profileItem));
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  function handleChangeAvatar() {
    fileInputRef.current?.click();
  }

  async function handleUploadAvatar(file: File | undefined) {
    if (!file) return;

    try {
      setIsPhotoLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const nextProfile = await profileService.uploadProfilePhoto("instruktur", file);
      setProfileItem(nextProfile);
      setSuccessMessage("Foto profil berhasil diunggah.");
      await refreshUser();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPhotoLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDeleteAvatar() {
    try {
      setIsPhotoLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const nextProfile = await profileService.deleteProfilePhoto("instruktur");
      setProfileItem(nextProfile);
      setSuccessMessage("Foto profil berhasil dihapus.");
      await refreshUser();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPhotoLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!securityInfo.currentPassword || !securityInfo.newPassword) {
      setErrorMessage("Password lama dan password baru wajib diisi.");
      return;
    }

    const passwordError = getPasswordStrengthError(securityInfo.newPassword, true);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (securityInfo.newPassword !== securityInfo.confirmPassword) {
      setErrorMessage("Konfirmasi password tidak sesuai.");
      return;
    }

    try {
      setIsSavingPassword(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await profileService.updateProfile("instruktur", {
        current_password: securityInfo.currentPassword,
        password: securityInfo.newPassword,
        password_confirmation: securityInfo.confirmPassword,
      });

      setSecurityInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password instruktur berhasil diperbarui.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleCancelSecurityChanges() {
    setSecurityInfo({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  if (isLoading) {
    return <LoadingSpinner label="Memuat profil instruktur..." />;
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-4 py-6 sm:-m-6 sm:px-6 lg:-m-7 lg:px-7 xl:-m-8 xl:px-8">
      <div className="mx-auto w-full max-w-295">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => void handleUploadAvatar(event.target.files?.[0])}
        />

        {successMessage ? (
          <div className="mb-5">
            <SuccesBanner
              message={successMessage}
              className="rounded-xl border-l-4 border-l-emerald-600 bg-emerald-50/80"
            />
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-5">
            <ErrorMessage message={errorMessage} />
          </div>
        ) : null}

        <InstructorProfileHeader />

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <InstructorProfileSummaryCard
              profile={profile}
              onChangeAvatar={handleChangeAvatar}
              onDeleteAvatar={handleDeleteAvatar}
              isPhotoLoading={isPhotoLoading}
            />
          </aside>

          <main className="space-y-6">
            <InstructorProfileFormCard
              values={formValues}
              onChange={handleChange}
              onSave={handleSaveProfile}
              onCancel={handleCancelProfile}
              isSaving={isSaving}
            />

            <AccountSecurityCard
              values={securityInfo}
              isVerified={profile.verificationStatus === "Akun Aktif"}
              title="Ubah Kata Sandi"
              onChange={handleChangeSecurityInfo}
              onSave={handleChangePassword}
              onCancel={handleCancelSecurityChanges}
              isSaving={isSavingPassword}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
