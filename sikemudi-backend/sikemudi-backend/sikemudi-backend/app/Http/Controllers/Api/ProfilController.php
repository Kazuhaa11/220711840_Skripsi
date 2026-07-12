<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\Participant;
use App\Models\User;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Support\PasswordRule;

class ProfilController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->loadMissing('role');

        return response()->json([
            'success' => true,
            'message' => 'Data profil berhasil diambil.',
            'data' => [
                'item' => $this->formatProfile($user),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->loadMissing('role');

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'no_telepon' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('users', 'no_telepon')->ignore($user->id),
            ],
            'alamat' => ['nullable', 'string'],

            'current_password' => ['required_with:password', 'nullable', 'string'],
            'password' => ['nullable', 'confirmed', PasswordRule::strong()],

            // khusus peserta
            'tanggal_lahir' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['Laki-laki', 'Perempuan'])],

            // khusus instruktur
            'spesialisasi' => ['nullable', 'string', 'max:150'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'current_password.required_with' => 'Password lama wajib diisi untuk mengganti password.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'gender.in' => 'Gender harus Laki-laki atau Perempuan.',
        ]);

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password lama tidak sesuai.',
                ], 422);
            }
        }

        $updatedUser = DB::transaction(function () use ($request, $user, $validated) {
            $userData = [];

            foreach (['name', 'email', 'no_telepon', 'alamat'] as $field) {
                if ($request->has($field)) {
                    $userData[$field] = $validated[$field] ?? null;
                }
            }

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            if (!empty($userData)) {
                $user->update($userData);
            }

            $roleSlug = $user->role?->slug;

            if ($roleSlug === 'peserta') {
                $participant = Participant::query()
                    ->where('user_id', $user->id)
                    ->first();

                if ($participant) {
                    $participantData = [];

                    if ($request->has('tanggal_lahir')) {
                        $participantData['tanggal_lahir'] = $validated['tanggal_lahir'] ?? null;
                    }

                    if ($request->has('gender')) {
                        $participantData['gender'] = $validated['gender'] ?? null;
                    }

                    if (!empty($participantData)) {
                        $participant->update($participantData);
                    }
                }
            }

            if ($roleSlug === 'instruktur') {
                $instructor = Instructor::query()
                    ->where('user_id', $user->id)
                    ->first();

                if ($instructor && $request->has('spesialisasi')) {
                    $instructor->update([
                        'spesialisasi' => $validated['spesialisasi'] ?? null,
                    ]);
                }
            }

            return $user->fresh('role');
        });

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'item' => $this->formatProfile($updatedUser),
            ],
        ]);
    }

    public function uploadFotoProfil(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'foto_profil' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'foto_profil.required' => 'Foto profil wajib diunggah.',
            'foto_profil.file' => 'Foto profil harus berupa file.',
            'foto_profil.mimes' => 'Foto profil harus berformat JPG, JPEG, PNG, atau WEBP.',
            'foto_profil.max' => 'Ukuran foto profil maksimal 2 MB.',
        ]);

        $file = $validated['foto_profil'];
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $fileName = 'profile-' . $user->id . '-' . now()->format('YmdHis') . '.' . $extension;
        $directory = 'sikemudi/foto-profil/' . $user->id;
        $oldPath = $user->foto_profil_path;

        $path = $file->storeAs($directory, $fileName, 'public');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Foto profil gagal disimpan.',
            ], 500);
        }

        try {
            $user->update([
                'foto_profil' => null,
                'foto_profil_path' => $path,
                'foto_profil_original_name' => $file->getClientOriginalName(),
                'foto_profil_mime' => $file->getMimeType(),
                'foto_profil_size' => $file->getSize(),
            ]);
        } catch (\Throwable $throwable) {
            Storage::disk('public')->delete($path);

            throw $throwable;
        }

        if ($oldPath && $oldPath !== $path && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diunggah.',
            'data' => [
                'item' => $this->formatProfile($user->fresh('role')),
            ],
        ]);
    }

    public function hapusFotoProfil(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $oldPath = $user->foto_profil_path;

        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        $user->update([
            'foto_profil' => null,
            'foto_profil_path' => null,
            'foto_profil_original_name' => null,
            'foto_profil_mime' => null,
            'foto_profil_size' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil dihapus.',
            'data' => [
                'item' => $this->formatProfile($user->fresh('role')),
            ],
        ]);
    }

    private function formatProfile(User $user): array
    {
        $roleSlug = $user->role?->slug;

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'alamat' => $user->alamat,
                'foto_profil' => $user->foto_profil_path ? null : $user->foto_profil,
                'foto_profil_path' => $user->foto_profil_path,
                'foto_profil_url' => $this->resolveFotoProfilUrl($user),
                'foto_profil_original_name' => $user->foto_profil_original_name,
                'foto_profil_mime' => $user->foto_profil_mime,
                'foto_profil_size' => $user->foto_profil_size ? (int) $user->foto_profil_size : null,
                'status_akun' => $user->status_akun,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'nama_role' => $user->role->nama_role,
                    'slug' => $user->role->slug,
                ] : null,
                'created_at' => DateFormatter::dateTime($user->created_at),
                'updated_at' => DateFormatter::dateTime($user->updated_at),
            ],

            'peserta' => $roleSlug === 'peserta'
                ? $this->formatParticipantProfile($user)
                : null,

            'instruktur' => $roleSlug === 'instruktur'
                ? $this->formatInstructorProfile($user)
                : null,
        ];
    }

    private function resolveFotoProfilUrl(User $user): ?string
    {
        if ($user->foto_profil_path) {
            return Storage::disk('public')->url($user->foto_profil_path);
        }

        return $user->foto_profil ?: null;
    }

    private function formatParticipantProfile(User $user): ?array
    {
        $participant = Participant::query()
            ->with('activePackage')
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return null;
        }

        return [
            'id' => $participant->id,
            'kode_peserta' => $participant->kode_peserta,
            'tanggal_lahir' => DateFormatter::date($participant->tanggal_lahir),
            'gender' => $participant->gender,
            'tanggal_bergabung' => DateFormatter::date($participant->tanggal_bergabung),

            'paket_aktif' => $participant->activePackage ? [
                'id' => $participant->activePackage->id,
                'kode_paket' => $participant->activePackage->kode_paket,
                'nama_paket' => $participant->activePackage->nama_paket,
                'durasi_jam' => (int) $participant->activePackage->durasi_jam,
            ] : null,

            'jumlah_sesi_selesai' => (int) $participant->jumlah_sesi_selesai,
            'jumlah_sesi_total' => (int) $participant->jumlah_sesi_total,
            'jumlah_absen' => (int) $participant->jumlah_absen,
            'rating_rata_rata' => (float) $participant->rating_rata_rata,
            'status_sertifikat' => $participant->status_sertifikat,

            'created_at' => DateFormatter::dateTime($participant->created_at),
            'updated_at' => DateFormatter::dateTime($participant->updated_at),
        ];
    }

    private function formatInstructorProfile(User $user): ?array
    {
        $instructor = Instructor::query()
            ->where('user_id', $user->id)
            ->first();

        if (!$instructor) {
            return null;
        }

        return [
            'id' => $instructor->id,
            'kode_instruktur' => $instructor->kode_instruktur,
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
