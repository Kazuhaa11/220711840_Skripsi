import { Save, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select, { type SelectOption } from "@/components/ui/Select";
import type {
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

interface AddParticipantModalProps {
  opened: boolean;
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
const sectionTitleClassName =
  "mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700";

export default function AddParticipantModal({
  opened,
  values,
  packageOptions = participantFormPackageOptions,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: AddParticipantModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      compact
      title="Tambah Peserta Baru"
      description="Lengkapi data peserta baru sebelum ditambahkan ke database kursus."
      headerClassName="bg-white"
      bodyClassName="bg-white"
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
            {loading ? "Menyimpan..." : "Simpan Peserta"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <div className={sectionTitleClassName}>
            <UserPlus className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Formulir Data Peserta
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Input
              label="Nama Lengkap"
              requiredMark
              value={values.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              placeholder="Contoh: Aditya Saputra"
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
              placeholder="contoh@email.com"
              autoComplete="email"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Input
              label="Nomor Telepon"
              requiredMark
              value={values.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              placeholder="081234567890"
              autoComplete="tel"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Input
              label="Password"
              requiredMark
              type="password"
              value={values.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Input
              label="Konfirmasi Password"
              requiredMark
              type="password"
              value={values.passwordConfirmation}
              onChange={(event) =>
                onChange("passwordConfirmation", event.target.value)
              }
              placeholder="Ulangi password"
              autoComplete="new-password"
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
          </div>
        </div>

        <div>
          <div className="mb-3 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Pengaturan Kursus
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
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
              placeholder="Alamat peserta"
              labelClassName={labelClassName}
              className={inputClassName}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
