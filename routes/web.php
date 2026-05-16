<?php

use App\Http\Controllers\WorkSessionController;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('home');
});
