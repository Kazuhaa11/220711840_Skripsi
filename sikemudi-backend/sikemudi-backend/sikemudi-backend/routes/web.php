<?php

use App\Http\Controllers\Web\CertificatePreviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

