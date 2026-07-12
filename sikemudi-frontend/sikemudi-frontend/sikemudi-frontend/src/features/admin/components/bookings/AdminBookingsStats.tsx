import { CalendarCheck, CheckCircle2, Clock3, WalletCards } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { AdminBookingStatsItem } from "@/types/adminBooking";

const accentClasses: Record<AdminBookingStatsItem["accent"], string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};

const icons = [CalendarCheck, WalletCards, Clock3, CheckCircle2];

interface AdminBookingsStatsProps {
  items: AdminBookingStatsItem[];
}

export default function AdminBookingsStats({ items }: AdminBookingsStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = icons[index] ?? CalendarCheck;

        return (
          <Card key={item.label} className="rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-black text-slate-950">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
              </div>

              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  accentClasses[item.accent],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
