import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  fallback?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
}

function getInitials(name?: string | null, fallback = "U"): string {
  const initials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || fallback;
}

export default function UserAvatar({
  src,
  name,
  fallback = "U",
  alt,
  className,
  imageClassName,
  iconClassName,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = useMemo(() => getInitials(name, fallback), [fallback, name]);
  const shouldShowImage = Boolean(src) && !imageFailed;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-slate-950 font-bold text-white",
        className,
      )}
    >
      {shouldShowImage ? (
        <img
          src={src ?? undefined}
          alt={alt ?? name ?? "Foto profil"}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : initials ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <UserRound className={cn("h-1/2 w-1/2", iconClassName)} />
      )}
    </div>
  );
}
