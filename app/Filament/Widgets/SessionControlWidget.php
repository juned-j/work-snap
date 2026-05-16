<?php

namespace App\Filament\Widgets;

use App\Models\WorkSession;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SessionControlWidget extends Widget
{
    protected static string $view = 'filament.widgets.session-control-widget';
    public static bool $isLazy = false;

    public ?string $startDate = null;

    public ?string $endDate = null;

    public ?string $selectedUser = null;

    protected $listeners = [
        'filtersUpdated',
    ];

    public function mount(?string $startDate = null, ?string $endDate = null, ?string $selectedUser = null): void
    {
        $this->startDate = $startDate ?? now()->toDateString();
        $this->endDate = $endDate ?? now()->toDateString();
        $this->selectedUser = $selectedUser;
    }

    public function filtersUpdated(array $filters): void
    {
        $this->startDate = $filters['startDate'] ?? $this->startDate;
        $this->endDate = $filters['endDate'] ?? $this->endDate;
        $this->selectedUser = $filters['selectedUser'] ?? $this->selectedUser;
    }

    protected function getViewData(): array
    {
        // Parse dates
        $filterStartDate = $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : Carbon::today()->startOfDay();
        $filterEndDate = $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : Carbon::today()->endOfDay();

        Log::debug('SessionControlWidget filters', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
        ]);

        $query = WorkSession::query()
            ->with('user')
            ->where('is_active', true)
            ->whereBetween('start_time', [$filterStartDate, $filterEndDate])
            ->when($this->selectedUser, fn ($q) => $q->where('user_id', $this->selectedUser))
            ->orderByDesc('start_time');

        $sessions = $query->get();

        $mappedSessions = $sessions->map(function ($session) {
            return [
                'user_name' => $session->user?->name ?? 'Unknown',
                'start_time' => $session->start_time,
                'duration' => $session->duration_text,
                'hours' => $session->duration_hours,
            ];
        });

        return [
            'activeSessions' => $mappedSessions,
            'activeCount' => $mappedSessions->count(),
        ];
    }
}