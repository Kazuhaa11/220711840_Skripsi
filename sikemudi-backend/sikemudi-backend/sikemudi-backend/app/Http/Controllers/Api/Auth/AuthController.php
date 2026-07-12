<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::strong()],
            'no_telepon' => ['required', 'string', 'max:30', 'unique:users,no_telepon'],
            'alamat' => ['nullable', 'string'],
            'tanggal_lahir' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:Laki-laki,Perempuan'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
            'no_telepon.required' => 'Nomor telepon wajib diisi.',
            'no_telepon.unique' => 'Nomor telepon sudah digunakan.',
            'gender.in' => 'Gender harus Laki-laki atau Perempuan.',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $participantRole = Role::where('slug', 'peserta')->firstOrFail();

            $user = User::create([
                'role_id' => $participantRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'no_telepon' => $validated['no_telepon'],
                'alamat' => $validated['alamat'] ?? null,
                'status_akun' => 'Aktif',
            ]);

            Participant::create([
                'user_id' => $user->id,
                'kode_peserta' => $this->generateParticipantCode(),
                'paket_aktif_id' => null,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'tanggal_bergabung' => now()->toDateString(),
                'jumlah_sesi_selesai' => 0,
                'jumlah_sesi_total' => 0,
                'jumlah_absen' => 0,
                'rating_rata_rata' => 0,
                'status_sertifikat' => 'Belum Ada',
            ]);

            $user->load(['role', 'participant.activePackage', 'instructor']);

            $authToken = $this->createAuthToken(
                $user,
                $validated['device_name'] ?? 'sikemudi-web'
            );

            return [
                'user' => $this->formatUser($user),
                'token' => $authToken['token'],
                'token_type' => $authToken['token_type'],
                'token_expires_at' => $authToken['token_expires_at'],
                'token_expires_in_seconds' => $authToken['token_expires_in_seconds'],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Registrasi peserta berhasil.',
            'data' => $result,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $user = User::with(['role', 'participant.activePackage', 'instructor'])
            ->where('email', $validated['email'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status_akun !== 'Aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak aktif. Silakan hubungi admin.',
            ], 403);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $authToken = $this->createAuthToken(
            $user,
            $validated['device_name'] ?? 'sikemudi-web'
        );

        $user->refresh();
        $user->load(['role', 'participant.activePackage', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $authToken['token'],
                'token_type' => $authToken['token_type'],
                'token_expires_at' => $authToken['token_expires_at'],
                'token_expires_in_seconds' => $authToken['token_expires_in_seconds'],
            ],
        ]);
    }


    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $user = User::query()
            ->where('email', $validated['email'])
            ->first();

        if ($user) {
            $plainToken = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($plainToken),
                    'created_at' => now(),
                ],
            );

            $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
            $resetUrl = $frontendUrl . '/reset-password?email=' . urlencode($user->email) . '&token=' . urlencode($plainToken);

            Mail::raw(
                "Halo {$user->name}," .
                "Kami menerima permintaan reset password akun SIKEMUDI Anda." .
                "Silakan buka link berikut untuk membuat password baru:" . $resetUrl . " " .
                "Link ini berlaku selama 60 menit. Jika Anda tidak meminta reset password, abaikan email ini." .
                "Salam,SIKEMUDI",
                function ($message) use ($user) {
                    $message->to($user->email, $user->name)
                        ->subject('Reset Password Akun SIKEMUDI');
                },
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, link reset password telah dikirim.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::strong()],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'token.required' => 'Token reset password wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            ...PasswordRule::messages(),
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$resetRecord || now()->subMinutes(60)->greaterThan(\Illuminate\Support\Carbon::parse($resetRecord->created_at))) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        if (!Hash::check($validated['token'], $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        $user = User::query()
            ->where('email', $validated['email'])
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ], 404);
        }

        DB::transaction(function () use ($user, $validated) {
            $user->forceFill([
                'password' => Hash::make($validated['password']),
            ])->save();

            $user->tokens()->delete();

            DB::table('password_reset_tokens')
                ->where('email', $validated['email'])
                ->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login menggunakan password baru.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->load(['role', 'participant.activePackage', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna berhasil diambil.',
            'data' => [
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $currentToken = $request->user()->currentAccessToken();

        if ($currentToken) {
            $currentToken->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    private function createAuthToken(User $user, ?string $deviceName = null): array
    {
        $expirationHours = max(1, (int) env('SANCTUM_TOKEN_EXPIRATION_HOURS', 2));
        $expiresAt = now()->addHours($expirationHours);

        $token = $user->createToken(
            $deviceName ?: 'sikemudi-web',
            ['*'],
            $expiresAt
        )->plainTextToken;

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'token_expires_at' => $expiresAt->toISOString(),
            'token_expires_in_seconds' => $expirationHours * 60 * 60,
        ];
    }

    private function generateParticipantCode(): string
    {
        $lastParticipant = Participant::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastParticipant ? $lastParticipant->id + 1 : 1;

        return 'PST-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function resolveFotoProfilUrl(User $user): ?string
    {
        if ($user->foto_profil_path) {
            return Storage::disk('public')->url($user->foto_profil_path);
        }

        return $user->foto_profil ?: null;
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'role' => $user->role ? [
                'id' => $user->role->id,
                'nama_role' => $user->role->nama_role,
                'slug' => $user->role->slug,
            ] : null,
            'name' => $user->name,
            'email' => $user->email,
            'no_telepon' => $user->no_telepon,
            'alamat' => $user->alamat,
            'status_akun' => $user->status_akun,
            'foto_profil' => $user->foto_profil_path ? null : $user->foto_profil,
            'foto_profil_path' => $user->foto_profil_path,
            'foto_profil_url' => $this->resolveFotoProfilUrl($user),
            'foto_profil_original_name' => $user->foto_profil_original_name,
            'foto_profil_mime' => $user->foto_profil_mime,
            'foto_profil_size' => $user->foto_profil_size ? (int) $user->foto_profil_size : null,
            'last_login_at' => $user->last_login_at?->toDateTimeString(),

            'participant' => $user->participant ? [
                'id' => $user->participant->id,
                'kode_peserta' => $user->participant->kode_peserta,
                'tanggal_lahir' => $user->participant->tanggal_lahir?->toDateString(),
                'gender' => $user->participant->gender,
                'tanggal_bergabung' => $user->participant->tanggal_bergabung?->toDateString(),
                'jumlah_sesi_selesai' => $user->participant->jumlah_sesi_selesai,
                'jumlah_sesi_total' => $user->participant->jumlah_sesi_total,
                'jumlah_absen' => $user->participant->jumlah_absen,
                'rating_rata_rata' => $user->participant->rating_rata_rata,
                'status_sertifikat' => $user->participant->status_sertifikat,
                'paket_aktif' => $user->participant->activePackage ? [
                    'id' => $user->participant->activePackage->id,
                    'kode_paket' => $user->participant->activePackage->kode_paket,
                    'nama_paket' => $user->participant->activePackage->nama_paket,
                    'durasi_jam' => $user->participant->activePackage->durasi_jam,
                ] : null,
            ] : null,

            'instructor' => $user->instructor ? [
                'id' => $user->instructor->id,
                'kode_instruktur' => $user->instructor->kode_instruktur,
                'jabatan' => $user->instructor->jabatan,
                'spesialisasi' => $user->instructor->spesialisasi,
                'status' => $user->instructor->status,
                'status_jadwal' => $user->instructor->status_jadwal,
                'tanggal_bergabung' => $user->instructor->tanggal_bergabung?->toDateString(),
                'rating' => $user->instructor->rating,
                'total_sesi' => $user->instructor->total_sesi,
                'tingkat_kelulusan' => $user->instructor->tingkat_kelulusan,
            ] : null,
        ];
    }
}