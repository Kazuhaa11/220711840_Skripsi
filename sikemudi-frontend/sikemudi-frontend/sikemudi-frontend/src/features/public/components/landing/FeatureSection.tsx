import Card from "@/components/ui/Card";
import { landingFeatures } from "@/features/public/constants/landing";

export default function FeatureSection() {
  return (
    <section id="fitur" className="py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 xl:grid-cols-3 lg:px-8">
        {landingFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-slate-950">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
