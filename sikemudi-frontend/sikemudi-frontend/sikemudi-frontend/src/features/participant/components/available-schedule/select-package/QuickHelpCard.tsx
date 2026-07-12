import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface QuickHelpCardProps {
  title: string;
  description: string;
}

export default function QuickHelpCard({
  title,
  description,
}: QuickHelpCardProps) {
  return (
    <Card className="rounded-3xl p-6 shadow-sm">
      <h3 className="text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <Button className="h-11 rounded-2xl bg-slate-950 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-slate-800">
          Hubungi Admin
        </Button>
      </div>
    </Card>
  );
}
