import UserAvatar from "@/components/common/UserAvatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Camera, Trash2 } from "lucide-react";
import type { ParticipantProfileData } from "@/features/participant/constants/type";

interface ParticipantProfileSummaryCardProps {
  profile: ParticipantProfileData;
  onChangeAvatar?: () => void;
  onDeleteAvatar?: () => void;
  isPhotoLoading?: boolean;
}

export default function ParticipantProfileSummaryCard({
  profile,
  onChangeAvatar,
  onDeleteAvatar,
  isPhotoLoading = false,
}: ParticipantProfileSummaryCardProps) {
  return (
    <Card className="min-w-0 rounded-2xl border-l-4 border-l-blue-600 p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.fullName}
            fallback="P"
            className="h-20 w-20 border-4 border-white bg-slate-900 text-lg font-black shadow-lg sm:h-24 sm:w-24 sm:text-xl"
          />

          <Button
            size="sm"
            onClick={onChangeAvatar}
            loading={isPhotoLoading}
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-[#0b1f4d] p-0 text-white shadow-lg hover:bg-[#10295f]"
            aria-label="Ganti foto profil"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="mt-4 break-words text-base font-extrabold tracking-tight text-slate-950 sm:mt-5 sm:text-lg">
          {profile.fullName}
        </h2>

        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          ID : {profile.participantCode}
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

        <div className="mt-4 h-px w-full bg-slate-200 sm:mt-5" />

        <div className="mt-4 grid w-full grid-cols-2 gap-3 text-left sm:mt-5 sm:gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>

            <Badge variant="success" className="mt-2 px-2.5 text-[11px] font-bold">
              {profile.statusLabel}
            </Badge>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Paket
            </p>
            <p className="mt-2 break-words text-sm font-bold text-slate-900">
              {profile.packageName}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
