<?php

namespace App\Support;

use Carbon\Carbon;
use DateTimeInterface;

class DateFormatter
{
    public static function date(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateString();
        }

        return Carbon::parse($value)->toDateString();
    }

    public static function dateTime(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateTimeString();
        }

        return Carbon::parse($value)->toDateTimeString();
    }

    public static function time(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->format('H:i');
        }

        return Carbon::parse($value)->format('H:i');
    }
}