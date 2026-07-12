<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Sertifikat {{ $certificate->nomor_sertifikat }}</title>
    <style>
        @page {
            margin: 24px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            background: #ffffff;
        }

        .certificate {
            position: relative;
            min-height: 540px;
            overflow: hidden;
            border: 14px solid {{ $certificate->template?->border_color ?? '#1e3a8a' }};
            padding: 26px 40px 24px;
            background-color: {{ $certificate->template?->background_color ?? '#ffffff' }};
        }

        .background-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0.18;
            object-fit: cover;
            z-index: 0;
        }

        .content {
            position: relative;
            z-index: 2;
            height: 100%;
            text-align: center;
        }

        .corner {
            position: absolute;
            width: 48px;
            height: 48px;
            z-index: 3;
        }

        .corner-tl {
            top: 26px;
            left: 40px;
            border-left: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
            border-top: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
        }

        .corner-tr {
            top: 26px;
            right: 40px;
            border-right: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
            border-top: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
        }

        .corner-bl {
            bottom: 32px;
            left: 40px;
            border-left: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
            border-bottom: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
        }

        .corner-br {
            bottom: 32px;
            right: 40px;
            border-right: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
            border-bottom: 5px solid {{ $certificate->template?->accent_color ?? $certificate->template?->border_color ?? '#2563eb' }};
        }

        .issuer {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 7px;
            text-transform: uppercase;
            color: {{ $certificate->template?->accent_color ?? '#2563eb' }};
        }

        .institution-address {
            margin-top: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
        }

        .title {
            margin-top: 26px;
            font-size: 28px;
            line-height: 1.2;
            font-weight: 800;
            text-transform: uppercase;
            color: #020617;
        }

        .subtitle {
            margin-top: 10px;
            font-size: 13px;
            color: #64748b;
        }

        .recipient-label {
            margin-top: 28px;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 7px;
            text-transform: uppercase;
            color: #64748b;
        }

        .opening {
            width: 82%;
            margin: 18px auto 0;
            font-size: 13px;
            line-height: 1.65;
            color: #475569;
        }

        .participant-name {
            margin-top: 26px;
            font-size: 25px;
            line-height: 1.2;
            font-weight: 800;
            color: #020617;
        }

        .name-rule {
            width: 300px;
            height: 4px;
            margin: 16px auto 0;
            border-radius: 999px;
            background: {{ $certificate->template?->accent_color ?? '#2563eb' }};
        }

        .program-prefix {
            margin-top: 10px;
            font-size: 16px;
            color: #475569;
        }

        .program-name {
            margin-top: 12px;
            font-size: 21px;
            line-height: 1.2;
            font-weight: 800;
            color: {{ $certificate->template?->accent_color ?? '#2563eb' }};
        }

        .closing {
            width: 78%;
            margin: 24px auto 0;
            font-size: 13px;
            line-height: 1.6;
            color: #64748b;
        }

        .footer {
            width: 100%;
            margin-top: 18px;
            border-collapse: collapse;
            font-size: 11px;
            color: #475569;
        }

        .footer td {
            width: 33.333%;
            vertical-align: bottom;
        }

        .footer-label {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #64748b;
        }

        .footer-value {
            margin-top: 5px;
            font-size: 11px;
            font-weight: 800;
            color: #020617;
        }

        .qr-image {
            width: 58px;
            height: 58px;
            padding: 4px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
        }

        .signature-image {
            height: 46px;
            max-width: 170px;
            object-fit: contain;
        }

        .signature-space {
            height: 46px;
        }

        .signer-name {
            margin-top: 8px;
            font-size: 12px;
            font-weight: 800;
            color: #020617;
        }

        .signer-title {
            margin-top: 3px;
            font-size: 10px;
            color: #64748b;
        }
    </style>
</head>
<body>
@php
    $template = $certificate->template;
    $result = $certificate->trainingResult;
    $participant = $certificate->participant;
    $participantUser = $participant?->user;
    $coursePackage = $certificate->coursePackage;

    $accentColor = $template?->accent_color ?: ($template?->border_color ?: '#2563eb');
    $backgroundDataUri = null;
    $signatureDataUri = null;
    $qrCodeDataUri = null;

    $publicDataUri = static function (?string $path, ?string $mime = null): ?string {
        if (! $path || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            return null;
        }

        $content = \Illuminate\Support\Facades\Storage::disk('public')->get($path);
        $resolvedMime = $mime ?: \Illuminate\Support\Facades\Storage::disk('public')->mimeType($path) ?: 'image/png';

        return 'data:' . $resolvedMime . ';base64,' . base64_encode($content);
    };

    if ($template?->background_type === 'Gambar') {
        $backgroundDataUri = $publicDataUri($template->background_image_path, $template->background_image_mime)
            ?: $template->background_image;
    }

    $signatureDataUri = $publicDataUri($template?->ttd_digital_path, $template?->ttd_digital_mime)
        ?: $template?->ttd_digital;

    if ($certificate->qr_code_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($certificate->qr_code_path)) {
        $qrMime = $certificate->qr_code_mime ?: 'image/png';
        $qrContent = \Illuminate\Support\Facades\Storage::disk('public')->get($certificate->qr_code_path);
        $qrCodeDataUri = 'data:' . $qrMime . ';base64,' . base64_encode($qrContent);
    }
@endphp

<div class="certificate">
    @if($backgroundDataUri)
        <img class="background-image" src="{{ $backgroundDataUri }}" alt="">
    @endif

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="content">
        <div class="issuer">
            {{ $template?->nama_penyelenggara ?? 'SIKEMUDI' }}
        </div>

        @if($template?->institution_address)
            <div class="institution-address">{{ $template->institution_address }}</div>
        @endif

        <div class="title">
            {{ $template?->judul_sertifikat ?? 'Sertifikat Kelulusan' }}
        </div>

        @if($template?->subjudul)
            <div class="subtitle">{{ $template->subjudul }}</div>
        @endif

        <div class="recipient-label">
            {{ $template?->recipient_label ?? 'Diberikan kepada' }}
        </div>

        <div class="opening">
            {{ $template?->kalimat_pembuka ?? 'Dengan ini menyatakan bahwa peserta berikut telah menyelesaikan program kursus mengemudi dan dinyatakan lulus berdasarkan hasil pelatihan.' }}
        </div>

        <div class="participant-name">
            {{ $participantUser?->name ?? '-' }}
        </div>

        <div class="name-rule"></div>

        <div class="program-prefix">
            {{ $template?->program_prefix ?? 'Atas kelulusannya dalam program' }}:
        </div>

        <div class="program-name">
            {{ $coursePackage?->nama_paket ?? '-' }}
        </div>

        <div class="closing">
            {{ $template?->kalimat_penutup ?? 'Sertifikat ini diterbitkan sebagai dokumen pendukung internal lembaga kursus mengemudi.' }}
        </div>

        <table class="footer">
            <tr>
                <td style="text-align: left;">
                    @if($qrCodeDataUri)
                        <img class="qr-image" src="{{ $qrCodeDataUri }}" alt="QR Code Verifikasi Sertifikat">
                    @endif
                    <div class="footer-label" style="margin-top: 6px;">Kode Verifikasi</div>
                    <div class="footer-value">{{ $certificate->kode_verifikasi ?? '-' }}</div>
                </td>
                <td style="text-align: center;">
                    <div class="footer-label">Nomor Sertifikat</div>
                    <div class="footer-value">{{ $certificate->nomor_sertifikat }}</div>
                    <div class="footer-label" style="margin-top: 12px;">Tanggal Terbit</div>
                    <div class="footer-value">
                        {{ $certificate->tanggal_terbit ? \App\Support\DateFormatter::date($certificate->tanggal_terbit) : '-' }}
                    </div>
                </td>
                <td style="text-align: right;">
                    @if($signatureDataUri)
                        <img class="signature-image" src="{{ $signatureDataUri }}" alt="Tanda tangan digital">
                    @else
                        <div class="signature-space"></div>
                    @endif
                    <div class="signer-name">{{ $template?->nama_penandatangan ?? 'SIKEMUDI' }}</div>
                    <div class="signer-title">{{ $template?->jabatan_penandatangan ?? 'Penanggung Jawab' }}</div>
                </td>
            </tr>
        </table>
    </div>
</div>
</body>
</html>
