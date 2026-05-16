<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    public function getPreferencesForUser(string $userId): array
    {
        $record = Setting::where('user_id', $userId)->first();
        if (!$record) {
            return [];
        }
        return $record->preferences ?? [];
    }

    public function savePreferencesForUser(string $userId, array $preferences): Setting
    {
        $record = Setting::updateOrCreate(
            ['user_id' => $userId],
            ['preferences' => $preferences]
        );

        return $record;
    }

    public function resetPreferencesForUser(string $userId): Setting
    {
        $record = Setting::updateOrCreate(
            ['user_id' => $userId],
            ['preferences' => []]
        );

        return $record;
    }

    public function checkApiStatus(): array
    {
        // Lightweight check — ensure DB reachable
        try {
            \DB::connection()->getPdo();
            return ['status' => 'online', 'message' => 'API reachable'];
        } catch (\Exception $e) {
            return ['status' => 'offline', 'message' => 'API unreachable: ' . $e->getMessage()];
        }
    }
}
