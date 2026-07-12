import { landingSteps } from "@/features/public/constants/landing";

export default function CourseFlowSection() {
  return (
    <section
      id="alur"
      className="bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 py-14 text-white lg:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          Alur Perjalanan Kursus Anda
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {landingSteps.map((step) => (
            <div key={step.number} className="relative">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
