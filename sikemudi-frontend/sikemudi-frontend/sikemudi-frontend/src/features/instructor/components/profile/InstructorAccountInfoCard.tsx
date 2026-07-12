import { Award, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { InstructorProfileData } from "@/features/instructor/constants/instructorProfile";

interface InstructorAccountInfoCardProps {
  profile: InstructorProfileData;
  onChangePassword: () => void;
}

export default function InstructorAccountInfoCard({
  profile,
  onChangePassword,
}: InstructorAccountInfoCardProps) {
  return (
    <div className="space-y-5">
      <Card className="rounded-3xl bg-slate-100/80 p-5 shadow-none">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
          Informasi Akun
        </h3>

        <div className="mt-5 space-y-4">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">
                Status Verifikasi
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950">
                {profile.verificationStatus}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Award className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">Tipe Akun</p>
              <p className="mt-1 text-sm font-bold text-slate-950">
                {profile.accountType}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl bg-slate-100/80 p-5 shadow-none">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
          Keamanan
        </h3>

        <Button
          variant="outline"
          fullWidth
          className="mt-5 h-10 rounded-xl border-slate-300 bg-white text-xs font-bold text-slate-950"
          onClick={onChangePassword}
        >
          Ubah Kata Sandi
        </Button>
      </Card>
    </div>
  );
}
