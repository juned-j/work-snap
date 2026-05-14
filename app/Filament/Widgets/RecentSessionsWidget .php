<?php

namespace App\Filament\Widgets;

use App\Models\WorkSession;
use Filament\Widgets\Widget;
use Livewire\Attributes\On;
use Livewire\Attributes\Reactive;

class RecentSessionsWidget extends Widget
{
    protected static string $view =
        'filament.widgets.recent-sessions-widget';

    #[Reactive]
    public ?string $startDate = null;

    #[Reactive]
    public ?string $endDate = null;

    #[Reactive]
    public ?string $selectedUser = null;

    #[On('filtersUpdated')]
    public function updateFilters($filters): void
    {
        $this->startDate = $filters['startDate'] ?? null;

        $this->endDate = $filters['endDate'] ?? null;

        $this->selectedUser = $filters['selectedUser'] ?? null;
    }

    protected function getViewData(): array
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY
        |--------------------------------------------------------------------------
        */

        $query = WorkSession::query()
            ->with('user');

        /*
        |--------------------------------------------------------------------------
        | ROLE BASED ACCESS
        |--------------------------------------------------------------------------
        |
        | Admin => all sessions
        | Employee => own sessions only
        |
        */

        if ($user->canViewAll()) {

            /*
            |--------------------------------------------------------------------------
            | ADMIN FILTERS
            |--------------------------------------------------------------------------
            */

            if ($this->selectedUser) {
                $query->where('user_id', $this->selectedUser);
            }

        } else {

            /*
            |--------------------------------------------------------------------------
            | EMPLOYEE => ONLY OWN SESSIONS
            |--------------------------------------------------------------------------
            */

            $query->where('user_id', $user->id);
        }

        /*
        |--------------------------------------------------------------------------
        | DATE RANGE FILTER
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->startDate && $this->endDate,
            function ($query) {

                $query->whereBetween('start_time', [
                    $this->startDate . ' 00:00:00',
                    $this->endDate . ' 23:59:59',
                ]);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | VALID SESSIONS ONLY
        |--------------------------------------------------------------------------
        */

        $query->whereNotNull('start_time');

        /*
        |--------------------------------------------------------------------------
        | FETCH RECENT SESSIONS
        |--------------------------------------------------------------------------
        */

        $recentSessions = $query
            ->orderByDesc('start_time')
            ->limit(6)
            ->get();

        return [
            'recentSessions' => $recentSessions,
        ];
    }
}