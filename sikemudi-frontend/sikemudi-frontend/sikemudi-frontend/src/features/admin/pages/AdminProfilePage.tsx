import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import UserAvatar from "@/components/common/UserAvatar";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import AccountSecurityCard from "@/features/participant/components/participant-profile/AccountSecurityCard";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getPasswordStrengthError } from "@/features/auth/utils/passwordStrength";
import { getProfilePhotoUrl } from "@/features/profile/utils/profileMapper";
import { getFriendlyApiErrorMessage } from "@/services/api";
import * as profileService from "@/services/profile.service";
import type { UserProfileItem } from "@/types/profile";
import { Camera, Mail, Phone, ShieldCheck, Trash2, UserRound } from "lucide-react";

interface AdminProfileFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

interface AccountSecurityValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function getErrorMessage(error: unknown): string {
  return getFriendlyApiErrorMessage(error, "Terjadi kesalahan. Silakan coba lagi.");
}

function mapProfileToForm(profile: UserProfileItem | null): AdminProfileFormValues {
  return {
    fullName: profile?.user.name ?? "",
    email: profile?.user.email ?? "",
    phoneNumber: profile?.user.no_telepon ?? "",
    address: profile?.user.alamat ?? "",
  };
}

const inputClassName =
  "h-11 rounded-xl bg-slate-50 text-sm font-medium text-slate-800 focus:bg-white";
const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700";

export default function AdminProfilePage() {
  const { refreshUser } = useAuth();
  const { showNotification } = useFloatingNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileItem, setProfileItem] = useState<UserProfileItem | null>(null);
  const [formValues, setFormValues] = useState<AdminProfileFormValues>(() =>
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

  const photoUrl = useMemo(() => getProfilePhotoUrl(profileItem), [profileItem]);

  useEffect(() => {
    if (!successMessage) return;

    showNotification({
      type: "success",
      title: "Berhasil",
      message: successMessage,
      duration: 3000,
    });
  }, [showNotification, successMessage]);

  useEffect(() => {
    if (!errorMessage) return;

    showNotification({
      type: "error",
      title: "Gagal",
      message: errorMessage,
      duration: 3000,
    });
  }, [errorMessage, showNotification]);

  async function loadProfile() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const nextProfile = await profileService.getProfile("admin");
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

  function handleChange(field: keyof AdminProfileFormValues, value: string) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleChangeSecurityInfo(field: keyof AccountSecurityValues, value: string) {
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

      const nextProfile = await profileService.updateProfile("admin", {
        name: formValues.fullName,
        email: formValues.email,
        no_telepon: formValues.phoneNumber,
        alamat: formValues.address,
      });

      setProfileItem(nextProfile);
      setFormValues(mapProfileToForm(nextProfile));
      setSuccessMessage("Profil admin berhasil diperbarui.");
      await refreshUser();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePassword() {
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

      await profileService.updateProfile("admin", {
        current_password: securityInfo.currentPassword,
        password: securityInfo.newPassword,
        password_confirmation: securityInfo.confirmPassword,
      });

      setSecurityInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password admin berhasil diperbarui.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleCancel() {
    setFormValues(mapProfileToForm(profileItem));
    setSuccessMessage(null);
    setErrorMessage(null);
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

  function handleSelectPhoto() {
    fileInputRef.current?.click();
  }

  async function handleUploadPhoto(file: File | undefined) {
    if (!file) return;

    try {
      setIsPhotoLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const nextProfile = await profileService.uploadProfilePhoto("admin", file);
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

  async function handleDeletePhoto() {
    try {
      setIsPhotoLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const nextProfile = await profileService.deleteProfilePhoto("admin");
      setProfileItem(nextProfile);
      setSuccessMessage("Foto profil berhasil dihapus.");
      await refreshUser();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPhotoLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Memuat profil admin..." />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-[28px] bg-[#eef3f9] p-5 sm:p-6 lg:p-7">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => void handleUploadPhoto(event.target.files?.[0])}
        />

        <PageHeader
          className="mb-0"
          title="Profil Admin"
          description="Kelola informasi akun admin yang sedang login."
          titleClassName="text-3xl font-extrabold md:text-4xl"
          descriptionClassName="mt-3 text-base leading-7 text-slate-700"
        />

        <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Card className="rounded-3xl p-5 text-center shadow-sm">
              <UserAvatar
                src={photoUrl}
                name={profileItem?.user.name ?? "Admin"}
                fallback="A"
                className="mx-auto h-28 w-28 border-4 border-white text-2xl font-black shadow-lg"
              />

              <h2 className="mt-5 text-lg font-extrabold text-slate-950">
                {profileItem?.user.name ?? "Admin"}
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {profileItem?.user.role?.nama_role ?? "Admin"}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleSelectPhoto}
                  loading={isPhotoLoading}
                  leftIcon={<Camera className="h-4 w-4" />}
                  className="rounded-xl border-blue-100 text-xs font-bold text-blue-700 hover:bg-blue-50"
                >
                  Upload Foto
                </Button>

                {photoUrl ? (
                  <Button
                    variant="ghost"
                    onClick={handleDeletePhoto}
                    disabled={isPhotoLoading}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Hapus Foto
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
                Informasi Akun
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Status Akun</p>
                    <Badge variant="success" className="mt-2 px-3 py-1 text-[11px] font-bold">
                      {profileItem?.user.status_akun ?? "-"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                  <p className="min-w-0 break-all text-sm font-medium text-slate-700">
                    {profileItem?.user.email ?? "-"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                  <p className="text-sm font-medium text-slate-700">
                    {profileItem?.user.no_telepon ?? "-"}
                  </p>
                </div>
              </div>
            </Card>
          </aside>

          <main className="space-y-5">
            <Card className="rounded-3xl p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <UserRound className="h-4 w-4" />
                </div>

                <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
                  Detail Informasi Admin
                </h3>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nama Lengkap"
                  value={formValues.fullName}
                  onChange={(event) => handleChange("fullName", event.target.value)}
                  labelClassName={labelClassName}
                  className={inputClassName}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  labelClassName={labelClassName}
                  className={inputClassName}
                />

                <Input
                  label="Nomor Telepon"
                  value={formValues.phoneNumber}
                  onChange={(event) => handleChange("phoneNumber", event.target.value)}
                  labelClassName={labelClassName}
                  className={inputClassName}
                />
              </div>

              <div className="mt-5">
                <TextArea
                  label="Alamat Lengkap"
                  value={formValues.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  rows={4}
                  labelClassName={labelClassName}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="h-11 rounded-xl px-6 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </Button>

                <Button
                  onClick={handleSaveProfile}
                  loading={isSaving}
                  className="h-11 rounded-xl bg-slate-950 px-8 text-sm font-bold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </Card>

            <AccountSecurityCard
              values={securityInfo}
              isVerified={profileItem?.user.status_akun === "Aktif"}
              onChange={handleChangeSecurityInfo}
              onSave={handleSavePassword}
              onCancel={handleCancelSecurityChanges}
              isSaving={isSavingPassword}
            />
          </main>
        </div>
      </section>
    </div>
  );
}
