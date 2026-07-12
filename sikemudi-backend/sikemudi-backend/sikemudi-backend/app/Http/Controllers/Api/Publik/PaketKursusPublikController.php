<?php

namespace App\Http\Controllers\Api\Publik;

use App\Http\Controllers\Controller;
use App\Models\CoursePackage;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaketKursusPublikController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $packages = CoursePackage::query()
            ->where('status', 'Aktif')
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_paket', 'like', "%{$keyword}%")
                        ->orWhere('nama_paket', 'like', "%{$keyword}%")
                        ->orWhere('deskripsi', 'like', "%{$keyword}%");
                });
            })
            ->orderBy('durasi_jam')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data paket kursus berhasil diambil.',
            'data' => [
                'items' => $packages
                    ->map(fn(CoursePackage $package) => $this->formatPackage($package))
                    ->values(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $package = CoursePackage::query()
            ->where('status', 'Aktif')
            ->find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket kursus tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail paket kursus berhasil diambil.',
            'data' => [
                'item' => $this->formatPackage($package),
            ],
        ]);
    }

    private function formatPackage(CoursePackage $package): array
    {
        return [
            'id' => $package->id,
            'kode_paket' => $package->kode_paket,
            'nama_paket' => $package->nama_paket,
            'durasi_jam' => (int) $package->durasi_jam,
            'deskripsi' => $package->deskripsi,

            'harga_antar_jemput' => (int) $package->harga_antar_jemput,
            'harga_tidak_antar_jemput' => (int) $package->harga_tidak_antar_jemput,
            'harga_dengan_sim_antar_jemput' => (int) $package->harga_dengan_sim_antar_jemput,
            'harga_dengan_sim_tidak_antar_jemput' => (int) $package->harga_dengan_sim_tidak_antar_jemput,

            'termasuk_sertifikat' => (bool) $package->termasuk_sertifikat,
            'fasilitas' => $package->fasilitas ?? [],
            'status' => $package->status,

            'created_at' => DateFormatter::dateTime($package->created_at),
            'updated_at' => DateFormatter::dateTime($package->updated_at),
        ];
    }
}