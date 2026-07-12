export type SortDirection = "asc" | "desc";

export type SortValue = string | number | Date | null | undefined;

export type SortPath<T> = keyof T | string | ((item: T) => SortValue);

type SortByLatestDateOptions<T> = {
  direction?: SortDirection;
  fallback?: SortPath<T>;
};

type SortByFieldOptions<T> = {
  direction?: SortDirection;
  fallback?: SortPath<T>;
};

function readByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[key];
  }, source);
}

export function getSortValue<T>(item: T, path: SortPath<T>): SortValue {
  if (typeof path === "function") {
    return path(item);
  }

  const rawValue = readByPath(item, String(path));

  if (
    typeof rawValue === "string" ||
    typeof rawValue === "number" ||
    rawValue instanceof Date ||
    rawValue === null ||
    rawValue === undefined
  ) {
    return rawValue;
  }

  return String(rawValue);
}

export function toTimestamp(value: SortValue): number {
  if (value === null || value === undefined || value === "") return 0;

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getLatestTimestamp<T>(item: T, paths: SortPath<T>[]): number {
  return Math.max(0, ...paths.map((path) => toTimestamp(getSortValue(item, path))));
}

export function sortByLatestDate<T>(
  items: T[],
  paths: SortPath<T>[],
  options: SortByLatestDateOptions<T> = {},
): T[] {
  const direction = options.direction ?? "desc";
  const multiplier = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const dateDiff = getLatestTimestamp(a, paths) - getLatestTimestamp(b, paths);

    if (dateDiff !== 0) {
      return dateDiff * multiplier;
    }

    if (!options.fallback) return 0;

    return compareSortValue(
      getSortValue(a, options.fallback),
      getSortValue(b, options.fallback),
      direction,
    );
  });
}

export function sortByField<T>(
  items: T[],
  path: SortPath<T>,
  options: SortByFieldOptions<T> = {},
): T[] {
  const direction = options.direction ?? "asc";

  return [...items].sort((a, b) => {
    const fieldDiff = compareSortValue(getSortValue(a, path), getSortValue(b, path), direction);

    if (fieldDiff !== 0) return fieldDiff;

    if (!options.fallback) return 0;

    return compareSortValue(
      getSortValue(a, options.fallback),
      getSortValue(b, options.fallback),
      direction,
    );
  });
}

export function sortByNumber<T>(
  items: T[],
  path: SortPath<T>,
  direction: SortDirection = "asc",
): T[] {
  return [...items].sort((a, b) => {
    const firstValue = Number(getSortValue(a, path) ?? 0);
    const secondValue = Number(getSortValue(b, path) ?? 0);

    const first = Number.isFinite(firstValue) ? firstValue : 0;
    const second = Number.isFinite(secondValue) ? secondValue : 0;

    return direction === "asc" ? first - second : second - first;
  });
}

export function sortByText<T>(
  items: T[],
  path: SortPath<T>,
  direction: SortDirection = "asc",
): T[] {
  return [...items].sort((a, b) => {
    const first = String(getSortValue(a, path) ?? "");
    const second = String(getSortValue(b, path) ?? "");
    const result = first.localeCompare(second, "id", { sensitivity: "base" });

    return direction === "asc" ? result : -result;
  });
}

function compareSortValue(
  firstValue: SortValue,
  secondValue: SortValue,
  direction: SortDirection,
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  if (firstValue instanceof Date || secondValue instanceof Date) {
    return (toTimestamp(firstValue) - toTimestamp(secondValue)) * multiplier;
  }

  if (typeof firstValue === "number" || typeof secondValue === "number") {
    const first = Number(firstValue ?? 0);
    const second = Number(secondValue ?? 0);
    return ((Number.isFinite(first) ? first : 0) - (Number.isFinite(second) ? second : 0)) * multiplier;
  }

  const first = String(firstValue ?? "");
  const second = String(secondValue ?? "");

  return first.localeCompare(second, "id", { numeric: true, sensitivity: "base" }) * multiplier;
}
