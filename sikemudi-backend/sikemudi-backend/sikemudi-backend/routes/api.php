<?php

use App\Http\Controllers\Api\Admin\DashboardAdminController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Admin\PaketKursusController;
use App\Http\Controllers\Api\Admin\SlotWaktuController;
use App\Http\Controllers\Api\Admin\KendaraanController;
use App\Http\Controllers\Api\Admin\InstrukturController;
use App\Http\Controllers\Api\Admin\JadwalLatihanController;
use App\Http\Controllers\Api\Admin\InstructorSlotAssignmentController;
use App\Http\Controllers\Api\Peserta\BookingPesertaController;
use App\Http\Controllers\Api\Peserta\BookingPackagePreviewController;
use App\Http\Controllers\Api\Peserta\BookingPackageStoreController;
use App\Http\Controllers\Api\Peserta\BookingGroupPesertaController;
use App\Http\Controllers\Api\Peserta\TimeSlotPesertaController;
use App\Http\Controllers\Api\Admin\PembayaranBookingController;
use App\Http\Controllers\Api\Instruktur\JadwalMengajarController;
use App\Http\Controllers\Api\Instruktur\HasilLatihanController;
use App\Http\Controllers\Api\Instruktur\SlotAssignmentController;
use App\Http\Controllers\Api\Admin\HasilLatihanAdminController;
use App\Http\Controllers\Api\Admin\SertifikatController;
use App\Http\Controllers\Api\Admin\CertificateTemplateController;
use App\Http\Controllers\Api\Admin\PesertaController as AdminPesertaController;
use App\Http\Controllers\Api\Publik\SertifikatPublikController;
use App\Http\Controllers\Api\Publik\PaketKursusPublikController;
use App\Http\Controllers\Api\Publik\BookingPaymentInvoicePublicController;
use App\Http\Controllers\Api\Instruktur\DashboardInstrukturController;
use App\Http\Controllers\Api\Peserta\DashboardPesertaController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\Peserta\SertifikatPesertaController;
use App\Http\Controllers\Api\Admin\BookingAdminController;
use App\Http\Controllers\Api\Admin\BookingGroupAdminController;
use App\Http\Controllers\Api\Admin\BookingRefundController;
use App\Http\Controllers\Api\Admin\OperationalReportController;
use App\Http\Controllers\Api\Admin\FonnteWhatsAppController;
use App\Http\Controllers\Api\Admin\WhatsAppNotificationLogController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'SIKEMUDI API is running.',
    ]);
});

Route::prefix('publik')->group(function () {
    Route::get('/paket-kursus', [PaketKursusPublikController::class, 'index']);
    Route::get('/paket-kursus/{id}', [PaketKursusPublikController::class, 'show']);
    Route::get('/sertifikat/verifikasi/{kode}', [SertifikatPublikController::class, 'verifikasi']);
    Route::get('/invoice-pembayaran/{kode}/{token}', [BookingPaymentInvoicePublicController::class, 'show'])
        ->name('publik.invoice-pembayaran.show');
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [DashboardAdminController::class, 'index']);

        // Notifikasi WhatsApp Fonnte
        Route::get('/notifikasi-whatsapp/status', [FonnteWhatsAppController::class, 'status']);
        Route::post('/notifikasi-whatsapp/test', [FonnteWhatsAppController::class, 'test']);
        Route::get('/notifikasi-whatsapp/logs', [WhatsAppNotificationLogController::class, 'index']);
        Route::get('/notifikasi-whatsapp/logs/{id}', [WhatsAppNotificationLogController::class, 'show']);
        Route::post('/notifikasi-whatsapp/logs/{id}/retry', [WhatsAppNotificationLogController::class, 'retry']);

        Route::get('/profil', [ProfilController::class, 'show']);
        Route::put('/profil', [ProfilController::class, 'update']);
        Route::post('/profil/foto', [ProfilController::class, 'uploadFotoProfil']);
        Route::delete('/profil/foto', [ProfilController::class, 'hapusFotoProfil']);

        Route::patch('/paket-kursus/{id}/aktifkan', [PaketKursusController::class, 'activate']);
        Route::apiResource('/paket-kursus', PaketKursusController::class);
        Route::patch('/slot-waktu/{id}/aktifkan', [SlotWaktuController::class, 'activate']);
        Route::apiResource('/slot-waktu', SlotWaktuController::class);
        Route::patch('/kendaraan/{id}/aktifkan', [KendaraanController::class, 'activate']);
        Route::apiResource('/kendaraan', KendaraanController::class);
        Route::patch('/instruktur/{id}/aktifkan', [InstrukturController::class, 'activate']);
        Route::apiResource('/instruktur', InstrukturController::class);
        Route::patch('/peserta/{id}/aktifkan', [AdminPesertaController::class, 'activate']);
        Route::apiResource('/peserta', AdminPesertaController::class);
        Route::get('/instruktur-slot/matriks', [InstructorSlotAssignmentController::class, 'matrix']);
        Route::apiResource('/instruktur-slot', InstructorSlotAssignmentController::class);
        Route::get('/jadwal-latihan/instruktur-tersedia', [JadwalLatihanController::class, 'instrukturTersedia']);
        Route::apiResource('/jadwal-latihan', JadwalLatihanController::class);

        // Pembayaran Booking
        Route::get('/pembayaran-booking', [PembayaranBookingController::class, 'index']);
        Route::get('/pembayaran-booking/{id}', [PembayaranBookingController::class, 'show']);
        Route::post('/pembayaran-booking/{id}/konfirmasi', [PembayaranBookingController::class, 'konfirmasi']);
        Route::post('/pembayaran-booking/{id}/tolak', [PembayaranBookingController::class, 'tolak']);

        // Hasil Latihan
        Route::get('/hasil-latihan', [HasilLatihanAdminController::class, 'index']);
        Route::get('/hasil-latihan/{id}', [HasilLatihanAdminController::class, 'show']);
        Route::put('/hasil-latihan/{id}/validasi-kelulusan', [HasilLatihanAdminController::class, 'validasiKelulusan']);

        // Template Sertifikat
        Route::get('/template-sertifikat', [CertificateTemplateController::class, 'index']);
        Route::post('/template-sertifikat', [CertificateTemplateController::class, 'store']);
        Route::get('/template-sertifikat/{id}', [CertificateTemplateController::class, 'show']);
        Route::post('/template-sertifikat/{id}', [CertificateTemplateController::class, 'update']);
        Route::put('/template-sertifikat/{id}', [CertificateTemplateController::class, 'update']);
        Route::patch('/template-sertifikat/{id}/aktifkan', [CertificateTemplateController::class, 'aktifkan']);
        Route::patch('/template-sertifikat/{id}/set-default', [CertificateTemplateController::class, 'setDefault']);
        Route::delete('/template-sertifikat/{id}', [CertificateTemplateController::class, 'destroy']);

        // Sertifikat
        Route::get('/sertifikat/kandidat', [SertifikatController::class, 'kandidat']);
        Route::get('/sertifikat', [SertifikatController::class, 'index']);
        Route::post('/sertifikat/terbitkan', [SertifikatController::class, 'terbitkan']);
        Route::post('/sertifikat/{id}/generate-pdf', [SertifikatController::class, 'generatePdf']);
        Route::get('/sertifikat/{id}/download', [SertifikatController::class, 'download'])->name('admin.sertifikat.download');
        Route::get('/sertifikat/{id}', [SertifikatController::class, 'show']);
        Route::put('/sertifikat/{id}/cabut', [SertifikatController::class, 'cabut']);


        // Laporan operasional
        Route::get('/laporan-operasional/ringkasan', [OperationalReportController::class, 'summary']);
        Route::get('/laporan-operasional/filter-options', [OperationalReportController::class, 'filterOptions']);
        Route::get('/laporan-operasional/pendapatan-kursus', [OperationalReportController::class, 'pendapatanKursus']);
        Route::get('/laporan-operasional/booking-paket', [OperationalReportController::class, 'bookingPaket']);
        Route::get('/laporan-operasional/pemakaian-kendaraan', [OperationalReportController::class, 'pemakaianKendaraan']);
        Route::get('/laporan-operasional/jadwal-instruktur', [OperationalReportController::class, 'jadwalInstruktur']);
        Route::get('/laporan-operasional/progres-peserta', [OperationalReportController::class, 'progresPeserta']);
        Route::get('/laporan-operasional/hasil-latihan', [OperationalReportController::class, 'hasilLatihan']);

        // Booking paket otomatis
        Route::get('/booking-paket', [BookingGroupAdminController::class, 'index']);
        Route::get('/booking-paket/{id}', [BookingGroupAdminController::class, 'show']);
        Route::get('/booking-paket/{id}/bukti-bayar', [BookingGroupAdminController::class, 'buktiBayar'])->name('admin.booking-paket.bukti-bayar');
        Route::post('/booking-paket/{id}/konfirmasi-pembayaran', [BookingGroupAdminController::class, 'konfirmasiPembayaran']);
        Route::post('/booking-paket/{id}/tolak-pembayaran', [BookingGroupAdminController::class, 'tolakPembayaran']);
        Route::post('/booking-paket/{id}/batal', [BookingGroupAdminController::class, 'batal']);

        // Refund booking paket
        Route::get('/refund-booking', [BookingRefundController::class, 'index']);
        Route::get('/refund-booking/{id}', [BookingRefundController::class, 'show']);
        Route::post('/refund-booking/{id}/proses', [BookingRefundController::class, 'proses']);
        Route::post('/refund-booking/{id}/selesaikan', [BookingRefundController::class, 'selesaikan']);
        Route::post('/refund-booking/{id}/tolak', [BookingRefundController::class, 'tolak']);

        // Booking lama per sesi (legacy, jangan dihapus dulu karena masih dipakai fallback/kompatibilitas)
        Route::get('/booking', [BookingAdminController::class, 'index']);
        Route::post('/booking', [BookingAdminController::class, 'store']);
        Route::get('/booking/{id}', [BookingAdminController::class, 'show']);
        Route::get('/booking/{id}/bukti-bayar', [BookingAdminController::class, 'buktiBayar'])->name('admin.booking.bukti-bayar');
        Route::post('/booking/{id}/konfirmasi-pembayaran', [BookingAdminController::class, 'konfirmasiPembayaran']);
        Route::post('/booking/{id}/tolak-pembayaran', [BookingAdminController::class, 'tolakPembayaran']);
        Route::post('/booking/{id}/ubah-jadwal', [BookingAdminController::class, 'ubahJadwal']);
        Route::post('/booking/{id}/batal', [BookingAdminController::class, 'batal']);
    });

Route::middleware(['auth:sanctum', 'role:peserta'])
    ->prefix('peserta')
    ->group(function () {
        Route::get('/dashboard', [DashboardPesertaController::class, 'index']);

        Route::get('/profil', [ProfilController::class, 'show']);
        Route::put('/profil', [ProfilController::class, 'update']);
        Route::post('/profil/foto', [ProfilController::class, 'uploadFotoProfil']);
        Route::delete('/profil/foto', [ProfilController::class, 'hapusFotoProfil']);

        Route::get('/slot-waktu', TimeSlotPesertaController::class);
        Route::post('/booking/preview-jadwal-paket', BookingPackagePreviewController::class);
        Route::post('/booking/preview-sesi-paket', [BookingPesertaController::class, 'previewSesiPaket']);
        Route::post('/booking/paket', BookingPackageStoreController::class);
        Route::get('/booking-paket', [BookingGroupPesertaController::class, 'index']);
        Route::get('/riwayat-booking-paket', [BookingGroupPesertaController::class, 'riwayatPaket']);
        Route::post('/booking-paket/{id}/batal', [BookingGroupPesertaController::class, 'batalPaket']);

        // Booking lama per sesi (legacy, jangan dihapus dulu karena masih dipakai adapter upload/detail dan kompatibilitas)
        Route::get('/jadwal-tersedia', [BookingPesertaController::class, 'jadwalTersedia']);
        Route::get('/booking', [BookingPesertaController::class, 'index']);
        Route::post('/booking', [BookingPesertaController::class, 'store']);
        Route::get('/booking/{id}', [BookingPesertaController::class, 'show']);
        Route::get('/booking/{id}/bukti-bayar', [BookingPesertaController::class, 'buktiBayar'])->name('peserta.booking.bukti-bayar');
        Route::post('/booking/{id}/upload-bukti-bayar', [BookingPesertaController::class, 'uploadBuktiBayar']);
        Route::post('/booking/{id}/rekomendasi-jadwal', [BookingPesertaController::class, 'rekomendasiJadwal']);
        Route::post('/booking/{id}/ubah-jadwal', [BookingPesertaController::class, 'ubahJadwal']);
        Route::post('/booking/{id}/batal', [BookingPesertaController::class, 'batal']);

        // Riwayat lama per sesi (legacy, endpoint utama sekarang /riwayat-booking-paket)
        Route::get('/sertifikat', [SertifikatPesertaController::class, 'index']);
        Route::get('/sertifikat/{id}/download', [SertifikatPesertaController::class, 'download'])->name('peserta.sertifikat.download');
        Route::get('/sertifikat/{id}', [SertifikatPesertaController::class, 'show']);

        Route::get('/riwayat-booking', [BookingPesertaController::class, 'riwayatBooking']);
        Route::get('/riwayat-booking/{id}', [BookingPesertaController::class, 'detailRiwayatBooking']);
    });

Route::middleware(['auth:sanctum', 'role:instruktur'])
    ->prefix('instruktur')
    ->group(function () {
        Route::get('/dashboard', [DashboardInstrukturController::class, 'index']);
        Route::get('/profil', [ProfilController::class, 'show']);
        Route::put('/profil', [ProfilController::class, 'update']);
        Route::post('/profil/foto', [ProfilController::class, 'uploadFotoProfil']);
        Route::delete('/profil/foto', [ProfilController::class, 'hapusFotoProfil']);

        Route::get('/slot-assignment', [SlotAssignmentController::class, 'index']);
        Route::get('/jadwal-mengajar', [JadwalMengajarController::class, 'index']);
        Route::get('/jadwal-mengajar/paket/{id}', [JadwalMengajarController::class, 'showPackage']);
        Route::get('/jadwal-mengajar/{id}', [JadwalMengajarController::class, 'show']);

        Route::get('/hasil-latihan/kandidat', [HasilLatihanController::class, 'kandidat']);
        Route::get('/hasil-latihan', [HasilLatihanController::class, 'index']);
        Route::post('/hasil-latihan', [HasilLatihanController::class, 'store']);
        Route::get('/hasil-latihan/{id}', [HasilLatihanController::class, 'show']);
        Route::put('/hasil-latihan/{id}', [HasilLatihanController::class, 'update']);
    });
