<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\BookingPayment;
use App\Models\BookingRefund;
use App\Models\Instructor;
use App\Models\Participant;
use App\Models\TrainingResult;
use App\Models\Vehicle;
use App\Support\DateFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OperationalReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Ringkasan laporan operasional berhasil diambil.',
            'data' => [
                'stats' => $this->buildSummaryStats($request),
                'generated_at' => now()->toDateTimeString(),
            ],
        ]);
    }


    public function filterOptions(): JsonResponse
    {
        $instructors = Instructor::query()
            ->with('user')
            ->orderBy('kode_instruktur')
            ->get()
            ->map(fn (Instructor $instructor) => [
                'label' => $instructor->user?->name ?? $instructor->kode_instruktur,
                'value' => $instructor->user?->name ?? $instructor->kode_instruktur,
            ])
            ->values()
            ->toArray();

        $packages = \App\Models\CoursePackage::query()
            ->orderBy('nama_paket')
            ->get(['nama_paket'])
            ->map(fn ($package) => [
                'label' => $package->nama_paket,
                'value' => $package->nama_paket,
            ])
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Opsi filter laporan operasional berhasil diambil.',
            'data' => [
                'instructors' => array_merge([
                    ['label' => 'Semua Instruktur', 'value' => 'all'],
                ], $instructors),
                'packages' => array_merge([
                    ['label' => 'Semua Paket', 'value' => 'all'],
                ], $packages),
            ],
        ]);
    }

    public function pendapatanKursus(Request $request): JsonResponse
    {
        $payments = BookingPayment::query()
            ->with([
                'bookingGroup.participant.user',
                'bookingGroup.coursePackage',
                'bookingGroup.refund',
            ])
            ->whereNotNull('booking_group_id')
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('nama_pengirim', 'like', "%{$keyword}%")
                        ->orWhere('bank_pengirim', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhere('metode_pembayaran', 'like', "%{$keyword}%")
                        ->orWhereHas('bookingGroup', function (Builder $groupQuery) use ($keyword) {
                            $groupQuery->where('kode_group', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookingGroup.participant.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookingGroup.coursePackage', function (Builder $packageQuery) use ($keyword) {
                            $packageQuery->where('nama_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->query('status') === 'completed', function (Builder $query) {
                $query->where('status', 'Terkonfirmasi');
            })
            ->when($request->query('status') === 'pending', function (Builder $query) {
                $query->whereIn('status', ['Belum Upload', 'Menunggu Konfirmasi']);
            })
            ->when($request->query('status') === 'cancelled', function (Builder $query) {
                $query->where('status', 'Ditolak');
            })
            ->when($this->hasPaymentMethodFilter($request), function (Builder $query) use ($request) {
                $this->wherePaymentMethod($query, $request->query('metode_pembayaran'));
            })
            ->when($request->filled('package_name') && $request->query('package_name') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('bookingGroup.coursePackage', function (Builder $packageQuery) use ($request) {
                    $packageQuery->where('nama_paket', $request->query('package_name'));
                });
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('created_at', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('created_at', '<=', $request->query('end_date'));
            })
            ->latest()
            ->get();

        $rows = $payments->map(function (BookingPayment $payment) {
            $group = $payment->bookingGroup;
            $refund = $group?->refund;
            $paidAmount = $payment->status === 'Terkonfirmasi' ? (float) $payment->nominal_bayar : 0;
            $refundAmount = $refund?->status_refund === 'Selesai' ? (float) $refund->nominal_refund : 0;

            return [
                'id' => 'REV-' . $payment->id,
                'date' => DateFormatter::date($payment->tanggal_verifikasi ?? $payment->tanggal_upload ?? $payment->created_at),
                'bookingCode' => $group?->kode_group ?? '-',
                'participant' => $group?->participant?->user?->name ?? '-',
                'packageName' => $group?->coursePackage?->nama_paket ?? '-',
                'paymentStatus' => $payment->status,
                'paymentMethod' => $this->resolvePaymentMethodLabel($payment),
                'paymentMethodRaw' => $payment->metode_pembayaran ?: BookingPayment::METODE_TRANSFER,
                'paymentAmount' => $paidAmount,
                'refundAmount' => $refundAmount,
                'netAmount' => max(0, $paidAmount - $refundAmount),
            ];
        })->values();

        return $this->reportResponse('Laporan pendapatan kursus berhasil diambil.', $rows->toArray(), $request);
    }

    public function bookingPaket(Request $request): JsonResponse
    {
        $groups = BookingGroup::query()
            ->with([
                'participant.user',
                'coursePackage',
                'payment',
                'bookings.trainingSchedule',
            ])
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_group', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhereHas('payment', function (Builder $paymentQuery) use ($keyword) {
                            $paymentQuery->where('metode_pembayaran', 'like', "%{$keyword}%")
                                ->orWhere('status', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('participant.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function (Builder $packageQuery) use ($keyword) {
                            $packageQuery->where('nama_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->query('status') === 'completed', function (Builder $query) {
                $query->whereIn('status', ['Selesai']);
            })
            ->when($request->query('status') === 'pending', function (Builder $query) {
                $query->whereIn('status', ['Menunggu Pembayaran', 'Menunggu Konfirmasi Pembayaran']);
            })
            ->when($request->query('status') === 'cancelled', function (Builder $query) {
                $query->where('status', 'Dibatalkan');
            })
            ->when($this->hasPaymentMethodFilter($request), function (Builder $query) use ($request) {
                $query->whereHas('payment', function (Builder $paymentQuery) use ($request) {
                    $this->wherePaymentMethod($paymentQuery, $request->query('metode_pembayaran'));
                });
            })
            ->when($request->filled('package_name') && $request->query('package_name') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('coursePackage', function (Builder $packageQuery) use ($request) {
                    $packageQuery->where('nama_paket', $request->query('package_name'));
                });
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '<=', $request->query('end_date'));
            })
            ->latest()
            ->get();

        $rows = $groups->map(function (BookingGroup $group) {
            $sessionDates = $group->bookings
                ->map(fn (Booking $booking) => $booking->trainingSchedule?->tanggal_latihan)
                ->filter()
                ->sort()
                ->values();

            return [
                'id' => (string) $group->id,
                'bookingCode' => $group->kode_group,
                'participant' => $group->participant?->user?->name ?? '-',
                'packageName' => $group->coursePackage?->nama_paket ?? '-',
                'totalSessions' => (int) $group->total_sesi,
                'bookingStatus' => $group->status,
                'paymentStatus' => $group->payment?->status ?? 'Belum Upload',
                'paymentMethod' => $this->resolvePaymentMethodLabel($group->payment),
                'paymentMethodRaw' => $group->payment?->metode_pembayaran ?: BookingPayment::METODE_TRANSFER,
                'firstSession' => DateFormatter::date($sessionDates->first()),
                'lastSession' => DateFormatter::date($sessionDates->last()),
            ];
        })->values();

        return $this->reportResponse('Laporan booking paket kursus berhasil diambil.', $rows->toArray(), $request);
    }

    public function pemakaianKendaraan(Request $request): JsonResponse
    {
        $vehicles = Vehicle::query()
            ->with(['trainingSchedules' => function ($query) use ($request) {
                $query
                    ->with(['timeSlot', 'bookings.trainingResult'])
                    ->when($request->filled('start_date'), function ($scheduleQuery) use ($request) {
                        $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('start_date'));
                    })
                    ->when($request->filled('end_date'), function ($scheduleQuery) use ($request) {
                        $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('end_date'));
                    });
            }])
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('nama_kendaraan', 'like', "%{$keyword}%")
                        ->orWhere('model', 'like', "%{$keyword}%")
                        ->orWhere('nomor_plat', 'like', "%{$keyword}%")
                        ->orWhere('transmisi', 'like', "%{$keyword}%");
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderBy('nama_kendaraan')
            ->get();

        $rows = $vehicles->map(function (Vehicle $vehicle) {
            $schedules = $vehicle->trainingSchedules;
            $usedSchedules = $schedules->filter(fn ($schedule) => $schedule->bookings->whereNotIn('status', ['Dibatalkan'])->isNotEmpty());
            $bookings = $schedules->flatMap(fn ($schedule) => $schedule->bookings);
            $finishedSessions = $bookings->where('status', 'Selesai')->count();
            $cancelledSessions = $bookings->where('status', 'Dibatalkan')->count();
            $usedHours = $usedSchedules->sum(fn ($schedule) => (int) ($schedule->timeSlot?->durasi_menit ?? 0)) / 60;

            return [
                'id' => (string) $vehicle->id,
                'vehicle' => $vehicle->nama_kendaraan,
                'plateNumber' => $vehicle->nomor_plat,
                'transmission' => $vehicle->transmisi,
                'usedSessions' => $usedSchedules->count(),
                'usedHours' => round($usedHours, 1),
                'finishedSessions' => $finishedSessions,
                'cancelledSessions' => $cancelledSessions,
                'status' => $vehicle->status,
            ];
        })->values();

        return $this->reportResponse('Laporan pemakaian kendaraan berhasil diambil.', $rows->toArray(), $request);
    }

    public function jadwalInstruktur(Request $request): JsonResponse
    {
        $instructors = Instructor::query()
            ->with(['user', 'trainingSchedules' => function ($query) use ($request) {
                $query
                    ->with(['timeSlot', 'bookings.trainingResult'])
                    ->when($request->filled('start_date'), function ($scheduleQuery) use ($request) {
                        $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('start_date'));
                    })
                    ->when($request->filled('end_date'), function ($scheduleQuery) use ($request) {
                        $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('end_date'));
                    });
            }])
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_instruktur', 'like', "%{$keyword}%")
                        ->orWhere('jabatan', 'like', "%{$keyword}%")
                        ->orWhereHas('user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('instructor') && $request->query('instructor') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('user', function (Builder $userQuery) use ($request) {
                    $userQuery->where('name', $request->query('instructor'));
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderBy('kode_instruktur')
            ->get();

        $rows = $instructors->map(function (Instructor $instructor) {
            $schedules = $instructor->trainingSchedules;
            $usedSchedules = $schedules->filter(fn ($schedule) => $schedule->bookings->whereNotIn('status', ['Dibatalkan'])->isNotEmpty());
            $teachingHours = $usedSchedules->sum(fn ($schedule) => (int) ($schedule->timeSlot?->durasi_menit ?? 0)) / 60;
            $bookings = $schedules->flatMap(fn ($schedule) => $schedule->bookings);
            $finishedSessions = $bookings->where('status', 'Selesai')->count();
            $absentSessions = $bookings->pluck('trainingResult')->filter(fn ($result) => $result?->status_kehadiran === 'Tidak Hadir')->count();
            $cancelledSessions = $bookings->where('status', 'Dibatalkan')->count();

            return [
                'id' => (string) $instructor->id,
                'instructor' => $instructor->user?->name ?? $instructor->kode_instruktur,
                'totalSessions' => $usedSchedules->count(),
                'teachingHours' => round($teachingHours, 1),
                'finishedSessions' => $finishedSessions,
                'absentSessions' => $absentSessions,
                'cancelledSessions' => $cancelledSessions,
                'status' => $instructor->status,
            ];
        })->values();

        return $this->reportResponse('Laporan jadwal instruktur berhasil diambil.', $rows->toArray(), $request);
    }

    public function progresPeserta(Request $request): JsonResponse
    {
        $groups = BookingGroup::query()
            ->with([
                'participant.user',
                'participant.certificates',
                'coursePackage',
                'bookings.trainingResult',
            ])
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_group', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhereHas('participant.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function (Builder $packageQuery) use ($keyword) {
                            $packageQuery->where('nama_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('package_name') && $request->query('package_name') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('coursePackage', function (Builder $packageQuery) use ($request) {
                    $packageQuery->where('nama_paket', $request->query('package_name'));
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '<=', $request->query('end_date'));
            })
            ->latest()
            ->get();

        $rows = $groups->map(function (BookingGroup $group) {
            $totalSessions = max(1, (int) $group->total_sesi);
            $finishedSessions = (int) $group->jumlah_sesi_selesai;
            $progress = min(100, round(($finishedSessions / $totalSessions) * 100));
            $finalBooking = $group->bookings->sortByDesc('sesi_ke')->first();
            $finalResult = $finalBooking?->trainingResult;
            $certificate = $group->participant?->certificates
                ?->where('paket_id', $group->course_package_id)
                ->where('status', 'Terbit')
                ->first();

            return [
                'id' => (string) $group->id,
                'participant' => $group->participant?->user?->name ?? '-',
                'packageName' => $group->coursePackage?->nama_paket ?? '-',
                'totalSessions' => (int) $group->total_sesi,
                'finishedSessions' => $finishedSessions,
                'progress' => $progress . '%',
                'finalStatus' => $this->resolveFinalProgressStatus($group, $finalResult),
                'certificateStatus' => $certificate ? 'Terbit' : ($group->participant?->status_sertifikat ?? 'Belum Terbit'),
            ];
        })->values();

        return $this->reportResponse('Laporan progres peserta berhasil diambil.', $rows->toArray(), $request);
    }

    public function hasilLatihan(Request $request): JsonResponse
    {
        $results = TrainingResult::query()
            ->with([
                'participant.user',
                'instructor.user',
                'booking.coursePackage',
                'booking.bookingGroup.coursePackage',
            ])
            ->whereHas('booking', function (Builder $query) {
                $query->whereColumn('sesi_ke', 'total_sesi')
                    ->orWhereNull('booking_group_id');
            })
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('status_kehadiran', 'like', "%{$keyword}%")
                        ->orWhere('status_kelulusan', 'like', "%{$keyword}%")
                        ->orWhereHas('participant.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('booking.coursePackage', function (Builder $packageQuery) use ($keyword) {
                            $packageQuery->where('nama_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('instructor') && $request->query('instructor') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('instructor.user', function (Builder $userQuery) use ($request) {
                    $userQuery->where('name', $request->query('instructor'));
                });
            })
            ->when($request->filled('package_name') && $request->query('package_name') !== 'all', function (Builder $query) use ($request) {
                $query->whereHas('booking.coursePackage', function (Builder $packageQuery) use ($request) {
                    $packageQuery->where('nama_paket', $request->query('package_name'));
                });
            })
            ->when($this->shouldApplyExactStatus($request), function (Builder $query) use ($request) {
                $query->where('status_kelulusan', $request->query('status'));
            })
            ->when($request->query('status') === 'completed', function (Builder $query) {
                $query->where('status_kelulusan', 'Lulus');
            })
            ->when($request->query('status') === 'pending', function (Builder $query) {
                $query->whereNull('validated_at');
            })
            ->when($request->query('status') === 'cancelled', function (Builder $query) {
                $query->where('status_kelulusan', 'Tidak Lulus');
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_latihan', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_latihan', '<=', $request->query('end_date'));
            })
            ->latest('tanggal_latihan')
            ->get();

        $rows = $results->map(function (TrainingResult $result) {
            return [
                'id' => (string) $result->id,
                'participant' => $result->participant?->user?->name ?? '-',
                'packageName' => $result->booking?->coursePackage?->nama_paket
                    ?? $result->booking?->bookingGroup?->coursePackage?->nama_paket
                    ?? '-',
                'instructor' => $result->instructor?->user?->name ?? '-',
                'attendance' => $result->status_kehadiran,
                'finalScore' => $result->nilai_akhir !== null ? (float) $result->nilai_akhir : '-',
                'graduationStatus' => $result->status_kelulusan,
                'validationStatus' => $result->validated_at ? 'Tervalidasi' : 'Belum Validasi',
            ];
        })->values();

        return $this->reportResponse('Laporan hasil latihan dan kelulusan berhasil diambil.', $rows->toArray(), $request);
    }

    private function reportResponse(string $message, array $rows, Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'rows' => $rows,
                'stats' => $this->buildSummaryStats($request),
                'generated_at' => now()->toDateTimeString(),
                'filters' => $request->only(['q', 'start_date', 'end_date', 'status', 'instructor', 'package_name', 'period_type', 'metode_pembayaran']),
            ],
        ]);
    }

    private function buildSummaryStats(Request $request): array
    {
        $grossRevenueQuery = BookingPayment::query()
            ->where('status', 'Terkonfirmasi')
            ->when($this->hasPaymentMethodFilter($request), function (Builder $query) use ($request) {
                $this->wherePaymentMethod($query, $request->query('metode_pembayaran'));
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_verifikasi', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_verifikasi', '<=', $request->query('end_date'));
            });

        $activeBookingQuery = BookingGroup::query()
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang', 'Berlangsung'])
            ->when($this->hasPaymentMethodFilter($request), function (Builder $query) use ($request) {
                $query->whereHas('payment', function (Builder $paymentQuery) use ($request) {
                    $this->wherePaymentMethod($paymentQuery, $request->query('metode_pembayaran'));
                });
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_booking', '<=', $request->query('end_date'));
            });

        $finishedSessionQuery = Booking::query()
            ->where('status', 'Selesai')
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereHas('trainingSchedule', function (Builder $scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('start_date'));
                });
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereHas('trainingSchedule', function (Builder $scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('end_date'));
                });
            });

        $finalResultsQuery = TrainingResult::query()
            ->whereIn('status_kelulusan', ['Lulus', 'Tidak Lulus'])
            ->whereHas('booking', function (Builder $query) {
                $query->whereColumn('sesi_ke', 'total_sesi')
                    ->orWhereNull('booking_group_id');
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_latihan', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_latihan', '<=', $request->query('end_date'));
            });

        $finalResultCount = (clone $finalResultsQuery)->count();
        $passedResultCount = (clone $finalResultsQuery)->where('status_kelulusan', 'Lulus')->count();
        $graduationRate = $finalResultCount > 0 ? round(($passedResultCount / $finalResultCount) * 100) : 0;

        $grossRevenue = (float) $grossRevenueQuery->sum('nominal_bayar');
        $refundAmount = (float) BookingRefund::query()
            ->where('status_refund', 'Selesai')
            ->when($this->hasPaymentMethodFilter($request), function (Builder $query) use ($request) {
                $query->whereHas('bookingPayment', function (Builder $paymentQuery) use ($request) {
                    $this->wherePaymentMethod($paymentQuery, $request->query('metode_pembayaran'));
                });
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_refund', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_refund', '<=', $request->query('end_date'));
            })
            ->sum('nominal_refund');

        return [
            'grossRevenue' => $grossRevenue,
            'activeBookings' => $activeBookingQuery->count(),
            'finishedSessions' => $finishedSessionQuery->count(),
            'graduationRate' => $graduationRate,
            'refundAmount' => $refundAmount,
            'netRevenue' => max(0, $grossRevenue - $refundAmount),
        ];
    }

    private function hasPaymentMethodFilter(Request $request): bool
    {
        return $request->filled('metode_pembayaran')
            && in_array($request->query('metode_pembayaran'), [BookingPayment::METODE_TRANSFER, BookingPayment::METODE_CASH], true);
    }

    private function wherePaymentMethod(Builder $query, string $method): void
    {
        if ($method === BookingPayment::METODE_TRANSFER) {
            $query->where(function (Builder $methodQuery) {
                $methodQuery
                    ->whereNull('metode_pembayaran')
                    ->orWhere('metode_pembayaran', BookingPayment::METODE_TRANSFER);
            });

            return;
        }

        $query->where('metode_pembayaran', $method);
    }

    private function resolvePaymentMethodLabel(?BookingPayment $payment): string
    {
        if (! $payment) {
            return 'Transfer Bank';
        }

        return $payment->paymentMethodLabel();
    }

    private function shouldApplyExactStatus(Request $request): bool
    {
        $status = $request->query('status');

        return $request->filled('status') && !in_array($status, ['all', 'completed', 'pending', 'cancelled'], true);
    }

    private function resolveFinalProgressStatus(BookingGroup $group, ?TrainingResult $finalResult): string
    {
        if ($group->status === 'Dibatalkan') {
            return 'Dibatalkan';
        }

        if ($finalResult?->status_kelulusan && $finalResult->status_kelulusan !== 'Belum Dinilai') {
            return $finalResult->status_kelulusan;
        }

        if ((int) $group->jumlah_sesi_selesai <= 0) {
            return 'Belum Mulai';
        }

        if ($group->isFinished()) {
            return 'Selesai';
        }

        return 'Dalam Proses';
    }
}
