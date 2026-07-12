import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

interface BookingRuleItem {
  icon: LucideIcon;
  text: string;
}

interface BookingRulesCardProps {
  items: BookingRuleItem[];
}

export default function BookingRulesCard({ items }: BookingRulesCardProps) {
  return (
    <Card className="rounded-[26px] bg-[linear-gradient(180deg,#0d214f_0%,#152c63_100%)] p-5 text-white shadow-sm">
      <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
        Aturan Booking Sesi
      </h3>

      <div className="mt-6 space-y-5">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <Icon className="h-4 w-4" />
              </div>

              <p className="text-sm leading-7 text-slate-100">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
