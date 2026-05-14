<?php

namespace App\Filament\Widgets;

use App\Models\WorkSession;
use Filament\Widgets\Widget;
use Livewire\Attributes\On;
use Carbon\Carbon;

class SessionControlWidget extends Widget
{
    protected static string $view = 'filament.widgets.session-control-widget';

    public $startDate;
    public $endDate;
    public $selectedUser;

    public function mount(): void
    {
        // Default to today if no filters are passed yet
        $this->startDate = $this->startDate ?? now()->toDateString();
        $this->endDate = $this->endDate ?? now()->toDateString();
    }

    #[On('filtersUpdated')]
    public function updateFilters($filters): void
    {
        $this->startDate = $filters['startDate'];
        $this->endDate = $filters['endDate'];
        $this->selectedUser = $filters['selectedUser'];
    }

    protected function getViewData(): array
    {
        $query = WorkSession::with('user')
            ->where('is_active', true) // Must be active
            ->when($this->selectedUser, fn($q) => $q->where('user_id', $this->selectedUser))
            // Only show sessions that started within the selected date range
            ->when($this->startDate && $this->endDate, function ($q) {
                return $q->whereDate('start_time', '>=', $this->startDate)
                         ->whereDate('start_time', '<=', $this->endDate);
            })
            ->orderByDesc('start_time');

        $sessions = $query->get();

        $mappedSessions = $sessions->map(function ($session) {
            return [
                'user_name'  => $session->user?->name ?? 'Unknown',
                'start_time' => $session->start_time,
                // Use the accessor from your WorkSession model
                'hours'      => $session->duration_hours, 
            ];
        });

        return [
            'activeSessions' => $mappedSessions,
            'activeCount'    => $mappedSessions->count(),
        ];
    }
}