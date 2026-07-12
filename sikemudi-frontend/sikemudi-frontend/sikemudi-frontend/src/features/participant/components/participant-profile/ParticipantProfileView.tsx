import { useEffect, useMemo, useRef, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import type { ParticipantProfileData } from "@/features/participant/constants/type";
import { participantProfileDemo } from "@/features/participant/constants/participantProfile";
import AccountSecurityCard from "@/features/participant/components/participant-profile/AccountSecurityCard";
import ParticipantProfileHeader from "@/features/participant/components/participant-profile/ParticipantProfileHeader";
import ParticipantProfileSummaryCard from "@/features/participant/components/participant-profile/ParticipantProfileSummaryCard";
import PersonalInfoFormCard, {
  type PersonalInfoFormValues,
} from "@/features/participant/components/participant-profile/PersonalInfoFormCard";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getPasswordStrengthError } from "@/features/auth/utils/passwordStrength";
import { getProfilePhotoUrl } from "@/features/profile/utils/profileMapper";
import { getFriendlyApiErrorMessage } from "@/services/api";
import * as profileService from "@/services/profile.service";
import type { UserProfileItem } from "@/types/profile";

interface AccountSecurityValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function getErrorMessage(error: unknown): string {
  return getFriendlyApiErrorMessage(error, "Terjadi kesalahan. Silakan coba lagi.");
}

function mapProfileToParticipantData(profile: UserProfileItem | null): ParticipantProfileData {
  if (!profile) return participantProfileDemo;

  const peserta = profile.peserta;
  const completedSessions = peserta?.jumlah_sesi_selesai ?? 0;
  const totalSessions = peserta?.jumlah_sesi_total ?? 0;
  const progressPercent = totalSessions > 0
    ? Math.min(100, Math.round((completedSessions / totalSessions) * 100))
    : 0;

  return {
    id: String(profile.user.id),
    fullName: profile.user.name,
    email: profile.user.email,
    phoneNumber: profile.user.no_telepon ?? "-",
    joinDate: peserta?.tanggal_bergabung ?? "-",
    address: profile.user.alamat ?? "",
    statusLabel: profile.user.status_akun,
    packageName: peserta?.paket_aktif?.nama_paket ?? "Belum memilih paket",
    progressPercent,
    completedSessions,
    totalSessions,
    avatarUrl: getProfilePhotoUrl(profile) ?? "",
    participantRoleLabel: "Peserta Aktif",
    participantCode: peserta?.kode_peserta ?? `USR-${profile.user.id}`,
    isVerified: profile.user.status_akun === "Aktif",
  };
}

function mapProfileToForm(profile: UserProfileItem | null): PersonalInfoFormValues {
  const mapped = mapProfileToParticipantData(profile);

  return {
    fullName: mapped.fullName,
    email: mapped.email,
    phoneNumber: mapped.phoneNumber === "-" ? "" : mapped.phoneNumber,
    joinDate: mapped.joinDate,
    address: mapped.address,
  };
}

export default function ParticipantProfileView() {
  const { refreshUser } = useAuth();
  const { showNotification } = useFloatingNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileItem, setProfileItem] = useState<UserProfileItem | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormValues>(() =>
    mapProfileToForm(null),
  );
  const [securityInfo, setSecurityInfo] = useState<AccountSecurityValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profile = useMemo(
    () => mapProfileToParticipantData(profileItem),
    [profileItem],
  );

  async function loadProfile() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const nextProfile = await profileService.getProfile("peserta");
      setProfileItem(nextProfile);
      setPersonalInfo(mapProfileToForm(nextProfile));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function handleChangePersonalInfo(
    field: keyof PersonalInfoFormValues,
    value: string,
  ) {
    setErrorMessage(null);
    setPersonalInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleChangeSecurityInfo(
    field: keyof AccountSecurityValues,
    value: string,
  ) {
    setErrorMessage(null);
    setSecurityInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSavePersonalInfo() {
    try {
      setIsSavingProfile(true);
      setErrorMessage(null);

      const nextProfile = await profileService.updateProfile("peserta", {
        name: personalInfo.fullName,
        email: personalInfo.email,
        no_telepon: personalInfo.phoneNumber,
        alamat: personalInfo.address,
      });

      setProfileItem(nextProfile);
      setPersonalInfo(mapProfileToForm(nextProfile));
      await refreshUser();
      showNotification({
        type: "success",
        title: "Profil diperbarui",
        message: "Data profil peserta berhasil disimpan.",
        duration: 3000,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showNotification({
        type: "error",
        title: "Profil gagal disimpan",
        message,
        duration: 4000,
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleCancelPersonalInfo() {
    setPersonalInfo(mapProfileToForm(profileItem));
    setErrorMessage(null);
  }

  async function handleSavePassword() {
    if (!securityInfo.currentPassword || !securityInfo.newPassword) {
      const message = "Password lama dan password baru wajib diisi.";
      setErrorMessage(message);
      showNotification({ type: "error", title: "Password belum lengkap", message, duration: 3500 });
      return;
    }

    const passwordError = getPasswordStrengthError(securityInfo.newPassword, true);
    if (passwordError) {
      setErrorMessage(passwordError);
      showNotification({ type: "error", title: "Password belum valid", message: passwordError, duration: 4000 });
      return;
    }

    if (securityInfo.newPassword !== securityInfo.confirmPassword) {
      const message = "Konfirmasi password tidak sesuai.";
      setErrorMessage(message);
      showNotification({ type: "error", title: "Konfirmasi tidak cocok", message, duration: 3500 });
      return;
    }

    try {
      setIsSavingPassword(true);
      setErrorMessage(null);

      const nextProfile = await profileService.updateProfile("peserta", {
        current_password: securityInfo.currentPassword,
        password: securityInfo.newPassword,
        password_confirmation: securityInfo.confirmPassword,
      });

      setProfileItem(nextProfile);
      setSecurityInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showNotification({
        type: "success",
        title: "Password diperbarui",
        message: "Password akun berhasil diganti.",
        duration: 3000,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showNotification({
        type: "error",
        title: "Password gagal diperbarui",
        message,
        duration: 4000,
      });
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
  }

  function handleChangeAvatar() {
    fileInputRef.current?.click();
  }

  async function handleUploadAvatar(file: File | undefined) {
    if (!file) return;

    try {
      setIsPhotoLoading(true);
      setErrorMessage(null);

      const nextProfile = await profileService.uploadProfilePhoto("peserta", file);
      setProfileItem(nextProfile);
      await refreshUser();
      showNotification({
        type: "success",
        title: "Foto diunggah",
        message: "Foto profil berhasil diperbarui.",
        duration: 3000,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showNotification({
        type: "error",
        title: "Foto gagal diunggah",
        message,
        duration: 4000,
      });
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

      const nextProfile = await profileService.deleteProfilePhoto("peserta");
      setProfileItem(nextProfile);
      await refreshUser();
      showNotification({
        type: "success",
        title: "Foto dihapus",
        message: "Foto profil berhasil dihapus.",
        duration: 3000,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showNotification({
        type: "error",
        title: "Foto gagal dihapus",
        message,
        duration: 4000,
      });
    } finally {
      setIsPhotoLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Memuat profil peserta..." />;
  }

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden">
      <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => void handleUploadAvatar(event.target.files?.[0])}
        />

        {errorMessage ? (
          <div className="mt-4">
            <ErrorMessage message={errorMessage} />
          </div>
        ) : null}

        <div className="mt-3 sm:mt-5">
          <ParticipantProfileHeader />
        </div>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
          <div className="space-y-4 sm:space-y-5">
            <ParticipantProfileSummaryCard
              profile={profile}
              onChangeAvatar={handleChangeAvatar}
              onDeleteAvatar={handleDeleteAvatar}
              isPhotoLoading={isPhotoLoading}
            />
          </div>

          <div className="space-y-4 sm:space-y-5">
            <PersonalInfoFormCard
              values={personalInfo}
              onChange={handleChangePersonalInfo}
              onSave={handleSavePersonalInfo}
              onCancel={handleCancelPersonalInfo}
              isSaving={isSavingProfile}
            />

            <AccountSecurityCard
              values={securityInfo}
              isVerified={profile.isVerified}
              onChange={handleChangeSecurityInfo}
              onSave={handleSavePassword}
              onCancel={handleCancelSecurityChanges}
              isSaving={isSavingPassword}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
