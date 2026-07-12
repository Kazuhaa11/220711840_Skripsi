import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import type { AdminDigitalCertificate } from "@/features/admin/constants/certificates";
import { adminCertificateStatIcons } from "@/features/admin/constants/certificates";

interface AdminCertificatesStatsProps {
  certificates: AdminDigitalCertificate[];
}

export default function AdminCertificatesStats({
  certificates,
}: AdminCertificatesStatsProps) {
  const issued = certificates.filter((item) => item.status === "Terbit").length;
  const pending = certificates.filter(
    (item) => item.status === "Menunggu Penerbitan",
  ).length;
  const verified = certificates.filter(
    (item) => item.verificationStatus === "Terverifikasi",
  ).length;
  const review = certificates.filter((item) => item.status === "Draft").length;

  const stats: StatsGridItem[] = [
    {
      id: "issued",
      label: "Sertifikat Terbit",
      value: String(issued),
      description: "+12%",
      icon: adminCertificateStatIcons.issued,
      tone: "blue",
    },
    {
      id: "pending",
      label: "Menunggu Penerbitan",
      value: String(pending),
      description: "Peserta lulus",
      icon: adminCertificateStatIcons.pending,
      tone: "slate",
    },
    {
      id: "verified",
      label: "Terverifikasi",
      value: String(verified),
      description: "QR aktif",
      icon: adminCertificateStatIcons.verified,
      tone: "emerald",
    },
    {
      id: "review",
      label: "Perlu Tinjauan",
      value: String(review),
      description: "Draft",
      icon: adminCertificateStatIcons.review,
      tone: "red",
    },
  ];

  return <StatsGrid items={stats} />;
}
