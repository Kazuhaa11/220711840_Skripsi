import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SidebarItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  end?: boolean;
}

interface SidebarProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  items: SidebarItem[];
  action?: ReactNode;
  onNavigate?: () => void;
  className?: string;
  headerClassName?: string;
  navClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  iconClassName?: string;
}

export default function Sidebar({
  title,
  subtitle,
  items,
  action,
  onNavigate,
  className,
  headerClassName,
  navClassName,
  listClassName,
  itemClassName,
  activeItemClassName,
  inactiveItemClassName,
  iconClassName,
}: SidebarProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {title ? (
        <div className={cn("px-6 pb-4 pt-6", headerClassName)}>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <nav className={cn("flex-1 px-3 py-4", navClassName)}>
        <ul className={cn("space-y-1.5", listClassName)}>
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                      isActive
                        ? cn(
                            "bg-blue-600 text-white shadow-md shadow-blue-600/20",
                            activeItemClassName,
                          )
                        : cn(
                            "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                            inactiveItemClassName,
                          ),
                      itemClassName,
                    )
                  }
                >
                  {Icon ? (
                    <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
                  ) : null}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {action ? <div className="mt-auto px-5 pb-5 pt-3">{action}</div> : null}
    </div>
  );
}
