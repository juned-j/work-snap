<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    protected SettingsService $service;

    public function __construct(SettingsService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $userId = $request->user()?->id ?? $request->header('X-User-Id') ?? null;
        if (!$userId) {
            return response()->json(['error' => 'Missing user id'], 400);
        }

        $prefs = $this->service->getPreferencesForUser((string) $userId);
        return response()->json(['preferences' => $prefs]);
    }

    public function update(Request $request)
    {
        $userId = $request->user()?->id ?? $request->header('X-User-Id') ?? null;
        if (!$userId) {
            return response()->json(['error' => 'Missing user id'], 400);
        }

        $payload = $request->input('preferences', []);
        if (!is_array($payload)) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $record = $this->service->savePreferencesForUser((string) $userId, $payload);
        return response()->json(['preferences' => $record->preferences]);
    }

    public function reset(Request $request)
    {
        $userId = $request->user()?->id ?? $request->header('X-User-Id') ?? null;
        if (!$userId) {
            return response()->json(['error' => 'Missing user id'], 400);
        }

        $record = $this->service->resetPreferencesForUser((string) $userId);
        return response()->json(['preferences' => $record->preferences]);
    }

    public function status()
    {
        $result = $this->service->checkApiStatus();
        return response()->json($result);
    }
}
