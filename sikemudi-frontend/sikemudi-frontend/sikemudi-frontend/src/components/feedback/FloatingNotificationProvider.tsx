import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type FloatingNotificationType = "success" | "error" | "warning" | "info";

interface FloatingNotificationPayload {
  type?: FloatingNotificationType;
  title?: string;
  message: string;
  duration?: number;
}

interface FloatingNotificationItem extends Required<FloatingNotificationPayload> {
  id: string;
}

interface FloatingNotificationContextValue {
  showNotification: (payload: FloatingNotificationPayload) => string;
  closeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const DEFAULT_DURATION = 3000;
const MAX_VISIBLE_NOTIFICATIONS = 3;

const FloatingNotificationContext = createContext<
  FloatingNotificationContextValue | undefined
>(undefined);

const notificationStyle: Record<
  FloatingNotificationType,
  {
    icon: typeof CheckCircle2;
    title: string;
    wrapper: string;
    iconBox: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    title: "Berhasil",
    wrapper: "border-emerald-200 bg-white text-emerald-900 shadow-emerald-950/10",
    iconBox: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    title: "Gagal",
    wrapper: "border-red-200 bg-white text-red-900 shadow-red-950/10",
    iconBox: "bg-red-50",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    title: "Perhatian",
    wrapper: "border-amber-200 bg-white text-amber-900 shadow-amber-950/10",
    iconBox: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    title: "Informasi",
    wrapper: "border-blue-200 bg-white text-blue-900 shadow-blue-950/10",
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
  },
};

function createNotificationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface FloatingNotificationProviderProps {
  children: ReactNode;
}

export function FloatingNotificationProvider({
  children,
}: FloatingNotificationProviderProps) {
  const [notifications, setNotifications] = useState<FloatingNotificationItem[]>([]);
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const closeNotification = useCallback((id: string) => {
    const timeout = timeoutRefs.current[id];

    if (timeout) {
      clearTimeout(timeout);
      delete timeoutRefs.current[id];
    }

    setNotifications((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    (payload: FloatingNotificationPayload) => {
      const id = createNotificationId();
      const type = payload.type ?? "info";
      const duration = payload.duration ?? DEFAULT_DURATION;
      const notification: FloatingNotificationItem = {
        id,
        type,
        title: payload.title ?? notificationStyle[type].title,
        message: payload.message,
        duration,
      };

      setNotifications((previous) =>
        [notification, ...previous].slice(0, MAX_VISIBLE_NOTIFICATIONS),
      );

      if (duration > 0) {
        timeoutRefs.current[id] = setTimeout(() => {
          closeNotification(id);
        }, duration);
      }

      return id;
    },
    [closeNotification],
  );

  const clearNotifications = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ showNotification, closeNotification, clearNotifications }),
    [clearNotifications, closeNotification, showNotification],
  );

  return (
    <FloatingNotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {notifications.map((notification) => {
          const style = notificationStyle[notification.type];
          const Icon = style.icon;

          return (
            <div
              key={notification.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-200",
                style.wrapper,
              )}
              role="status"
            >
              <div
                className={cn(
                  "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  style.iconBox,
                )}
              >
                <Icon className={cn("h-5 w-5", style.iconColor)} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold tracking-tight text-slate-950">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm font-medium leading-5 text-slate-600">
                  {notification.message}
                </p>
              </div>

              <button
                type="button"
                aria-label="Tutup notifikasi"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => closeNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </FloatingNotificationContext.Provider>
  );
}

export function useFloatingNotification() {
  const context = useContext(FloatingNotificationContext);

  if (!context) {
    throw new Error(
      "useFloatingNotification harus digunakan di dalam FloatingNotificationProvider.",
    );
  }

  return context;
}
