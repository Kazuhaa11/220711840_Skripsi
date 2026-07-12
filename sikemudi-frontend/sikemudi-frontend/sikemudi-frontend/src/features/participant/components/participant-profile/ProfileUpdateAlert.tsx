import { CheckCircle2 } from "lucide-react";

interface ProfileUpdateAlertProps {
  visible: boolean;
  message?: string;
}

export default function ProfileUpdateAlert({
  visible,
  message = "Profil berhasil diperbarui",
}: ProfileUpdateAlertProps) {
  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}
