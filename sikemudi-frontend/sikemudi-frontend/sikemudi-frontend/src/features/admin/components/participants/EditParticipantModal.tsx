import { KeyRound, Save } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select, { type SelectOption } from "@/components/ui/Select";
import type {
  AdminParticipant,
  AdminParticipantCertificateStatus,
  AdminParticipantFormValues,
  AdminParticipantStatus,
} from "@/features/admin/constants/participants";
import {
  participantCertificateStatusOptions,
  participantFormPackageOptions,
  participantFormStatusOptions,
  participantGenderOptions,
} from "@/features/admin/constants/participants";

interface EditParticipantModalProps {
  opened: boolean;
  participant: AdminParticipant | null;
  values: AdminParticipantFormValues;
  packageOptions?: SelectOption[];
  loading?: boolean;
  onChange: (field: keyof AdminParticipantFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700";
const inputClassName = "h-11 rounded-xl bg-slate-50 text-sm";

export default function EditParticipantModal({
  opened,
  participant,
  values,
  packageOptions = participantFormPackageOptions,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EditParticipantModalProps) {
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (!opened) return;

    setShowPasswordFields(false);
    onChange("password", "");
    onChange("passwordConfirmation", "");
  }, [opened, participant?.apiId]);

  function handleTogglePasswordFields() {
    setShowPasswordFields((current) => {
      const next = !current;

      if (!next) {
        onChange("password", "");
        onChange("passwordConfirmation", "");
      }

      return next;
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      compact
      title="Ubah Data Peserta"
      description={
        participant
          ? `Perbarui data administrasi milik ${participant.fullName}. Password hanya diubah jika bagian password dibuka.`
          : "Perbarui data administrasi peserta."
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="md"
            className="rounded-xl px-4 font-bold uppercase tracking-[0.08em]"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            size="md"
            className="rounded-xl bg-slate-950 px-4 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="mb-3 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
            Data Utama Peserta
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Input
              label="Nama Lengkap"
              requiredMark
              value={values.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              wrapperClassName="lg:col-span-2"
            />

            <Input
              label="Email"
              requiredMark
              type="email"
              value={values.email}
              onChange={(event) => onChange("email", event.target.value)}
              autoComplete="email"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Input
              label="Nomor Telepon"
              requiredMark
              value={values.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              autoComplete="tel"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Input
              label="Tanggal Lahir"
              type="date"
              value={values.birthDate}
              onChange={(event) => onChange("birthDate", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Select
              label="Gender"
              value={values.gender}
              onChange={(event) => onChange("gender", event.target.value)}
              options={participantGenderOptions}
              className={inputClassName}
            />

            <Select
              label="Status Akun"
              value={values.accountStatus}
              onChange={(event) =>
                onChange(
                  "accountStatus",
                  event.target.value as AdminParticipantStatus,
                )
              }
              options={participantFormStatusOptions}
              className={inputClassName}
            />

            <Select
              label="Paket Aktif"
              value={values.activePackage}
              onChange={(event) => onChange("activePackage", event.target.value)}
              options={packageOptions}
              className={inputClassName}
            />

            <Select
              label="Status Sertifikat"
              value={values.certificateStatus}
              onChange={(event) =>
                onChange(
                  "certificateStatus",
                  event.target.value as AdminParticipantCertificateStatus,
                )
              }
              options={participantCertificateStatusOptions}
              className={inputClassName}
            />

            <Input
              label="Alamat"
              value={values.address}
              onChange={(event) => onChange("address", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              wrapperClassName="lg:col-span-2"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-950">
                Password Peserta
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Biarkan tertutup jika hanya ingin mengubah data profil atau paket.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl font-bold"
              leftIcon={<KeyRound className="h-4 w-4" />}
              onClick={handleTogglePasswordFields}
              disabled={loading}
            >
              {showPasswordFields ? "Batal Ubah Password" : "Ubah Password"}
            </Button>
          </div>

          {showPasswordFields ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <Input
                label="Password Baru"
                type="password"
                value={values.password}
                onChange={(event) => onChange("password", event.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                labelClassName={labelClassName}
                className={inputClassName}
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                value={values.passwordConfirmation}
                onChange={(event) =>
                  onChange("passwordConfirmation", event.target.value)
                }
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                labelClassName={labelClassName}
                className={inputClassName}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
