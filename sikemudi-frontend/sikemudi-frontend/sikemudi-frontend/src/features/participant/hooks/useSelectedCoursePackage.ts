import { useState } from "react";

export interface SelectedCoursePackage {
  id: string;
  name: string;
  duration: string;
  durationHours: number;
  serviceType: string;
  category: string;
  price: string;
  priceValue: number;
  pakaiAntarJemput: boolean;
  pakaiSim: boolean;
}

const STORAGE_KEY = "peserta_selected_course_package";

function isSelectedCoursePackage(value: unknown): value is SelectedCoursePackage {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<SelectedCoursePackage>;

  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.duration === "string" &&
    typeof item.durationHours === "number" &&
    typeof item.price === "string" &&
    typeof item.priceValue === "number" &&
    typeof item.pakaiAntarJemput === "boolean" &&
    typeof item.pakaiSim === "boolean"
  );
}

function getStoredSelectedPackage() {
  const storedValue = sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) return null;

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!isSelectedCoursePackage(parsedValue)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedValue;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useSelectedCoursePackage() {
  const [selectedPackage, setSelectedPackage] =
    useState<SelectedCoursePackage | null>(getStoredSelectedPackage);

  function saveSelectedPackage(coursePackage: SelectedCoursePackage) {
    setSelectedPackage(coursePackage);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coursePackage));
  }

  function clearSelectedPackage() {
    setSelectedPackage(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return {
    selectedPackage,
    saveSelectedPackage,
    clearSelectedPackage,
  };
}
