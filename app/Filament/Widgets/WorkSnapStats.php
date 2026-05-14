<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\WorkSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Livewire\Attributes\On;

class WorkSnapStats extends BaseWidget
{
    protected static ?int $sort = 1;

    public static bool $isLazy = false;
    protected int|string|array $columnSpan = 'full';
    
    public $startDate = null;
    public $endDate = null;
    public $selectedUser = null;

    #[On('filtersUpdated')]
    public function updateFilters($filters): void
    {
        $this->startDate = $filters['startDate'] ?? null;
        $this->endDate = $filters['endDate'] ?? null;
        $this->selectedUser = $filters['selectedUser'] ?? null;
    }

    protected function getStats(): array
    {
        // Agar startDate select ki hai toh wo use karo, warna current date (Today)
        $targetDate = $this->startDate ?: now()->toDateString();

        /**
         * ✅ Active Employees
         * Filtered by target date and user selection
         */
        $activeCount = User::query()
            ->when($this->selectedUser, fn ($q) => $q->where('id', $this->selectedUser))
            ->whereHas('workSessions', function ($query) use ($targetDate) {
                $query->whereDate('start_time', $targetDate)
                      ->where('is_active', true);
            })
            ->count();

        /**
         * ✅ Total Filtered Employees
         */
        $totalEmployees = User::query()
            ->when($this->selectedUser, fn ($q) => $q->where('id', $this->selectedUser))
            ->count();

        /**
         * ✅ Inactive Employees (Total - Active)
         */
        $inactiveCount = max(0, $totalEmployees - $activeCount);

        /**
         * ✅ Total Sessions Activity
         * Respects the full range selected in the header
         */
        $totalSessionsQuery = WorkSession::query()
            ->when($this->selectedUser, fn ($q) => $q->where('user_id', $this->selectedUser))
            ->when($this->startDate, fn ($q) => $q->whereDate('start_time', '>=', $this->startDate))
            ->when($this->endDate, fn ($q) => $q->whereDate('start_time', '<=', $this->endDate));
            
        $totalSessions = $totalSessionsQuery->count();

        return [
            Stat::make('🟢 Active Employees', $activeCount)
                ->description($this->startDate ? "Active on " . $this->startDate : "Currently active today")
                ->descriptionIcon('heroicon-m-user-group')
                ->color('success')
                ->chart([7, 12, 10, 15, 8, 14, 18]),

            Stat::make('🔴 Inactive Employees', $inactiveCount)
                ->description($this->startDate ? "Inactive on " . $this->startDate : "No active session today")
                ->descriptionIcon('heroicon-m-user-minus')
                ->color('danger')
                ->chart([15, 10, 12, 8, 6, 5, 4]),

            Stat::make('📊 Total Activity', $totalSessions . ' Sessions')
                ->description($this->startDate && $this->endDate 
                    ? "Activity from $this->startDate to $this->endDate" 
                    : "Total recorded activity")
                ->descriptionIcon('heroicon-m-cursor-arrow-ripple')
                ->color('primary')
                ->chart([5, 8, 12, 18, 22, 28, 35]),
        ];
    }
}