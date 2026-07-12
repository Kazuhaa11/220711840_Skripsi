<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Services\BookingWhatsAppNotificationService;
use App\Services\BookingPackageCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingPackageStoreController extends Controller
{
    public function __construct(
        private readonly BookingPackageCreationService $creationService,
        private readonly BookingWhatsAppNotificationService $bookingWhatsAppNotificationService,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $participant = Participant::query()
            ->with(['user.role', 'activePackage'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'course_package_id' => ['required', 'exists:course_packages,id'],
            'tanggal_mulai' => ['required', 'date'],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'pakai_antar_jemput' => ['required', 'boolean'],
            'pakai_sim' => ['required', 'boolean'],
            'alamat_jemput' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
            'metode_pembayaran' => ['nullable', 'in:Transfer,Cash'],
            'transmisi' => ['nullable', 'string'],
            'sessions' => ['nullable', 'array'],
            'sessions.*.sesi_ke' => ['required_with:sessions', 'integer', 'min:1'],
            'sessions.*.tanggal_latihan' => ['required_with:sessions', 'date_format:Y-m-d', 'after_or_equal:today'],
            'sessions.*.time_slot_id' => ['required_with:sessions', 'exists:time_slots,id'],
            'sessions.*.target_tanggal_latihan' => ['nullable', 'date_format:Y-m-d'],
            'sessions.*.target_time_slot_id' => ['nullable', 'exists:time_slots,id'],
        ], [
            'course_package_id.required' => 'Paket kursus wajib dipilih.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan.',
            'tanggal_mulai.required' => 'Tanggal mulai latihan wajib diisi.',
            'tanggal_mulai.date' => 'Tanggal mulai latihan tidak valid.',
            'time_slot_id.required' => 'Slot waktu awal wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'pakai_antar_jemput.required' => 'Pilihan antar jemput wajib diisi.',
            'pakai_sim.required' => 'Pilihan layanan SIM wajib diisi.',
            'metode_pembayaran.in' => 'Metode pembayaran harus Transfer atau Cash.',
        ]);

        $result = $this->creationService->create($participant, $validated, $request->user()->id);

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $this->bookingWhatsAppNotificationService->notifyBookingCreated($result['booking_group']);

        $paymentMethod = $result['metode_pembayaran'] ?? ($result['booking_group']?->payment?->metode_pembayaran ?? 'Transfer');
        $message = $paymentMethod === 'Cash'
            ? 'Booking paket berhasil dibuat. Silakan lakukan pembayaran cash ke admin agar booking dapat dikonfirmasi.'
            : 'Booking paket berhasil dibuat. Silakan upload bukti pembayaran agar booking dapat dikonfirmasi admin.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'item' => $this->creationService->formatBookingGroup($result['booking_group']),
            ],
        ], 201);
    }
}
