<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CertificateTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $query = CertificateTemplate::query()
            ->withCount('certificates')
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('nama_template', 'like', "%{$keyword}%")
                        ->orWhere('judul_sertifikat', 'like', "%{$keyword}%")
                        ->orWhere('subjudul', 'like', "%{$keyword}%")
                        ->orWhere('nama_penyelenggara', 'like', "%{$keyword}%")
                        ->orWhere('nama_penandatangan', 'like', "%{$keyword}%");
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if ($request->boolean('all')) {
            $templates = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Data template sertifikat berhasil diambil.',
                'data' => [
                    'items' => $templates
                        ->map(fn (CertificateTemplate $template) => $this->formatTemplate($template))
                        ->values(),
                    'pagination' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $templates->count(),
                        'total' => $templates->count(),
                    ],
                ],
            ]);
        }

        $templates = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data template sertifikat berhasil diambil.',
            'data' => [
                'items' => collect($templates->items())
                    ->map(fn (CertificateTemplate $template) => $this->formatTemplate($template))
                    ->values(),
                'pagination' => [
                    'current_page' => $templates->currentPage(),
                    'last_page' => $templates->lastPage(),
                    'per_page' => $templates->perPage(),
                    'total' => $templates->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateTemplate($request);

        $template = DB::transaction(function () use ($request, $validated) {
            $template = new CertificateTemplate();
            $template->fill($this->templateAttributes($validated));

            $this->applyUploadedAssets($request, $template);
            $template->save();

            if ((bool) ($validated['is_default'] ?? false)) {
                $this->setAsDefault($template);
            }

            return $template->fresh()->loadCount('certificates');
        });

        return response()->json([
            'success' => true,
            'message' => 'Template sertifikat berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatTemplate($template),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $template = CertificateTemplate::query()
            ->withCount('certificates')
            ->find($id);

        if (! $template) {
            return response()->json([
                'success' => false,
                'message' => 'Template sertifikat tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail template sertifikat berhasil diambil.',
            'data' => [
                'item' => $this->formatTemplate($template),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $template = CertificateTemplate::query()->find($id);

        if (! $template) {
            return response()->json([
                'success' => false,
                'message' => 'Template sertifikat tidak ditemukan.',
            ], 404);
        }

        $validated = $this->validateTemplate($request, $template->id);

        $template = DB::transaction(function () use ($request, $template, $validated) {
            $template->fill($this->templateAttributes($validated));

            if ($request->boolean('remove_background_image')) {
                $this->deleteBackgroundImage($template);
            }

            if ($request->boolean('remove_ttd_digital')) {
                $this->deleteSignatureImage($template);
            }

            $this->applyUploadedAssets($request, $template);
            $template->save();

            if ((bool) ($validated['is_default'] ?? false)) {
                $this->setAsDefault($template);
            } elseif ($template->is_default && $template->status !== 'Aktif') {
                $this->assignFallbackDefault($template->id);
            }

            return $template->fresh()->loadCount('certificates');
        });

        return response()->json([
            'success' => true,
            'message' => 'Template sertifikat berhasil diperbarui.',
            'data' => [
                'item' => $this->formatTemplate($template),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $template = CertificateTemplate::query()
            ->withCount('certificates')
            ->find($id);

        if (! $template) {
            return response()->json([
                'success' => false,
                'message' => 'Template sertifikat tidak ditemukan.',
            ], 404);
        }

        $template = DB::transaction(function () use ($template) {
            if ($template->certificates_count > 0) {
                $template->update([
                    'status' => 'Nonaktif',
                    'is_default' => false,
                ]);

                $this->assignFallbackDefault($template->id);

                return $template->fresh()->loadCount('certificates');
            }

            $wasDefault = (bool) $template->is_default;
            $templateId = $template->id;
            $formatted = $template->loadCount('certificates');

            $this->deleteBackgroundImage($template);
            $this->deleteSignatureImage($template);
            $template->delete();

            if ($wasDefault) {
                $this->assignFallbackDefault($templateId);
            }

            return $formatted;
        });

        return response()->json([
            'success' => true,
            'message' => $template->exists
                ? 'Template sertifikat sudah pernah dipakai sehingga dinonaktifkan.'
                : 'Template sertifikat berhasil dihapus.',
            'data' => [
                'item' => $this->formatTemplate($template),
            ],
        ]);
    }

    public function aktifkan(string $id): JsonResponse
    {
        $template = CertificateTemplate::query()
            ->withCount('certificates')
            ->find($id);

        if (! $template) {
            return response()->json([
                'success' => false,
                'message' => 'Template sertifikat tidak ditemukan.',
            ], 404);
        }

        $template->update(['status' => 'Aktif']);

        return response()->json([
            'success' => true,
            'message' => 'Template sertifikat berhasil diaktifkan.',
            'data' => [
                'item' => $this->formatTemplate($template->fresh()->loadCount('certificates')),
            ],
        ]);
    }

    public function setDefault(string $id): JsonResponse
    {
        $template = CertificateTemplate::query()
            ->withCount('certificates')
            ->find($id);

        if (! $template) {
            return response()->json([
                'success' => false,
                'message' => 'Template sertifikat tidak ditemukan.',
            ], 404);
        }

        if ($template->status !== 'Aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Template nonaktif tidak dapat dijadikan default. Aktifkan template terlebih dahulu.',
            ], 422);
        }

        DB::transaction(function () use ($template) {
            $this->setAsDefault($template);
        });

        return response()->json([
            'success' => true,
            'message' => 'Template sertifikat default berhasil diperbarui.',
            'data' => [
                'item' => $this->formatTemplate($template->fresh()->loadCount('certificates')),
            ],
        ]);
    }

    private function validateTemplate(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'nama_template' => [
                'required',
                'string',
                'max:150',
                Rule::unique('certificate_templates', 'nama_template')->ignore($ignoreId),
            ],
            'judul_sertifikat' => ['required', 'string', 'max:150'],
            'subjudul' => ['nullable', 'string', 'max:200'],
            'recipient_label' => ['nullable', 'string', 'max:120'],
            'program_prefix' => ['nullable', 'string', 'max:150'],
            'kalimat_pembuka' => ['nullable', 'string'],
            'kalimat_penutup' => ['nullable', 'string'],
            'nama_penyelenggara' => ['nullable', 'string', 'max:150'],
            'institution_address' => ['nullable', 'string', 'max:200'],
            'nama_penandatangan' => ['nullable', 'string', 'max:150'],
            'jabatan_penandatangan' => ['nullable', 'string', 'max:150'],
            'background_type' => ['required', Rule::in(['Warna', 'Gambar'])],
            'background_color' => ['required', 'string', 'max:30'],
            'border_color' => ['required', 'string', 'max:30'],
            'accent_color' => ['nullable', 'string', 'max:30'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            'is_default' => ['nullable', 'boolean'],
            'remove_background_image' => ['nullable', 'boolean'],
            'remove_ttd_digital' => ['nullable', 'boolean'],
            'background_image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'ttd_digital_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ], [
            'nama_template.required' => 'Nama template wajib diisi.',
            'nama_template.unique' => 'Nama template sudah digunakan.',
            'judul_sertifikat.required' => 'Judul sertifikat wajib diisi.',
            'background_type.required' => 'Tipe background wajib dipilih.',
            'background_type.in' => 'Tipe background tidak valid.',
            'background_color.required' => 'Warna background wajib diisi.',
            'border_color.required' => 'Warna border wajib diisi.',
            'status.required' => 'Status template wajib dipilih.',
            'status.in' => 'Status template tidak valid.',
            'background_image_file.image' => 'File background harus berupa gambar.',
            'background_image_file.max' => 'Ukuran background maksimal 2 MB.',
            'ttd_digital_file.image' => 'File tanda tangan harus berupa gambar.',
            'ttd_digital_file.max' => 'Ukuran tanda tangan maksimal 2 MB.',
        ]);
    }

    private function templateAttributes(array $validated): array
    {
        return [
            'nama_template' => $validated['nama_template'],
            'judul_sertifikat' => $validated['judul_sertifikat'],
            'subjudul' => $validated['subjudul'] ?? null,
            'recipient_label' => $validated['recipient_label'] ?? null,
            'program_prefix' => $validated['program_prefix'] ?? null,
            'kalimat_pembuka' => $validated['kalimat_pembuka'] ?? null,
            'kalimat_penutup' => $validated['kalimat_penutup'] ?? null,
            'nama_penyelenggara' => $validated['nama_penyelenggara'] ?? null,
            'institution_address' => $validated['institution_address'] ?? null,
            'nama_penandatangan' => $validated['nama_penandatangan'] ?? null,
            'jabatan_penandatangan' => $validated['jabatan_penandatangan'] ?? null,
            'background_type' => $validated['background_type'],
            'background_color' => $validated['background_color'],
            'border_color' => $validated['border_color'],
            'accent_color' => $validated['accent_color'] ?? $validated['border_color'],
            'status' => $validated['status'],
            'is_default' => (bool) ($validated['is_default'] ?? false),
        ];
    }

    private function applyUploadedAssets(Request $request, CertificateTemplate $template): void
    {
        if ($request->hasFile('background_image_file')) {
            $this->deleteBackgroundImage($template);
            $file = $request->file('background_image_file');
            $path = $file->store('sikemudi/template-sertifikat/background', 'public');

            $template->background_image = null;
            $template->background_image_path = $path;
            $template->background_image_original_name = $file->getClientOriginalName();
            $template->background_image_mime = $file->getMimeType();
            $template->background_image_size = $file->getSize();
        }

        if ($request->hasFile('ttd_digital_file')) {
            $this->deleteSignatureImage($template);
            $file = $request->file('ttd_digital_file');
            $path = $file->store('sikemudi/template-sertifikat/signature', 'public');

            $template->ttd_digital = null;
            $template->ttd_digital_path = $path;
            $template->ttd_digital_original_name = $file->getClientOriginalName();
            $template->ttd_digital_mime = $file->getMimeType();
            $template->ttd_digital_size = $file->getSize();
        }
    }

    private function deleteBackgroundImage(CertificateTemplate $template): void
    {
        if ($template->background_image_path && Storage::disk('public')->exists($template->background_image_path)) {
            Storage::disk('public')->delete($template->background_image_path);
        }

        $template->background_image = null;
        $template->background_image_path = null;
        $template->background_image_original_name = null;
        $template->background_image_mime = null;
        $template->background_image_size = null;
    }

    private function deleteSignatureImage(CertificateTemplate $template): void
    {
        if ($template->ttd_digital_path && Storage::disk('public')->exists($template->ttd_digital_path)) {
            Storage::disk('public')->delete($template->ttd_digital_path);
        }

        $template->ttd_digital = null;
        $template->ttd_digital_path = null;
        $template->ttd_digital_original_name = null;
        $template->ttd_digital_mime = null;
        $template->ttd_digital_size = null;
    }

    private function setAsDefault(CertificateTemplate $template): void
    {
        CertificateTemplate::query()
            ->whereKeyNot($template->id)
            ->update(['is_default' => false]);

        $template->forceFill([
            'is_default' => true,
            'status' => 'Aktif',
        ])->save();
    }

    private function assignFallbackDefault(?int $excludedTemplateId = null): void
    {
        if (CertificateTemplate::query()->where('is_default', true)->where('status', 'Aktif')->exists()) {
            return;
        }

        $fallback = CertificateTemplate::query()
            ->where('status', 'Aktif')
            ->when($excludedTemplateId, fn ($query) => $query->whereKeyNot($excludedTemplateId))
            ->oldest()
            ->first();

        if ($fallback) {
            $this->setAsDefault($fallback);
        }
    }

    private function formatTemplate(CertificateTemplate $template): array
    {
        return [
            'id' => $template->id,
            'nama_template' => $template->nama_template,
            'judul_sertifikat' => $template->judul_sertifikat,
            'subjudul' => $template->subjudul,
            'recipient_label' => $template->recipient_label,
            'program_prefix' => $template->program_prefix,
            'kalimat_pembuka' => $template->kalimat_pembuka,
            'kalimat_penutup' => $template->kalimat_penutup,
            'nama_penyelenggara' => $template->nama_penyelenggara,
            'institution_address' => $template->institution_address,
            'nama_penandatangan' => $template->nama_penandatangan,
            'jabatan_penandatangan' => $template->jabatan_penandatangan,
            'ttd_digital' => $template->ttd_digital,
            'ttd_digital_path' => $template->ttd_digital_path,
            'ttd_digital_url' => $this->publicFileUrl($template->ttd_digital_path),
            'ttd_digital_original_name' => $template->ttd_digital_original_name,
            'ttd_digital_mime' => $template->ttd_digital_mime,
            'ttd_digital_size' => $template->ttd_digital_size ? (int) $template->ttd_digital_size : null,
            'background_type' => $template->background_type,
            'background_color' => $template->background_color,
            'background_image' => $template->background_image,
            'background_image_path' => $template->background_image_path,
            'background_image_url' => $this->publicFileUrl($template->background_image_path),
            'background_image_original_name' => $template->background_image_original_name,
            'background_image_mime' => $template->background_image_mime,
            'background_image_size' => $template->background_image_size ? (int) $template->background_image_size : null,
            'border_color' => $template->border_color,
            'accent_color' => $template->accent_color ?: $template->border_color,
            'is_default' => (bool) $template->is_default,
            'status' => $template->status,
            'certificates_count' => (int) ($template->certificates_count ?? $template->certificates()->count()),
            'created_at' => DateFormatter::dateTime($template->created_at),
            'updated_at' => DateFormatter::dateTime($template->updated_at),
        ];
    }

    private function publicFileUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
