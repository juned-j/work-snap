<?php

namespace App\Filament\Widgets;

use App\Models\WorkSession;
use Filament\Widgets\Widget;

class TotalSessionsWidget extends Widget
{
    protected static string $view = 'filament.widgets.total-sessions-widget';

    public ?string $selectedUser = null;

    protected $listeners = [
        'filtersUpdated',
    ];

    public function filtersUpdated(array $filters): void
    {
        $this->selectedUser = $filters['selectedUser'] ?? null;
    }

    protected function getViewData(): array
    {
        $user = auth()->user();

        $query = WorkSession::query();

        /*
        |--------------------------------------------------------------------------
        | DATA SOURCE
        |--------------------------------------------------------------------------
        | Admin/User default => apna data
        | Admin filter select kare => selected user ka data
        */
        if (! empty($this->selectedUser)) {

            $query->where('user_id', $this->selectedUser);

        } else {

            $query->where('user_id', $user->id);
        }

        $sessions = $query->get();

        $totalHours = $sessions->sum(function ($session) {
            return $session->duration_hours;
        });

        return [
            'totalSessions' => $sessions->count(),
            'totalHours' => round($totalHours, 2),
            'averageHours' => $sessions->count()
                ? round($totalHours / $sessions->count(), 2)
                : 0,
        ];
    }
}