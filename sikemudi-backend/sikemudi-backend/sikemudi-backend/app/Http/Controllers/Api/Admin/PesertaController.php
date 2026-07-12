<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\Role;
use App\Models\User;
use App\Support\CourseProgressManager;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Support\PasswordRule;

class PesertaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $participants = Participant::query()
            ->with(['user.role', 'activePackage'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_peserta', 'like', "%{$keyword}%")
                        ->orWhere('status_sertifikat', 'like', "%{$keyword}%")
                        ->orWhereHas('user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%")
                                ->orWhere('alamat', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('activePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status_akun'), function ($query) use ($request) {
                $query->whereHas('user', function ($userQuery) use ($request) {
                    $userQuery->where('status_akun', $request->query('status_akun'));
                });
            })
            ->when($request->filled('status_sertifikat'), function ($query) use ($request) {
                $query->where('status_sertifikat', $request->query('status_sertifikat'));
            })
            ->when($request->filled('paket_id'), function ($query) use ($request) {
                $query->where('paket_aktif_id', $request->query('paket_id'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data peserta berhasil diambil.',
            'data' => [
                'items' => collect($participants->items())
                    ->map(fn(Participant $participant) => $this->formatParticipant($participant))
                    ->values(),
                'pagination' => [
                    'current_page' => $participants->currentPage(),
                    'last_page' => $participants->lastPage(),
                    'per_page' => $participants->perPage(),
                    'total' => $participants->total(),
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
            'status_akun' => ['nullable', Rule::in(['Aktif', 'Verifikasi', 'Nonaktif'])],

            'kode_peserta' => ['nullable', 'string', 'max:40', 'unique:participants,kode_peserta'],
            'paket_aktif_id' => ['nullable', 'exists:course_packages,id'],
            'tanggal_lahir' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['Laki-laki', 'Perempuan'])],
            'tanggal_bergabung' => ['nullable', 'date'],

            'jumlah_sesi_selesai' => ['nullable', 'integer', 'min:0'],
            'jumlah_sesi_total' => ['nullable', 'integer', 'min:0'],
            'jumlah_absen' => ['nullable', 'integer', 'min:0'],
            'rating_rata_rata' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'status_sertifikat' => ['nullable', Rule::in(['Terbit', 'Dalam Proses', 'Belum Ada'])],
        ], [
            'name.required' => 'Nama peserta wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'status_akun.in' => 'Status akun tidak valid.',
            'paket_aktif_id.exists' => 'Paket kursus tidak ditemukan.',
            'gender.in' => 'Gender harus Laki-laki atau Perempuan.',
            'status_sertifikat.in' => 'Status sertifikat tidak valid.',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $participantRole = Role::where('slug', 'peserta')->firstOrFail();

            $package = null;

            if (!empty($validated['paket_aktif_id'])) {
                $package = CoursePackage::find($validated['paket_aktif_id']);
            }

            $user = User::create([
                'role_id' => $participantRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'no_telepon' => $validated['no_telepon'],
                'alamat' => $validated['alamat'] ?? null,
                'status_akun' => $validated['status_akun'] ?? 'Aktif',
                'foto_profil' => $validated['foto_profil'] ?? null,
            ]);

            $participant = Participant::create([
                'user_id' => $user->id,
                'kode_peserta' => $validated['kode_peserta'] ?? $this->generateParticipantCode(),
                'paket_aktif_id' => $validated['paket_aktif_id'] ?? null,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'tanggal_bergabung' => $validated['tanggal_bergabung'] ?? now()->toDateString(),

                'jumlah_sesi_selesai' => $validated['jumlah_sesi_selesai'] ?? 0,
                'jumlah_sesi_total' => $validated['jumlah_sesi_total'] ?? ($package ? CourseProgressManager::totalSessionsFor($package) : 0),
                'jumlah_absen' => $validated['jumlah_absen'] ?? 0,
                'rating_rata_rata' => $validated['rating_rata_rata'] ?? 0,
                'status_sertifikat' => $validated['status_sertifikat'] ?? 'Belum Ada',
            ]);

            $participant->load(['user.role', 'activePackage']);

            return $participant;
        });

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatParticipant($result),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $participant = Participant::with(['user.role', 'activePackage'])->find($id);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail peserta berhasil diambil.',
            'data' => [
                'item' => $this->formatParticipant($participant),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $participant = Participant::with('user')->find($id);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($participant->user_id),
            ],
            'password' => ['nullable', 'confirmed', PasswordRule::strong()],
            'no_telepon' => [
                'required',
                'string',
                'max:30',
                Rule::unique('users', 'no_telepon')->ignore($participant->user_id),
            ],
            'alamat' => ['nullable', 'string'],
            'foto_profil' => ['nullable', 'string'],
            'status_akun' => ['required', Rule::in(['Aktif', 'Verifikasi', 'Nonaktif'])],

            'kode_peserta' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('participants', 'kode_peserta')->ignore($participant->id),
            ],
            'paket_aktif_id' => ['nullable', 'exists:course_packages,id'],
            'tanggal_lahir' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['Laki-laki', 'Perempuan'])],
            'tanggal_bergabung' => ['nullable', 'date'],

            'jumlah_sesi_selesai' => ['nullable', 'integer', 'min:0'],
            'jumlah_sesi_total' => ['nullable', 'integer', 'min:0'],
            'jumlah_absen' => ['nullable', 'integer', 'min:0'],
            'rating_rata_rata' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'status_sertifikat' => ['required', Rule::in(['Terbit', 'Dalam Proses', 'Belum Ada'])],
        ], [
            'name.required' => 'Nama peserta wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'status_akun.required' => 'Status akun wajib diisi.',
            'status_akun.in' => 'Status akun tidak valid.',
            'paket_aktif_id.exists' => 'Paket kursus tidak ditemukan.',
            'gender.in' => 'Gender harus Laki-laki atau Perempuan.',
            'status_sertifikat.required' => 'Status sertifikat wajib diisi.',
            'status_sertifikat.in' => 'Status sertifikat tidak valid.',
        ]);

        $updatedParticipant = DB::transaction(function () use ($validated, $participant) {
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

            $participant->user->update($userData);

            $package = !empty($validated['paket_aktif_id'])
                ? CoursePackage::find($validated['paket_aktif_id'])
                : null;

            $participant->update([
                'kode_peserta' => filled($validated['kode_peserta'] ?? null)
                    ? $validated['kode_peserta']
                    : $participant->kode_peserta,
                'paket_aktif_id' => $validated['paket_aktif_id'] ?? null,
                'tanggal_lahir' => array_key_exists('tanggal_lahir', $validated)
                    ? $validated['tanggal_lahir']
                    : $participant->tanggal_lahir,
                'gender' => array_key_exists('gender', $validated)
                    ? $validated['gender']
                    : $participant->gender,
                'tanggal_bergabung' => array_key_exists('tanggal_bergabung', $validated)
                    ? $validated['tanggal_bergabung']
                    : $participant->tanggal_bergabung,

                'jumlah_sesi_selesai' => $validated['jumlah_sesi_selesai'] ?? $participant->jumlah_sesi_selesai,
                'jumlah_sesi_total' => $validated['jumlah_sesi_total'] ?? ($package ? CourseProgressManager::totalSessionsFor($package) : $participant->jumlah_sesi_total),
                'jumlah_absen' => $validated['jumlah_absen'] ?? $participant->jumlah_absen,
                'rating_rata_rata' => $validated['rating_rata_rata'] ?? $participant->rating_rata_rata,
                'status_sertifikat' => $validated['status_sertifikat'],
            ]);

            return $participant->fresh(['user.role', 'activePackage']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil diperbarui.',
            'data' => [
                'item' => $this->formatParticipant($updatedParticipant),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        /** @var Participant|null $participant */
        $participant = Participant::query()
            ->with([
                'user',
                'activePackage',
                'bookingGroups',
                'bookings',
                'trainingResults',
                'certificates',
            ])
            ->find($id);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        if (!$participant->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data akun peserta tidak ditemukan.',
            ], 404);
        }

        if ($participant->user->status_akun === 'Nonaktif') {
            return response()->json([
                'success' => true,
                'message' => 'Peserta sudah dalam status nonaktif.',
                'data' => [
                    'item' => $this->formatParticipant(
                        $participant->fresh(['user.role', 'activePackage'])
                    ),
                ],
            ]);
        }

        DB::transaction(function () use ($participant) {
            $participant->user->update([
                'status_akun' => 'Nonaktif',
                'remember_token' => null,
            ]);

            $participant->user->tokens()->delete();
        });

        $participant = $participant->fresh(['user.role', 'activePackage']);

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil dinonaktifkan. Data riwayat, booking, pembayaran, hasil latihan, dan sertifikat tetap tersimpan.',
            'data' => [
                'item' => $this->formatParticipant($participant),
            ],
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        /** @var Participant|null $participant */
        $participant = Participant::query()
            ->with(['user.role', 'activePackage'])
            ->find($id);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        if (!$participant->user) {
            return response()->json([
                'success' => false,
                'message' => 'Data akun peserta tidak ditemukan.',
            ], 404);
        }

        if ($participant->user->status_akun === 'Aktif') {
            return response()->json([
                'success' => true,
                'message' => 'Peserta sudah dalam status aktif.',
                'data' => [
                    'item' => $this->formatParticipant($participant),
                ],
            ]);
        }

        DB::transaction(function () use ($participant) {
            $participant->user->update([
                'status_akun' => 'Aktif',
            ]);
        });

        $participant = $participant->fresh(['user.role', 'activePackage']);

        return response()->json([
            'success' => true,
            'message' => 'Peserta berhasil diaktifkan kembali.',
            'data' => [
                'item' => $this->formatParticipant($participant),
            ],
        ]);
    }

    private function generateParticipantCode(): string
    {
        $lastParticipant = Participant::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastParticipant ? $lastParticipant->id + 1 : 1;

        return 'PST-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function formatParticipant(Participant $participant): array
    {
        return [
            'id' => $participant->id,
            'kode_peserta' => $participant->kode_peserta,

            'user' => $participant->user ? [
                'id' => $participant->user->id,
                'name' => $participant->user->name,
                'email' => $participant->user->email,
                'no_telepon' => $participant->user->no_telepon,
                'alamat' => $participant->user->alamat,
                'status_akun' => $participant->user->status_akun,
                'foto_profil' => $participant->user->foto_profil,
                'role' => $participant->user->role ? [
                    'id' => $participant->user->role->id,
                    'nama_role' => $participant->user->role->nama_role,
                    'slug' => $participant->user->role->slug,
                ] : null,
            ] : null,

            'nama_peserta' => $participant->user?->name,
            'email' => $participant->user?->email,
            'no_telepon' => $participant->user?->no_telepon,
            'alamat' => $participant->user?->alamat,
            'status_akun' => $participant->user?->status_akun,

            'paket_aktif' => $participant->activePackage ? [
                'id' => $participant->activePackage->id,
                'kode_paket' => $participant->activePackage->kode_paket,
                'nama_paket' => $participant->activePackage->nama_paket,
                'durasi_jam' => (int) $participant->activePackage->durasi_jam,
                'harga_antar_jemput' => (int) $participant->activePackage->harga_antar_jemput,
                'harga_tidak_antar_jemput' => (int) $participant->activePackage->harga_tidak_antar_jemput,
                'harga_dengan_sim_antar_jemput' => (int) $participant->activePackage->harga_dengan_sim_antar_jemput,
                'harga_dengan_sim_tidak_antar_jemput' => (int) $participant->activePackage->harga_dengan_sim_tidak_antar_jemput,
            ] : null,

            'tanggal_lahir' => DateFormatter::date($participant->tanggal_lahir),
            'gender' => $participant->gender,
            'tanggal_bergabung' => DateFormatter::date($participant->tanggal_bergabung),

            'jumlah_sesi_selesai' => (int) $participant->jumlah_sesi_selesai,
            'jumlah_sesi_total' => (int) $participant->jumlah_sesi_total,
            'jumlah_absen' => (int) $participant->jumlah_absen,
            'rating_rata_rata' => (float) $participant->rating_rata_rata,
            'status_sertifikat' => $participant->status_sertifikat,

            'created_at' => DateFormatter::dateTime($participant->created_at),
            'updated_at' => DateFormatter::dateTime($participant->updated_at),
        ];
    }
}
