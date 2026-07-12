import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import {
  CalendarDays,
  CarFront,
  SlidersHorizontal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface BookingHistoryFilterBarProps {
  selectedMonth: string;
  onChangeMonth: (value: string) => void;
  selectedStatus: string;
  onChangeStatus: (value: string) => void;
  selectedInstructor: string;
  onChangeInstructor: (value: string) => void;
  selectedVehicle: string;
  onChangeVehicle: (value: string) => void;
  monthOptions: string[];
  instructorOptions: string[];
  vehicleOptions: string[];
  onReset: () => void;
}

export default function BookingHistoryFilterBar({
  selectedMonth,
  onChangeMonth,
  selectedStatus,
  onChangeStatus,
  selectedInstructor,
  onChangeInstructor,
  selectedVehicle,
  onChangeVehicle,
  monthOptions,
  instructorOptions,
  vehicleOptions,
  onReset,
}: BookingHistoryFilterBarProps) {
  const [filterOpened, setFilterOpened] = useState(false);
  const [draftMonth, setDraftMonth] = useState(selectedMonth);
  const [draftStatus, setDraftStatus] = useState(selectedStatus);
  const [draftInstructor, setDraftInstructor] = useState(selectedInstructor);
  const [draftVehicle, setDraftVehicle] = useState(selectedVehicle);

  useEffect(() => {
    if (!filterOpened) return;
    setDraftMonth(selectedMonth);
    setDraftStatus(selectedStatus);
    setDraftInstructor(selectedInstructor);
    setDraftVehicle(selectedVehicle);
  }, [filterOpened, selectedInstructor, selectedMonth, selectedStatus, selectedVehicle]);

  const statusOptions = [
    { label: "SEMUA STATUS", value: "Semua Status" },
    { label: "SELESAI / SERTIFIKAT TERBIT", value: "SELESAI" },
    { label: "DIBATALKAN", value: "DIBATALKAN" },
    { label: "DITOLAK", value: "DITOLAK" },
  ];
  const monthSelectOptions = [
    { label: "SEMUA BULAN", value: "Semua Bulan" },
    ...monthOptions.map((item) => ({ label: item, value: item })),
  ];
  const instructorSelectOptions = [
    { label: "INSTRUKTUR", value: "Semua Instruktur" },
    ...instructorOptions.map((item) => ({ label: item, value: item })),
  ];
  const vehicleSelectOptions = [
    { label: "KENDARAAN", value: "Semua Kendaraan" },
    ...vehicleOptions.map((item) => ({ label: item, value: item })),
  ];
  const activeFilters = [
    selectedMonth !== "Semua Bulan" ? selectedMonth : null,
    selectedStatus !== "Semua Status" ? selectedStatus : null,
    selectedInstructor !== "Semua Instruktur" ? selectedInstructor : null,
    selectedVehicle !== "Semua Kendaraan" ? selectedVehicle : null,
  ].filter((item): item is string => Boolean(item));

  function handleApplyMobileFilter() {
    onChangeMonth(draftMonth);
    onChangeStatus(draftStatus);
    onChangeInstructor(draftInstructor);
    onChangeVehicle(draftVehicle);
    setFilterOpened(false);
  }

  function handleResetMobileFilter() {
    onReset();
    setDraftMonth("Semua Bulan");
    setDraftStatus("Semua Status");
    setDraftInstructor("Semua Instruktur");
    setDraftVehicle("Semua Kendaraan");
    setFilterOpened(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setFilterOpened(true)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          className="h-10 rounded-full border-slate-200 px-4 text-xs font-bold uppercase tracking-wide text-slate-700"
        >
          Filter
        </Button>

        {activeFilters.length > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-full bg-blue-50 px-4 text-xs font-bold uppercase tracking-wide text-blue-700"
          >
            Reset
          </button>
        ) : null}
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {activeFilters.map((item) => (
            <span
              key={item}
              className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <Modal
        opened={filterOpened}
        onClose={() => setFilterOpened(false)}
        title="Filter Riwayat"
        size="md"
        compact
        className="mt-auto max-h-[88dvh] rounded-b-none sm:mt-0 sm:rounded-3xl"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleResetMobileFilter} className="h-11 rounded-2xl">
              Reset
            </Button>
            <Button onClick={handleApplyMobileFilter} className="h-11 rounded-2xl">
              Terapkan
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <Select
            label="Bulan"
            value={draftMonth}
            onChange={(event) => setDraftMonth(event.target.value)}
            leftIcon={<CalendarDays className="h-4 w-4" />}
            className="h-11 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white"
            options={monthSelectOptions}
          />
          <Select
            label="Status"
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            className="h-11 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white"
            options={statusOptions}
          />
          <Select
            label="Instruktur"
            value={draftInstructor}
            onChange={(event) => setDraftInstructor(event.target.value)}
            leftIcon={<UserRound className="h-4 w-4" />}
            className="h-11 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white"
            options={instructorSelectOptions}
          />
          <Select
            label="Kendaraan"
            value={draftVehicle}
            onChange={(event) => setDraftVehicle(event.target.value)}
            leftIcon={<CarFront className="h-4 w-4" />}
            className="h-11 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white"
            options={vehicleSelectOptions}
          />
        </div>
      </Modal>
    </div>
  );
}
