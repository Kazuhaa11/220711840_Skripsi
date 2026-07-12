<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Support\PasswordRule;
use App\Support\DateFormatter;

class InstrukturController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $instructors = Instructor::query()
            ->with('user.role')
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_instruktur', 'like', "%{$keyword}%")
                        ->orWhere('jabatan', 'like', "%{$keyword}%")
                        ->orWhere('spesialisasi', 'like', "%{$keyword}%")
                        ->orWhereHas('user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('status_jadwal'), function ($query) use ($request) {
                $query->where('status_jadwal', $request->query('status_jadwal'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data instruktur berhasil diambil.',
            'data' => [
                'items' => collect($instructors->items())
                    ->map(fn(Instructor $instructor) => $this->formatInstructor($instructor))
                    ->values(),
                'pagination' => [
                    'current_page' => $instructors->currentPage(),
                    'last_page' => $instructors->lastPage(),
                    'per_page' => $instructors->perPage(),
                    'total' => $instructors->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::strong()],
            'no_telepon' => ['required', 'string', 'max:30', 'unique:users,no_telepon'],
            'alamat' => ['nullable', 'string'],
            'foto_profil' => ['nullable', 'string'],

            'kode_instruktur' => ['nullable', 'string', 'max:40', 'unique:instructors,kode_instruktur'],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'spesialisasi' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif', 'Cuti'])],
            'status_jadwal' => ['required', Rule::in(['Mengajar', 'Terjadwal', 'Libur / Cuti'])],
            'tanggal_bergabung' => ['nullable', 'date'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'total_sesi' => ['nullable', 'integer', 'min:0'],
            'tingkat_kelulusan' => ['nullable', 'integer', 'min:0', 'max:100'],
        ], [
            'name.required' => 'Nama instruktur wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'status.required' => 'Status instruktur wajib diisi.',
            'status.in' => 'Status instruktur tidak valid.',
            'status_jadwal.required' => 'Status jadwal wajib diisi.',
            'status_jadwal.in' => 'Status jadwal tidak valid.',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $instructorRole = Role::where('slug', 'instruktur')->firstOrFail();

            $user = User::create([
                'role_id' => $instructorRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'no_telepon' => $validated['no_telepon'],
                'alamat' => $validated['alamat'] ?? null,
                'status_akun' => 'Aktif',
                'foto_profil' => $validated['foto_profil'] ?? null,
            ]);

            $instructor = Instructor::create([
                'user_id' => $user->id,
                'kode_instruktur' => $validated['kode_instruktur'] ?? $this->generateInstructorCode(),
                'jabatan' => $validated['jabatan'] ?? 'Instruktur Mengemudi',
                'spesialisasi' => $validated['spesialisasi'] ?? null,
                'status' => $validated['status'],
                'status_jadwal' => $validated['status_jadwal'],
                'tanggal_bergabung' => $validated['tanggal_bergabung'] ?? now()->toDateString(),
                'rating' => $validated['rating'] ?? 0,
                'total_sesi' => $validated['total_sesi'] ?? 0,
                'tingkat_kelulusan' => $validated['tingkat_kelulusan'] ?? 0,
            ]);

            $instructor->load('user.role');

            return $instructor;
        });

        return response()->json([
            'success' => true,
            'message' => 'Instruktur berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatInstructor($result),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $instructor = Instructor::with('user.role')->find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instruktur tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail instruktur berhasil diambil.',
            'data' => [
                'item' => $this->formatInstructor($instructor),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $instructor = Instructor::with('user')->find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instruktur tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($instructor->user_id),
            ],
            'password' => ['nullable', 'confirmed', PasswordRule::strong()],
            'no_telepon' => [
                'required',
                'string',
                'max:30',
                Rule::unique('users', 'no_telepon')->ignore($instructor->user_id),
            ],
            'alamat' => ['nullable', 'string'],
            'foto_profil' => ['nullable', 'string'],
            'status_akun' => ['required', Rule::in(['Aktif', 'Verifikasi', 'Nonaktif'])],

            'kode_instruktur' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('instructors', 'kode_instruktur')->ignore($instructor->id),
            ],
            'jabatan' => ['nullable', 'string', 'max:100'],
            'spesialisasi' => ['nullable', 'string', 'max:150'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif', 'Cuti'])],
            'status_jadwal' => ['required', Rule::in(['Mengajar', 'Terjadwal', 'Libur / Cuti'])],
            'tanggal_bergabung' => ['nullable', 'date'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'total_sesi' => ['nullable', 'integer', 'min:0'],
            'tingkat_kelulusan' => ['nullable', 'integer', 'min:0', 'max:100'],
        ], [
            'name.required' => 'Nama instruktur wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'status_akun.required' => 'Status akun wajib diisi.',
            'status_akun.in' => 'Status akun tidak valid.',
            'status.required' => 'Status instruktur wajib diisi.',
            'status.in' => 'Status instruktur tidak valid.',
            'status_jadwal.required' => 'Status jadwal wajib diisi.',
            'status_jadwal.in' => 'Status jadwal tidak valid.',
        ]);

        $updatedInstructor = DB::transaction(function () use ($validated, $instructor) {
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'no_telepon' => $validated['no_telepon'],
                'alamat' => $validated['alamat'] ?? null,
                'status_akun' => $validated['status_akun'],
                'foto_profil' => $validated['foto_profil'] ?? null,
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $instructor->user->update($userData);

            $instructor->update([
                'kode_instruktur' => filled($validated['kode_instruktur'] ?? null)
                    ? $validated['kode_instruktur']
                    : $instructor->kode_instruktur,
                'jabatan' => filled($validated['jabatan'] ?? null)
                    ? $validated['jabatan']
                    : ($instructor->jabatan ?: 'Instruktur Mengemudi'),
                'spesialisasi' => $validated['spesialisasi'] ?? $instructor->spesialisasi,
                'status' => $validated['status'],
                'status_jadwal' => $validated['status_jadwal'],
                'tanggal_bergabung' => $validated['tanggal_bergabung'] ?? $instructor->tanggal_bergabung,
                'rating' => $validated['rating'] ?? $instructor->rating ?? 0,
                'total_sesi' => $validated['total_sesi'] ?? $instructor->total_sesi ?? 0,
                'tingkat_kelulusan' => $validated['tingkat_kelulusan'] ?? $instructor->tingkat_kelulusan ?? 0,
            ]);

            return $instructor->fresh(['user.role']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Instruktur berhasil diperbarui.',
            'data' => [
                'item' => $this->formatInstructor($updatedInstructor),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        /** @var Instructor|null $instructor */
        $instructor = Instructor::query()
            ->with([
                'user',
                'trainingSchedules',
                'timeSlotAssignments',
                'bookingGroups',
                'trainingResults',
            ])
            ->find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instruktur tidak ditemukan.',
            ], 404);
        }

        if (!$instructor->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data akun instruktur tidak ditemukan.',
            ], 404);
        }

        if ($instructor->user->status_akun === 'Nonaktif' && $instructor->status === 'Nonaktif') {
            return response()->json([
                'success' => true,
                'message' => 'Instruktur sudah dalam status nonaktif.',
                'data' => [
                    'item' => $this->formatInstructor(
                        $instructor->fresh(['user.role'])
                    ),
                ],
            ]);
        }

        DB::transaction(function () use ($instructor) {
            $instructor->update([
                'status' => 'Nonaktif',
                'status_jadwal' => 'Libur / Cuti',
            ]);

            $instructor->user->update([
                'status_akun' => 'Nonaktif',
                'remember_token' => null,
            ]);

            $instructor->user->tokens()->delete();
        });

        $instructor = $instructor->fresh(['user.role']);

        return response()->json([
            'success' => true,
            'message' => 'Instruktur berhasil dinonaktifkan. Data jadwal, assignment, booking, dan hasil latihan tetap tersimpan.',
            'data' => [
                'item' => $this->formatInstructor($instructor),
            ],
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        /** @var Instructor|null $instructor */
        $instructor = Instructor::query()
            ->with(['user.role'])
            ->find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instruktur tidak ditemukan.',
            ], 404);
        }

        if (!$instructor->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data akun instruktur tidak ditemukan.',
            ], 404);
        }

        if ($instructor->user->status_akun === 'Aktif' && $instructor->status === 'Aktif') {
            return response()->json([
                'success' => true,
                'message' => 'Instruktur sudah dalam status aktif.',
                'data' => [
                    'item' => $this->formatInstructor($instructor),
                ],
            ]);
        }

        DB::transaction(function () use ($instructor) {
            $instructor->update([
                'status' => 'Aktif',
                'status_jadwal' => $instructor->status_jadwal === 'Libur / Cuti'
                    ? 'Terjadwal'
                    : $instructor->status_jadwal,
            ]);

            $instructor->user->update([
                'status_akun' => 'Aktif',
            ]);
        });

        $instructor = $instructor->fresh(['user.role']);

        return response()->json([
            'success' => true,
            'message' => 'Instruktur berhasil diaktifkan kembali.',
            'data' => [
                'item' => $this->formatInstructor($instructor),
            ],
        ]);
    }

    private function generateInstructorCode(): string
    {
        $lastInstructor = Instructor::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastInstructor ? $lastInstructor->id + 1 : 1;

        return 'INS-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function formatInstructor(Instructor $instructor): array
    {
        return [
            'id' => $instructor->id,
            'kode_instruktur' => $instructor->kode_instruktur,

            'user' => $instructor->user ? [
                'id' => $instructor->user->id,
                'name' => $instructor->user->name,
                'email' => $instructor->user->email,
                'no_telepon' => $instructor->user->no_telepon,
                'alamat' => $instructor->user->alamat,
                'status_akun' => $instructor->user->status_akun,
                'foto_profil' => $instructor->user->foto_profil,
                'role' => $instructor->user->role ? [
                    'id' => $instructor->user->role->id,
                    'nama_role' => $instructor->user->role->nama_role,
                    'slug' => $instructor->user->role->slug,
                ] : null,
            ] : null,

            'nama_instruktur' => $instructor->user?->name,
            'email' => $instructor->user?->email,
            'no_telepon' => $instructor->user?->no_telepon,
            'alamat' => $instructor->user?->alamat,
            'status_akun' => $instructor->user?->status_akun,

            'jabatan' => $instructor->jabatan,
            'spesialisasi' => $instructor->spesialisasi,
            'status' => $instructor->status,
            'status_jadwal' => $instructor->status_jadwal,
            'tanggal_bergabung' => DateFormatter::date($instructor->tanggal_bergabung),
            'rating' => (float) $instructor->rating,
            'total_sesi' => (int) $instructor->total_sesi,
            'tingkat_kelulusan' => (int) $instructor->tingkat_kelulusan,

            'created_at' => DateFormatter::dateTime($instructor->created_at),
            'updated_at' => DateFormatter::dateTime($instructor->updated_at),
        ];
    }

}
