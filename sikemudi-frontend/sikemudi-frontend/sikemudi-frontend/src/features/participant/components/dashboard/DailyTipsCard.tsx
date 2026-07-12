import Card from "@/components/ui/Card";
import { Lightbulb } from "lucide-react";
import { dailyTip } from "@/features/participant/constants/dashboard";

export default function DailyTipsCard() {
  return (
    <Card className="rounded-3xl px-6 py-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <Lightbulb className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">{dailyTip.title}</h3>
          <p className="mt-3 text-base leading-8 text-slate-600">
            {dailyTip.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
