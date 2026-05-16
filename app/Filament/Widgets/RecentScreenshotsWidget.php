<?php

namespace App\Filament\Widgets;

use App\Models\Screenshot;
use Carbon\Carbon;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Log;
use Livewire\WithPagination;

class RecentScreenshotsWidget extends Widget
{
    use WithPagination;

    protected static string $view = 'filament.widgets.recent-screenshots-widget';
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

        Log::debug('RecentScreenshotsWidget filters', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
        ]);

        $recentScreenshots = Screenshot::with(['user', 'session'])
            ->whereNotNull('session_id')
            ->when($this->selectedUser, fn($q) => $q->where('user_id', $this->selectedUser))
            ->whereBetween('captured_at', [$filterStartDate, $filterEndDate])
            ->orderByDesc('captured_at')
            ->paginate(6);

        return [
            'recentScreenshots' => $recentScreenshots,
        ];
    }
}