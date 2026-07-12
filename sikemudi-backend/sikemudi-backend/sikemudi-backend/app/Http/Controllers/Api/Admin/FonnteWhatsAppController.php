<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\FonnteWhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FonnteWhatsAppController extends Controller
{
    public function __construct(
        private readonly FonnteWhatsAppService $whatsAppService,
    ) {
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Status konfigurasi Fonnte berhasil diambil.',
            'data' => $this->whatsAppService->status(),
        ]);
    }

    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target' => ['required', 'string', 'max:30'],
            'message' => ['nullable', 'string', 'max:1000'],
        ], [
            'target.required' => 'Nomor WhatsApp tujuan wajib diisi.',
        ]);

        $message = $validated['message'] ?? "Tes notifikasi WhatsApp SIKEMUDI berhasil dikirim.\n\nSIKEMUDI";
        $result = $this->whatsAppService->sendMessage($validated['target'], $message);

        return response()->json([
            'success' => (bool) ($result['success'] ?? false),
            'message' => ($result['success'] ?? false)
                ? 'Tes notifikasi WhatsApp berhasil diproses.'
                : (($result['skipped'] ?? false) ? 'Tes notifikasi WhatsApp dilewati.' : 'Tes notifikasi WhatsApp gagal diproses.'),
            'data' => $result,
        ], ($result['success'] ?? false) || ($result['skipped'] ?? false) ? 200 : 500);
    }
}
