<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $invoiceNumber }}</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 12px;
            line-height: 1.45;
            margin: 0;
            padding: 0;
        }

        .page {
            padding: 28px;
        }

        .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }

        .brand {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .subtitle {
            font-size: 11px;
            color: #4b5563;
            margin-top: 3px;
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            margin: 18px 0 4px;
        }

        .muted {
            color: #6b7280;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .info td {
            padding: 4px 0;
            vertical-align: top;
        }

        .info .label {
            width: 165px;
            color: #4b5563;
        }

        .section-title {
            font-size: 13px;
            font-weight: 700;
            margin: 18px 0 8px;
        }

        .detail th,
        .detail td {
            border: 1px solid #d1d5db;
            padding: 7px 8px;
            vertical-align: top;
        }

        .detail th {
            background: #f3f4f6;
            text-align: left;
            font-weight: 700;
        }

        .summary {
            margin-top: 16px;
            width: 55%;
            margin-left: auto;
        }

        .summary td {
            border: 1px solid #d1d5db;
            padding: 8px;
        }

        .summary .total-label {
            font-weight: 700;
            background: #f3f4f6;
        }

        .summary .total-value {
            font-weight: 700;
            text-align: right;
        }

        .footer {
            margin-top: 26px;
            font-size: 11px;
            color: #4b5563;
        }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div class="brand">SIKEMUDI</div>
        <div class="subtitle">Sistem Informasi Kursus Mengemudi LKP Yuzza Kutai Barat</div>
    </div>

    <div class="title">Nota Pembayaran</div>
    <div class="muted">Dokumen ini diterbitkan otomatis setelah pembayaran booking paket dikonfirmasi admin</div>

    <div class="section-title">Informasi Pembayaran</div>
    <table class="info">
        <tr>
            <td class="label">No Nota</td>
            <td>: {{ $invoiceNumber }}</td>
        </tr>
        <tr>
            <td class="label">Kode Booking</td>
            <td>: {{ $group->kode_group }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Konfirmasi</td>
            <td>: {{ $confirmedAt ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Status Pembayaran</td>
            <td>: {{ $payment?->status ?: 'Terkonfirmasi' }}</td>
        </tr>
        <tr>
            <td class="label">Metode Pembayaran</td>
            <td>: {{ $paymentMethod }}</td>
        </tr>
        <tr>
            <td class="label">Diverifikasi Oleh</td>
            <td>: {{ $payment?->verifier?->name ?: 'Admin' }}</td>
        </tr>
    </table>

    <div class="section-title">Informasi Peserta dan Paket</div>
    <table class="info">
        <tr>
            <td class="label">Peserta</td>
            <td>: {{ $participantName }}</td>
        </tr>
        <tr>
            <td class="label">No WhatsApp</td>
            <td>: {{ $participantPhone ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Paket</td>
            <td>: {{ $packageName }}</td>
        </tr>
        <tr>
            <td class="label">Total Sesi</td>
            <td>: {{ (int) $group->total_sesi }} sesi</td>
        </tr>
        <tr>
            <td class="label">Sesi Pertama</td>
            <td>: {{ $firstSessionLabel ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Instruktur</td>
            <td>: {{ $group->instructor?->user?->name ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Kendaraan</td>
            <td>: {{ $group->vehicle?->nama_kendaraan ? $group->vehicle->nama_kendaraan . ' (' . $group->vehicle->nomor_plat . ')' : '-' }}</td>
        </tr>
    </table>

    <div class="section-title">Rincian Sesi</div>
    <table class="detail">
        <thead>
        <tr>
            <th style="width: 55px;">Sesi</th>
            <th>Tanggal</th>
            <th>Jam</th>
            <th>Instruktur</th>
            <th>Kendaraan</th>
            <th>Status</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($group->bookings->sortBy('sesi_ke') as $booking)
            @php
                $schedule = $booking->trainingSchedule;
                $slot = $schedule?->timeSlot;
                $vehicle = $schedule?->vehicle ?: $group->vehicle;
                $instructor = $schedule?->instructor?->user?->name ?: $group->instructor?->user?->name;
            @endphp
            <tr>
                <td>{{ (int) $booking->sesi_ke }}</td>
                <td>{{ $schedule ? \App\Support\DateFormatter::date($schedule->tanggal_latihan) : '-' }}</td>
                <td>{{ $slot ? \App\Support\DateFormatter::time($slot->jam_mulai) . ' - ' . \App\Support\DateFormatter::time($slot->jam_selesai) : '-' }}</td>
                <td>{{ $instructor ?: '-' }}</td>
                <td>{{ $vehicle ? $vehicle->nama_kendaraan . ' (' . $vehicle->nomor_plat . ')' : '-' }}</td>
                <td>{{ $booking->status }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <table class="summary">
        <tr>
            <td class="total-label">Nominal Dibayar</td>
            <td class="total-value">Rp{{ number_format($nominalPaid, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="footer">
        Nota ini dibuat otomatis oleh SIKEMUDI dan menjadi bukti pembayaran internal untuk booking paket kursus yang telah dikonfirmasi admin
    </div>
</div>
</body>
</html>
