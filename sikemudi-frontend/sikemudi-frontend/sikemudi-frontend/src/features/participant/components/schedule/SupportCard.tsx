import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Headphones } from "lucide-react";
import { supportInfo } from "@/features/participant/constants/mySchedule";

export default function SupportCard() {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-blue-600">
          <Headphones className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-[1.6rem] font-black tracking-tight text-slate-950">
            {supportInfo.title}
          </h3>
          <p className="mt-2 text-base leading-7 text-slate-600">
            {supportInfo.description}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button
          fullWidth
          variant="outline"
          className="h-11 rounded-xl border-blue-200 text-sm font-bold text-blue-700 hover:bg-blue-50"
        >
          {supportInfo.actionLabel}
        </Button>
      </div>
    </Card>
  );
}
