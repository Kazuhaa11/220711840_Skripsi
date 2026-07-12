import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { Info } from "lucide-react";

interface ImportantInfoItem {
  icon: LucideIcon;
  text: string;
}

interface ImportantInfoCardProps {
  items: ImportantInfoItem[];
}

export default function ImportantInfoCard({ items }: ImportantInfoCardProps) {
  return (
    <Card className="rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Info className="h-6 w-6 text-blue-600" />
        <h3 className="text-[1.2rem] font-bold uppercase tracking-[0.14em] text-slate-950">
          Informasi Penting
        </h3>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex items-start gap-4">
              <Icon className="mt-1 h-5 w-5 text-blue-600" />
              <p className="text-base leading-8 text-slate-600">{item.text}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
