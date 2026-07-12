import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const navLinks = [
  { href: "#beranda", label: "Beranda", type: "section" },
  { href: "#paket-kursus", label: "Paket Kursus", type: "section" },
  { href: "#alur", label: "Alur Kursus", type: "section" },
  { href: "#sertifikat", label: "Sertifikat", type: "section" },
  { href: "#tentang", label: "Tentang", type: "section" },
  { href: "#kontak", label: "Kontak", type: "section" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHref, setActiveHref] = useState(
    () => window.location.hash || "#beranda",
  );

  useEffect(() => {
    setActiveHref(location.hash || "#beranda");
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHref(window.location.hash || "#beranda");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const getNavClassName = (href: string) =>
    activeHref === href
      ? "text-sm font-medium text-blue-600 underline underline-offset-4"
      : "text-sm font-medium text-slate-600 transition hover:text-slate-950";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          to="/#beranda"
          className="flex items-center gap-3"
          onClick={() => setActiveHref("#beranda")}
        >
          <div className="text-xl font-extrabold tracking-tight text-slate-950">
            SIKEMUDI
          </div>

          <Badge variant="info">LPK YUZZA</Badge>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              to={`/${item.href}`}
              className={getNavClassName(item.href)}
              onClick={() => setActiveHref(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
          Masuk ke Sistem
        </Button>
      </div>
    </header>
  );
}
