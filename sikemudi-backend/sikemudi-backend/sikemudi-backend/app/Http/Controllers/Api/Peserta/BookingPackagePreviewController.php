<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Services\BookingPackagePlannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingPackagePreviewController extends Controller
{
    public function __invoke(Request $request, BookingPackagePlannerService $planner): JsonResponse
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
            'course_package_id' => [
                'required',
                Rule::exists('course_packages', 'id')->where('status', 'Aktif'),
            ],
            'tanggal_mulai' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time_slot_id' => [
                'required',
                Rule::exists('time_slots', 'id')->where('status', 'Aktif'),
            ],
            'pakai_antar_jemput' => ['required', 'boolean'],
            'pakai_sim' => ['required', 'boolean'],
            'alamat_jemput' => ['nullable', 'string'],
            'transmisi' => ['nullable', Rule::in(['Manual', 'Otomatis'])],
        ], [
            'course_package_id.required' => 'Paket kursus wajib dipilih.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan atau sedang tidak aktif.',
            'tanggal_mulai.required' => 'Tanggal mulai latihan wajib dipilih.',
            'tanggal_mulai.date_format' => 'Format tanggal mulai harus YYYY-MM-DD.',
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai latihan tidak boleh lebih kecil dari hari ini.',
            'time_slot_id.required' => 'Slot waktu awal wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan atau sedang tidak aktif.',
            'pakai_antar_jemput.required' => 'Pilihan antar jemput wajib diisi.',
            'pakai_sim.required' => 'Pilihan layanan SIM wajib diisi.',
            'transmisi.in' => 'Transmisi kendaraan tidak valid.',
        ]);

        /** @var CoursePackage|null $package */
        $package = CoursePackage::query()
            ->where('status', 'Aktif')
            ->find($validated['course_package_id']);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket kursus tidak ditemukan atau sedang tidak aktif.',
            ], 422);
        }

        $packageValidation = $this->validateParticipantCanPreviewPackage($participant, $package);

        if ($packageValidation) {
            return response()->json([
                'success' => false,
                'message' => $packageValidation['message'],
            ], $packageValidation['status']);
        }

        $preview = $planner->preview($validated);

        if (!($preview['success'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => $preview['message'],
            ], $preview['status'] ?? 422);
        }

        return response()->json([
            'success' => true,
            'message' => $preview['message'],
            'data' => $preview['data'],
        ]);
    }

    private function validateParticipantCanPreviewPackage(Participant $participant, CoursePackage $package): ?array
    {
        $participant->refresh();

        $hasUnfinishedActivePackage = $participant->paket_aktif_id
            && (int) $participant->paket_aktif_id !== (int) $package->id
            && (int) $participant->jumlah_sesi_total > 0
            && (int) $participant->jumlah_sesi_selesai < (int) $participant->jumlah_sesi_total;

        if ($hasUnfinishedActivePackage) {
            return [
                'status' => 409,
                'message' => 'Anda masih memiliki paket aktif yang belum selesai. Paket aktif harus diselesaikan sebelum mengambil paket berbeda.',
            ];
        }

        $hasDifferentActiveBookingPackage = Booking::query()
            ->where('participant_id', $participant->id)
            ->where('course_package_id', '!=', $package->id)
            ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
            ->exists();

        if ($hasDifferentActiveBookingPackage) {
            return [
                'status' => 409,
                'message' => 'Anda masih memiliki booking aktif pada paket berbeda. Selesaikan atau batalkan booking tersebut sebelum memilih paket lain.',
            ];
        }

        return null;
    }
}
