import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "@/app/layouts/PublicLayout";
import AuthLayout from "@/app/layouts/AuthLayout";
import ParticipantLayout from "@/app/layouts/ParticipantLayout";
import AdminLayout from "@/app/layouts/AdminLayout";
import InstructorLayout from "@/app/layouts/InstructorLayout";
import ProtectedRoute from "@/app/router/ProtectedRoute";

import LandingPage from "@/features/public/pages/LandingPage";
import CertificateVerificationPage from "@/features/public/pages/CertificateVerificationPage";

import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import RegisterParticipantPage from "@/features/auth/pages/RegisterParticipantPage";
import RegisterParticipantSuccessPage from "@/features/auth/pages/RegisterParticipantSuccessPage";
import ParticipantDashboardPage from "@/features/participant/pages/ParticipantDashboardPage";
import AvailableSchedulePage from "@/features/participant/pages/AvailableSchedulePage";
import BookingPackageConfirmationPage from "@/features/participant/pages/BookingPackageConfirmationPage";
import MySchedulePage from "@/features/participant/pages/MySchedulePage";
import BookingHistoryPage from "@/features/participant/pages/BookingHistoryPage";
import DigitalCertificatePage from "@/features/participant/pages/DigitalCertificatePage";
import ParticipantProfilePage from "@/features/participant/pages/ParticipantProfilePage";

import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import ManageParticipantsPage from "@/features/admin/pages/ManageParticipantsPage";
import ManageInstructorsPage from "@/features/admin/pages/ManageInstructorsPage";
import ManageVehiclesPage from "@/features/admin/pages/ManageVehiclesPage";
import ManagePackagesPage from "@/features/admin/pages/ManagePackagesPage";
import ManageTimeSlotsPage from "@/features/admin/pages/ManageTimeSlotsPage";
import ManageSchedulesPage from "@/features/admin/pages/ManageSchedulesPage";
import AdminTrainingSchedulePackageDetailPage from "@/features/admin/pages/AdminTrainingSchedulePackageDetailPage";
import AdminBookingsPage from "@/features/admin/pages/AdminBookingsPage";
import TrainingResultsPage from "@/features/admin/pages/TrainingResultsPage";
import ManageCertificatesPage from "@/features/admin/pages/ManageCertificatesPage";
import OperationalReportsPage from "@/features/admin/pages/OperationalReportsPage";
import AdminWhatsAppLogsPage from "@/features/admin/pages/AdminWhatsAppLogsPage";
import AdminProfilePage from "@/features/admin/pages/AdminProfilePage";

import InstructorDashboardPage from "@/features/instructor/pages/InstructorDashboardPage";
import TeachingSchedulePage from "@/features/instructor/pages/TeachingSchedulePage";
import TeachingSchedulePackageDetailPage from "@/features/instructor/pages/TeachingSchedulePackageDetailPage";
import SessionListPage from "@/features/instructor/pages/SessionListPage";
import TrainingResultPage from "@/features/instructor/pages/TrainingResultPage";
import TrainingResultPackageDetailPage from "@/features/instructor/pages/TrainingResultPackageDetailPage";
import InputTrainingResultPage from "@/features/instructor/pages/InputTrainingResultPage";
import InstructorProfilePage from "@/features/instructor/pages/InstructorProfilePage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/paket-kursus", element: <Navigate to="/#paket-kursus" replace /> },
      { path: "/paket-kursus/:id", element: <Navigate to="/#paket-kursus" replace /> },
      { path: "/verifikasi-sertifikat", element: <CertificateVerificationPage /> },
      { path: "/verifikasi-sertifikat/:kode", element: <CertificateVerificationPage /> },
    ],
  },
  {
    element: <ProtectedRoute guestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/reset-password", element: <ResetPassword /> },
          { path: "/register", element: <RegisterParticipantPage /> },
          {
            path: "/register/success",
            element: <RegisterParticipantSuccessPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["peserta"]} />,
    children: [
      {
        path: "/peserta",
        element: <ParticipantLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <ParticipantDashboardPage /> },
          { path: "jadwal-tersedia", element: <AvailableSchedulePage /> },
          { path: "jadwal-tersedia/konfirmasi", element: <BookingPackageConfirmationPage /> },
          { path: "jadwal-saya", element: <MySchedulePage /> },
          { path: "riwayat-booking", element: <BookingHistoryPage /> },
          { path: "sertifikat", element: <DigitalCertificatePage /> },
          { path: "profil", element: <ParticipantProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "peserta", element: <ManageParticipantsPage /> },
          { path: "instruktur", element: <ManageInstructorsPage /> },
          { path: "kendaraan", element: <ManageVehiclesPage /> },
          { path: "paket-kursus", element: <ManagePackagesPage /> },
          { path: "slot-waktu", element: <ManageTimeSlotsPage /> },
          { path: "jadwal-latihan", element: <ManageSchedulesPage /> },
          { path: "jadwal-latihan/:id", element: <AdminTrainingSchedulePackageDetailPage /> },
          { path: "booking", element: <AdminBookingsPage /> },
          { path: "hasil-latihan", element: <TrainingResultsPage /> },
          { path: "sertifikat", element: <ManageCertificatesPage /> },
          { path: "report", element: <OperationalReportsPage /> },
          { path: "notifikasi-whatsapp", element: <AdminWhatsAppLogsPage /> },
          { path: "profil", element: <AdminProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["instruktur"]} />,
    children: [
      {
        path: "/instruktur",
        element: <InstructorLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <InstructorDashboardPage /> },
          { path: "jadwal-mengajar", element: <TeachingSchedulePage /> },
          { path: "jadwal-mengajar/paket/:groupId", element: <TeachingSchedulePackageDetailPage /> },
          { path: "sesi-latihan", element: <SessionListPage /> },
          { path: "hasil-latihan", element: <TrainingResultPage /> },
          { path: "hasil-latihan/paket/:groupId", element: <TrainingResultPackageDetailPage /> },
          { path: "hasil-latihan/input/:id", element: <InputTrainingResultPage /> },
          { path: "profil", element: <InstructorProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
