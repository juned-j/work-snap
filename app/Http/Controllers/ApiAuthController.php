<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiAuthController extends Controller
{
    public function register(Request $request)
    {
        return response()->json(['message' => 'register endpoint']);
    }

    public function login(Request $request)
    {
        return response()->json(['message' => 'login endpoint']);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'logout endpoint']);
    }
}
