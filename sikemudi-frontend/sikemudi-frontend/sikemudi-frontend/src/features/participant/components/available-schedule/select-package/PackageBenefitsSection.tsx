import type { LucideIcon } from "lucide-react";

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface PackageBenefitsSectionProps {
  items: BenefitItem[];
}

export default function PackageBenefitsSection({
  items,
}: PackageBenefitsSectionProps) {
  return (
    <div className="border-t border-slate-200 pt-10">
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Icon className="h-6 w-6" />
              </div>

              <h4 className="mt-5 text-[1.35rem] font-bold text-slate-950">
                {item.title}
              </h4>

              <p className="mt-3 text-base leading-8 text-slate-600">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
