import { Camera, Trash2 } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { InstructorProfileData } from "@/features/instructor/constants/instructorProfile";

interface InstructorProfileSummaryCardProps {
  profile: InstructorProfileData;
  onChangeAvatar: () => void;
  onDeleteAvatar?: () => void;
  isPhotoLoading?: boolean;
}

export default function InstructorProfileSummaryCard({
  profile,
  onChangeAvatar,
  onDeleteAvatar,
  isPhotoLoading = false,
}: InstructorProfileSummaryCardProps) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.fullName}
            fallback="I"
            className="h-24 w-24 border-4 border-white bg-slate-950 text-2xl font-extrabold shadow-lg"
          />

          <Button
            size="sm"
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-blue-600 p-0 shadow-lg shadow-blue-600/25 hover:bg-blue-700"
            aria-label="Ubah foto profil"
            onClick={onChangeAvatar}
            loading={isPhotoLoading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="mt-5 text-lg font-extrabold text-slate-950">
          {profile.fullName}
        </h2>

        <p className="mt-1 text-xs font-bold tracking-[0.08em] text-blue-700">
          ID: {profile.id}
        </p>

        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeAvatar}
            loading={isPhotoLoading}
            className="rounded-xl border-blue-100 text-xs font-bold text-blue-700 hover:bg-blue-50"
          >
            Upload Foto
          </Button>

          {profile.avatarUrl ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteAvatar}
              disabled={isPhotoLoading}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Hapus
            </Button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge
            variant="success"
            className="bg-emerald-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
          >
            {profile.status}
          </Badge>

          <Badge
            variant="info"
            className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
          >
            {profile.drivingType}
          </Badge>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-600">Bergabung</p>
            <p className="text-sm font-bold text-slate-950">
              {profile.joinDate}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
