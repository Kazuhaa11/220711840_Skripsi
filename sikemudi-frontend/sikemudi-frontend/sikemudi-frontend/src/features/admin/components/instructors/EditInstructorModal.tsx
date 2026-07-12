import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type {
  AdminInstructor,
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

interface EditInstructorModalProps {
  opened: boolean;
  instructor: AdminInstructor | null;
  values: AdminInstructorFormValues;
  loading?: boolean;
  onChange: (field: keyof AdminInstructorFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[10px] font-black uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-11 rounded-2xl border-0 bg-slate-100 text-sm";

export default function EditInstructorModal({
  opened,
  instructor,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EditInstructorModalProps) {
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (opened) {
      setShowPasswordFields(false);
      onChange("password", "");
      onChange("passwordConfirmation", "");
    }
    // onChange sengaja tidak dimasukkan agar reset hanya saat modal dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  function togglePasswordFields() {
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
      size="2xl"
      compact
      title="Ubah Data Instruktur"
      description={
        instructor
          ? `Perbarui data instruktur ${instructor.fullName}. Password hanya diubah jika bagian password dibuka.`
          : "Perbarui data instruktur."
      }
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700">
          Data Utama Instruktur
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Input
            label="Nomor Telepon"
            requiredMark
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
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
            labelClassName={labelClassName}
            className={inputClassName}
            wrapperClassName="lg:col-span-2"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">Password Instruktur</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Biarkan tertutup jika password tidak perlu diubah.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              leftIcon={<KeyRound className="h-4 w-4" />}
              onClick={togglePasswordFields}
            >
              {showPasswordFields ? "Batalkan Ubah Password" : "Ubah Password"}
            </Button>
          </div>

          {showPasswordFields ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Input
                label="Password Baru"
                type="password"
                value={values.password}
                onChange={(event) => onChange("password", event.target.value)}
                placeholder="Minimal 8 karakter"
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
