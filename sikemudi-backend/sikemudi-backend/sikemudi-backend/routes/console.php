<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sikemudi:whatsapp-pengingat-h1')
    ->dailyAt(env('FONNTE_H1_REMINDER_TIME', '08:00'))
    ->withoutOverlapping();

Schedule::command('sikemudi:booking-auto-cancel-belum-upload-bukti')
    ->everyMinute()
    ->withoutOverlapping();
