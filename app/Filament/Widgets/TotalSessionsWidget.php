<?php

namespace App\Filament\Widgets;

use App\Models\WorkSession;
use Filament\Widgets\Widget;

class TotalSessionsWidget extends Widget
{
    protected static string $view = 'filament.widgets.total-sessions-widget';

    protected function getViewData(): array
    {
        $sessions = WorkSession::all();
        $totalHours = $sessions->sum(function ($session) {
            return $session->duration_hours;
        });

        return [
            'totalSessions' => $sessions->count(),
            'totalHours' => round($totalHours, 2),
            'averageHours' => $sessions->count() ? round($totalHours / $sessions->count(), 2) : 0,
        ];
    }
}
