<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoursePackage;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaketKursusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $packages = CoursePackage::query()
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_paket', 'like', "%{$keyword}%")
                        ->orWhere('nama_paket', 'like', "%{$keyword}%")
                        ->orWhere('deskripsi', 'like', "%{$keyword}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data paket kursus berhasil diambil.',
            'data' => [
                'items' => collect($packages->items())
                    ->map(fn(CoursePackage $package) => $this->formatPackage($package))
                    ->values(),
                'pagination' => [
                    'current_page' => $packages->currentPage(),
                    'last_page' => $packages->lastPage(),
                    'per_page' => $packages->perPage(),
                    'total' => $packages->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_paket' => ['nullable', 'string', 'max:30', 'unique:course_packages,kode_paket'],
            'nama_paket' => ['required', 'string', 'max:150'],
            'durasi_jam' => ['required', 'integer', 'min:1', 'max:100'],
            'deskripsi' => ['nullable', 'string'],

            'harga_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_tidak_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_dengan_sim_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_dengan_sim_tidak_antar_jemput' => ['required', 'numeric', 'min:0'],

            'termasuk_sertifikat' => ['nullable', 'boolean'],
            'fasilitas' => ['nullable', 'array'],
            'fasilitas.*' => ['string', 'max:255'],

            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
        ], [
            'nama_paket.required' => 'Nama paket kursus wajib diisi.',
            'durasi_jam.required' => 'Durasi jam wajib diisi.',
            'durasi_jam.integer' => 'Durasi jam harus berupa angka.',
            'harga_antar_jemput.required' => 'Harga antar jemput wajib diisi.',
            'harga_tidak_antar_jemput.required' => 'Harga tidak antar jemput wajib diisi.',
            'harga_dengan_sim_antar_jemput.required' => 'Harga dengan SIM antar jemput wajib diisi.',
            'harga_dengan_sim_tidak_antar_jemput.required' => 'Harga dengan SIM tidak antar jemput wajib diisi.',
            'status.required' => 'Status paket wajib diisi.',
            'status.in' => 'Status paket tidak valid.',
        ]);

        $package = CoursePackage::create([
            'kode_paket' => filled($validated['kode_paket'] ?? null)
                ? $validated['kode_paket']
                : $this->generatePackageCode((int) $validated['durasi_jam']),
            'nama_paket' => $validated['nama_paket'],
            'durasi_jam' => $validated['durasi_jam'],
            'deskripsi' => $validated['deskripsi'] ?? null,

            'harga_antar_jemput' => $validated['harga_antar_jemput'],
            'harga_tidak_antar_jemput' => $validated['harga_tidak_antar_jemput'],
            'harga_dengan_sim_antar_jemput' => $validated['harga_dengan_sim_antar_jemput'],
            'harga_dengan_sim_tidak_antar_jemput' => $validated['harga_dengan_sim_tidak_antar_jemput'],

            'termasuk_sertifikat' => $validated['termasuk_sertifikat'] ?? true,
            'fasilitas' => $validated['fasilitas'] ?? [],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paket kursus berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatPackage($package),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $package = CoursePackage::find($id);

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

    public function update(Request $request, string $id): JsonResponse
    {
        $package = CoursePackage::find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket kursus tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'kode_paket' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('course_packages', 'kode_paket')->ignore($package->id),
            ],
            'nama_paket' => ['required', 'string', 'max:150'],
            'durasi_jam' => ['required', 'integer', 'min:1', 'max:100'],
            'deskripsi' => ['nullable', 'string'],

            'harga_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_tidak_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_dengan_sim_antar_jemput' => ['required', 'numeric', 'min:0'],
            'harga_dengan_sim_tidak_antar_jemput' => ['required', 'numeric', 'min:0'],

            'termasuk_sertifikat' => ['nullable', 'boolean'],
            'fasilitas' => ['nullable', 'array'],
            'fasilitas.*' => ['string', 'max:255'],

            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
        ], [
            'nama_paket.required' => 'Nama paket kursus wajib diisi.',
            'durasi_jam.required' => 'Durasi jam wajib diisi.',
            'durasi_jam.integer' => 'Durasi jam harus berupa angka.',
            'harga_antar_jemput.required' => 'Harga antar jemput wajib diisi.',
            'harga_tidak_antar_jemput.required' => 'Harga tidak antar jemput wajib diisi.',
            'harga_dengan_sim_antar_jemput.required' => 'Harga dengan SIM antar jemput wajib diisi.',
            'harga_dengan_sim_tidak_antar_jemput.required' => 'Harga dengan SIM tidak antar jemput wajib diisi.',
            'status.required' => 'Status paket wajib diisi.',
            'status.in' => 'Status paket tidak valid.',
        ]);

        $package->update([
            'kode_paket' => filled($validated['kode_paket'] ?? null)
                ? $validated['kode_paket']
                : $package->kode_paket,
            'nama_paket' => $validated['nama_paket'],
            'durasi_jam' => $validated['durasi_jam'],
            'deskripsi' => $validated['deskripsi'] ?? null,

            'harga_antar_jemput' => $validated['harga_antar_jemput'],
            'harga_tidak_antar_jemput' => $validated['harga_tidak_antar_jemput'],
            'harga_dengan_sim_antar_jemput' => $validated['harga_dengan_sim_antar_jemput'],
            'harga_dengan_sim_tidak_antar_jemput' => $validated['harga_dengan_sim_tidak_antar_jemput'],

            'termasuk_sertifikat' => $validated['termasuk_sertifikat'] ?? true,
            'fasilitas' => $validated['fasilitas'] ?? [],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paket kursus berhasil diperbarui.',
            'data' => [
                'item' => $this->formatPackage($package->fresh()),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $package = CoursePackage::find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket kursus tidak ditemukan.',
            ], 404);
        }

        if ($package->status === 'Nonaktif') {
            return response()->json([
                'success' => true,
                'message' => 'Paket kursus sudah dalam status nonaktif.',
                'data' => [
                    'item' => $this->formatPackage($package),
                ],
            ]);
        }

        $package->update([
            'status' => 'Nonaktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paket kursus berhasil dinonaktifkan. Riwayat peserta, booking, jadwal, pembayaran, dan sertifikat lama tetap tersimpan.',
            'data' => [
                'item' => $this->formatPackage($package->fresh()),
            ],
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        $package = CoursePackage::find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket kursus tidak ditemukan.',
            ], 404);
        }

        if ($package->status === 'Aktif') {
            return response()->json([
                'success' => true,
                'message' => 'Paket kursus sudah dalam status aktif.',
                'data' => [
                    'item' => $this->formatPackage($package),
                ],
            ]);
        }

        $package->update([
            'status' => 'Aktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paket kursus berhasil diaktifkan kembali.',
            'data' => [
                'item' => $this->formatPackage($package->fresh()),
            ],
        ]);
    }

    private function generatePackageCode(int $durationHours): string
    {
        $baseCode = 'PKT-' . str_pad((string) $durationHours, 3, '0', STR_PAD_LEFT);

        if (!CoursePackage::where('kode_paket', $baseCode)->exists()) {
            return $baseCode;
        }

        $counter = 2;

        do {
            $code = $baseCode . '-' . str_pad((string) $counter, 2, '0', STR_PAD_LEFT);
            $counter++;
        } while (CoursePackage::where('kode_paket', $code)->exists());

        return $code;
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
