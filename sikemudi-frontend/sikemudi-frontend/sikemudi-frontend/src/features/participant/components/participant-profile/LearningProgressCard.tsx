import Card from "@/components/ui/Card";
import type { ParticipantProfileData } from "@/features/participant/constants/type";

interface LearningProgressCardProps {
  profile: ParticipantProfileData;
}

export default function LearningProgressCard({
  profile,
}: LearningProgressCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#10244e] via-[#1a2f5e] to-[#213867] p-4 text-white shadow-[0_20px_50px_rgba(16,36,78,0.28)] sm:rounded-3xl sm:p-5">
      <div className="absolute -right-8 bottom-0 opacity-10">
        <svg
          width="180"
          height="120"
          viewBox="0 0 180 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 84L68 40L114 64L154 24"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M154 24L154 62L116 62"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
          Progress Belajar
        </p>

        <div className="mt-3 flex items-end justify-between gap-4 sm:mt-4">
          <p className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {profile.progressPercent}%
          </p>
          <p className="pb-1 text-sm font-semibold text-white/80">
            {profile.completedSessions}/{profile.totalSessions} Sesi
          </p>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15 sm:mt-4 sm:h-3">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${profile.progressPercent}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
