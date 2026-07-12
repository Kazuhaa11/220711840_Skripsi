import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type {
  AdminInstructorFormValues,
  AdminInstructorScheduleStatus,
  AdminInstructorStatus,
} from "@/features/admin/constants/instructors";
import {
  instructorAccountStatusOptions,
  instructorRoleOptions,
  instructorScheduleStatusOptions,
  instructorSpecializationOptions,
  instructorStatusOptions,
} from "@/features/admin/constants/instructors";

interface AddInstructorModalProps {
  opened: boolean;
  values: AdminInstructorFormValues;
  loading?: boolean;
  onChange: (field: keyof AdminInstructorFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[10px] font-black uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-11 rounded-2xl border-0 bg-slate-100 text-sm";

export default function AddInstructorModal({
  opened,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: AddInstructorModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      compact
      title="Tambah Instruktur Baru"
      description="Lengkapi data instruktur sebelum ditambahkan ke database kursus."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="md"
            className="rounded-2xl px-5 font-bold uppercase tracking-[0.08em]"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            size="md"
            className="rounded-2xl bg-slate-950 px-5 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Instruktur"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700">
          Formulir Data Instruktur
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Nama Lengkap"
            requiredMark
            value={values.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            placeholder="Contoh: Budi Santoso"
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
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Input
            label="Nomor Telepon"
            requiredMark
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="081234567890"
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
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Select
            label="Status Akun"
            value={values.accountStatus}
            onChange={(event) => onChange("accountStatus", event.target.value)}
            options={instructorAccountStatusOptions}
            className={inputClassName}
          />

          <Select
            label="Jabatan"
            value={values.role}
            onChange={(event) => onChange("role", event.target.value)}
            options={instructorRoleOptions}
            className={inputClassName}
          />

          <Select
            label="Spesialisasi"
            value={values.specialization}
            onChange={(event) => onChange("specialization", event.target.value)}
            options={instructorSpecializationOptions}
            className={inputClassName}
          />

          <Select
            label="Status Aktif"
            value={values.status}
            onChange={(event) =>
              onChange("status", event.target.value as AdminInstructorStatus)
            }
            options={instructorStatusOptions}
            className={inputClassName}
          />

          <Select
            label="Status Jadwal"
            value={values.scheduleStatus}
            onChange={(event) =>
              onChange(
                "scheduleStatus",
                event.target.value as AdminInstructorScheduleStatus,
              )
            }
            options={instructorScheduleStatusOptions}
            className={inputClassName}
          />

          <Input
            label="Alamat"
            value={values.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="Alamat instruktur"
            labelClassName={labelClassName}
            className={inputClassName}
            wrapperClassName="lg:col-span-2"
          />
        </div>
      </div>
    </Modal>
  );
}
