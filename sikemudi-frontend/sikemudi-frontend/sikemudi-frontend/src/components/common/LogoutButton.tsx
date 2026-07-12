import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/cn";

type LogoutButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type LogoutButtonSize = "sm" | "md" | "lg";

interface LogoutButtonProps {
  label?: string;
  className?: string;
  iconClassName?: string;
  variant?: LogoutButtonVariant;
  size?: LogoutButtonSize;
  fullWidth?: boolean;
  onLoggedOut?: () => void;
}

export default function LogoutButton({
  label = "Keluar",
  className,
  iconClassName,
  variant = "ghost",
  size = "sm",
  fullWidth = false,
  onLoggedOut,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      onLoggedOut?.();
      navigate("/login", { replace: true });
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={isLoggingOut}
      onClick={handleLogout}
      leftIcon={<LogOut className={cn("h-4 w-4", iconClassName)} />}
      className={className}
      aria-label="Keluar dari akun"
    >
      {isLoggingOut ? "Keluar..." : label}
    </Button>
  );
}
