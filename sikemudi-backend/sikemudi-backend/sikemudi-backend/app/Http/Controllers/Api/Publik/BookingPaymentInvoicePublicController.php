<?php

namespace App\Http\Controllers\Api\Publik;

use App\Http\Controllers\Controller;
use App\Models\BookingGroup;
use App\Services\BookingPaymentInvoicePdfService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookingPaymentInvoicePublicController extends Controller
{
    public function show(string $kode, string $token, BookingPaymentInvoicePdfService $invoicePdfService): BinaryFileResponse
    {
        abort_unless(hash_equals($invoicePdfService->tokenForCode($kode), $token), 404);

        /** @var BookingGroup $group */
        $group = BookingGroup::query()
            ->with(['payment'])
            ->where('kode_group', $kode)
            ->firstOrFail();

        abort_unless($group->payment?->status === 'Terkonfirmasi', 404);

        $invoice = $invoicePdfService->ensureGenerated($group);
        $filename = $invoice['filename'] ?: ('invoice-' . $kode . '.pdf');

        return response()->file($invoice['path'], [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
