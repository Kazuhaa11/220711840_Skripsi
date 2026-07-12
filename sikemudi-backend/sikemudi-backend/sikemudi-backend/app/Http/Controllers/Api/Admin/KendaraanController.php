<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KendaraanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $vehicles = Vehicle::query()
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_kendaraan', 'like', "%{$keyword}%")
                        ->orWhere('nama_kendaraan', 'like', "%{$keyword}%")
                        ->orWhere('model', 'like', "%{$keyword}%")
                        ->orWhere('nomor_plat', 'like', "%{$keyword}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('ketersediaan'), function ($query) use ($request) {
                $query->where('ketersediaan', $request->query('ketersediaan'));
            })
            ->when($request->filled('transmisi'), function ($query) use ($request) {
                $query->where('transmisi', $request->query('transmisi'));
            })
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data kendaraan berhasil diambil.',
            'data' => [
                'items' => collect($vehicles->items())
                    ->map(fn(Vehicle $vehicle) => $this->formatVehicle($vehicle))
                    ->values(),
                'pagination' => [
                    'current_page' => $vehicles->currentPage(),
                    'last_page' => $vehicles->lastPage(),
                    'per_page' => $vehicles->perPage(),
                    'total' => $vehicles->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_kendaraan' => ['nullable', 'string', 'max:40', 'unique:vehicles,kode_kendaraan'],
            'nama_kendaraan' => ['required', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:120'],
            'nomor_plat' => ['required', 'string', 'max:30', 'unique:vehicles,nomor_plat'],

            'transmisi' => ['required', Rule::in(['Manual', 'Otomatis'])],
            'status' => ['required', Rule::in(['Aktif', 'Servis', 'Nonaktif'])],
            'ketersediaan' => ['required', Rule::in(['Tersedia', 'Maintenance', 'Sedang Latihan'])],

            'digunakan_hari_ini' => ['nullable', 'integer', 'min:0'],
            'kilometer_servis_terakhir' => ['nullable', 'integer', 'min:0'],

            'status_asuransi' => ['nullable', 'string', 'max:50'],
            'status_stnk' => ['nullable', 'string', 'max:50'],
            'catatan' => ['nullable', 'string'],
            'foto_kendaraan' => ['nullable', 'string'],
        ], [
            'nama_kendaraan.required' => 'Nama kendaraan wajib diisi.',
            'nomor_plat.required' => 'Nomor plat wajib diisi.',
            'nomor_plat.unique' => 'Nomor plat sudah digunakan.',
            'transmisi.required' => 'Transmisi wajib diisi.',
            'transmisi.in' => 'Transmisi tidak valid.',
            'status.required' => 'Status kendaraan wajib diisi.',
            'status.in' => 'Status kendaraan tidak valid.',
            'ketersediaan.required' => 'Ketersediaan kendaraan wajib diisi.',
            'ketersediaan.in' => 'Ketersediaan kendaraan tidak valid.',
        ]);

        $vehicle = Vehicle::create([
            'kode_kendaraan' => filled($validated['kode_kendaraan'] ?? null)
                ? $validated['kode_kendaraan']
                : $this->generateVehicleCode(),
            'nama_kendaraan' => $validated['nama_kendaraan'],
            'model' => $validated['model'] ?? null,
            'nomor_plat' => strtoupper($validated['nomor_plat']),

            'transmisi' => $validated['transmisi'],
            'status' => $validated['status'],
            'ketersediaan' => $validated['ketersediaan'],

            'digunakan_hari_ini' => $validated['digunakan_hari_ini'] ?? 0,
            'kilometer_servis_terakhir' => $validated['kilometer_servis_terakhir'] ?? 0,

            'status_asuransi' => $validated['status_asuransi'] ?? 'Aktif',
            'status_stnk' => $validated['status_stnk'] ?? 'Aktif',
            'catatan' => $validated['catatan'] ?? null,
            'foto_kendaraan' => $validated['foto_kendaraan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatVehicle($vehicle),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kendaraan berhasil diambil.',
            'data' => [
                'item' => $this->formatVehicle($vehicle),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'kode_kendaraan' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('vehicles', 'kode_kendaraan')->ignore($vehicle->id),
            ],
            'nama_kendaraan' => ['required', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:120'],
            'nomor_plat' => [
                'required',
                'string',
                'max:30',
                Rule::unique('vehicles', 'nomor_plat')->ignore($vehicle->id),
            ],

            'transmisi' => ['required', Rule::in(['Manual', 'Otomatis'])],
            'status' => ['required', Rule::in(['Aktif', 'Servis', 'Nonaktif'])],
            'ketersediaan' => ['required', Rule::in(['Tersedia', 'Maintenance', 'Sedang Latihan'])],

            'digunakan_hari_ini' => ['nullable', 'integer', 'min:0'],
            'kilometer_servis_terakhir' => ['nullable', 'integer', 'min:0'],

            'status_asuransi' => ['nullable', 'string', 'max:50'],
            'status_stnk' => ['nullable', 'string', 'max:50'],
            'catatan' => ['nullable', 'string'],
            'foto_kendaraan' => ['nullable', 'string'],
        ], [
            'nama_kendaraan.required' => 'Nama kendaraan wajib diisi.',
            'nomor_plat.required' => 'Nomor plat wajib diisi.',
            'nomor_plat.unique' => 'Nomor plat sudah digunakan.',
            'transmisi.required' => 'Transmisi wajib diisi.',
            'transmisi.in' => 'Transmisi tidak valid.',
            'status.required' => 'Status kendaraan wajib diisi.',
            'status.in' => 'Status kendaraan tidak valid.',
            'ketersediaan.required' => 'Ketersediaan kendaraan wajib diisi.',
            'ketersediaan.in' => 'Ketersediaan kendaraan tidak valid.',
        ]);

        $vehicle->update([
            'kode_kendaraan' => filled($validated['kode_kendaraan'] ?? null)
                ? $validated['kode_kendaraan']
                : $vehicle->kode_kendaraan,
            'nama_kendaraan' => $validated['nama_kendaraan'],
            'model' => $validated['model'] ?? $vehicle->model,
            'nomor_plat' => strtoupper($validated['nomor_plat']),

            'transmisi' => $validated['transmisi'],
            'status' => $validated['status'],
            'ketersediaan' => $validated['ketersediaan'],

            'digunakan_hari_ini' => $validated['digunakan_hari_ini'] ?? $vehicle->digunakan_hari_ini ?? 0,
            'kilometer_servis_terakhir' => $validated['kilometer_servis_terakhir'] ?? $vehicle->kilometer_servis_terakhir ?? 0,

            'status_asuransi' => $validated['status_asuransi'] ?? $vehicle->status_asuransi ?? 'Aktif',
            'status_stnk' => $validated['status_stnk'] ?? $vehicle->status_stnk ?? 'Aktif',
            'catatan' => array_key_exists('catatan', $validated) ? $validated['catatan'] : $vehicle->catatan,
            'foto_kendaraan' => $validated['foto_kendaraan'] ?? $vehicle->foto_kendaraan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil diperbarui.',
            'data' => [
                'item' => $this->formatVehicle($vehicle->fresh()),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan tidak ditemukan.',
            ], 404);
        }

        if ($vehicle->status === 'Nonaktif') {
            return response()->json([
                'success' => true,
                'message' => 'Kendaraan sudah dalam status nonaktif.',
                'data' => [
                    'item' => $this->formatVehicle($vehicle),
                ],
            ]);
        }

        $vehicle->update([
            'status' => 'Nonaktif',
            'ketersediaan' => 'Maintenance',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil dinonaktifkan. Data jadwal, booking, dan laporan lama tetap tersimpan.',
            'data' => [
                'item' => $this->formatVehicle($vehicle->fresh()),
            ],
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan tidak ditemukan.',
            ], 404);
        }

        if ($vehicle->status === 'Aktif') {
            return response()->json([
                'success' => true,
                'message' => 'Kendaraan sudah dalam status aktif.',
                'data' => [
                    'item' => $this->formatVehicle($vehicle),
                ],
            ]);
        }

        $vehicle->update([
            'status' => 'Aktif',
            'ketersediaan' => 'Tersedia',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil diaktifkan kembali.',
            'data' => [
                'item' => $this->formatVehicle($vehicle->fresh()),
            ],
        ]);
    }

    private function generateVehicleCode(): string
    {
        $lastVehicle = Vehicle::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastVehicle ? $lastVehicle->id + 1 : 1;

        return 'KDR-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    private function formatVehicle(Vehicle $vehicle): array
    {
        return [
            'id' => $vehicle->id,
            'kode_kendaraan' => $vehicle->kode_kendaraan,
            'nama_kendaraan' => $vehicle->nama_kendaraan,
            'model' => $vehicle->model,
            'nomor_plat' => $vehicle->nomor_plat,

            'transmisi' => $vehicle->transmisi,
            'status' => $vehicle->status,
            'ketersediaan' => $vehicle->ketersediaan,

            'digunakan_hari_ini' => (int) $vehicle->digunakan_hari_ini,
            'kilometer_servis_terakhir' => (int) $vehicle->kilometer_servis_terakhir,

            'status_asuransi' => $vehicle->status_asuransi,
            'status_stnk' => $vehicle->status_stnk,
            'catatan' => $vehicle->catatan,
            'foto_kendaraan' => $vehicle->foto_kendaraan,

            'created_at' => $vehicle->created_at?->toDateTimeString(),
            'updated_at' => $vehicle->updated_at?->toDateTimeString(),
        ];
    }
}
