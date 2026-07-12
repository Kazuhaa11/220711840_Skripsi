import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  label?: ReactNode;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationBar({
  currentPage,
  totalPages,
  label,
  onPageChange,
  className,
}: PaginationBarProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <>
      {label ? (
        <p className="text-sm font-medium text-slate-600">{label}</p>
      ) : (
        <span aria-hidden="true" />
      )}

      <div className={cn("flex items-center gap-2", className)}>
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outline"}
            size="sm"
            className={cn(
              "h-10 w-10 rounded-xl p-0",
              page === currentPage && "bg-slate-950 hover:bg-slate-800",
            )}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}
      </div>
    </>
  );
}
