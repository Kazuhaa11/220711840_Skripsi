import { Pencil, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import type { AdminCoursePackage } from "@/features/admin/constants/coursePackages";

interface CoursePackageDetailModalProps {
  opened: boolean;
  coursePackage: AdminCoursePackage | null;
  onClose: () => void;
  onEdit: (coursePackage: AdminCoursePackage) => void;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function getPriceVariants(coursePackage: AdminCoursePackage) {
  return [
    {
      label: "Tanpa Antar Jemput",
      value: coursePackage.priceNoPickup ?? coursePackage.price,
    },
    {
      label: "Antar Jemput",
      value: coursePackage.pricePickup ?? coursePackage.price,
    },
    {
      label: "Dengan SIM + Tanpa Jemput",
      value: coursePackage.priceSimNoPickup ?? coursePackage.price,
    },
    {
      label: "Dengan SIM + Antar Jemput",
      value: coursePackage.priceSimPickup ?? coursePackage.price,
    },
  ];
}

export default function CoursePackageDetailModal({
  opened,
  coursePackage,
  onClose,
  onEdit,
}: CoursePackageDetailModalProps) {
  if (!coursePackage) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Detail Paket Kursus
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {coursePackage.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {coursePackage.id} • {coursePackage.durationHours} jam
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 w-10 rounded-xl p-0"
              aria-label="Ubah paket kursus"
              onClick={() => onEdit(coursePackage)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className="h-10 w-10 rounded-xl p-0"
              aria-label="Tutup detail paket kursus"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl bg-slate-100 p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                Status
              </p>
              <Badge
                variant={coursePackage.status === "Aktif" ? "success" : "danger"}
                className="mt-3"
              >
                {coursePackage.status}
              </Badge>
            </Card>

            <Card className="rounded-2xl bg-slate-100 p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                Durasi
              </p>
              <p className="mt-3 text-xl font-black text-slate-950">
                {coursePackage.durationHours} jam
              </p>
            </Card>

            <Card className="rounded-2xl bg-slate-100 p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                Harga Mulai
              </p>
              <p className="mt-3 text-lg font-black text-slate-950">
                Rp {formatRupiah(coursePackage.price)}
              </p>
            </Card>
          </div>

          <section className="mt-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
              Varian Harga
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {getPriceVariants(coursePackage).map((item) => (
                <Card
                  key={item.label}
                  className="rounded-2xl bg-slate-50 p-4 shadow-none"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-black text-slate-950">
                    Rp {formatRupiah(item.value)}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
              Deskripsi
            </h3>
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {coursePackage.description}
            </p>
          </section>

        </div>
      </div>
    </Modal>
  );
}
