<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\WorkSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProductivityOverview extends BaseWidget
{
    protected static ?int $sort = 1;
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

    protected function getStats(): array
    {
        $user = auth()->user();

        // Parse dates with validation
        $filterStartDate = $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : Carbon::today()->startOfDay();
        $filterEndDate = $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : Carbon::today()->endOfDay();

        Log::debug('ProductivityOverview filters', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
        ]);

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY - Filter by user
        |--------------------------------------------------------------------------
        */
        $baseQuery = WorkSession::query();

        // Filter by selected user or current user
        if ($this->selectedUser) {
            $baseQuery->where('user_id', $this->selectedUser);
        } elseif (!$user->canViewAll()) {
            $baseQuery->where('user_id', $user->id);
        }

        Log::debug('ProductivityOverview query', [
            'sql' => $baseQuery->toSql(),
            'bindings' => $baseQuery->getBindings(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | HOURS IN SELECTED DATE RANGE
        |--------------------------------------------------------------------------
        */
        $dateRangeSessions = (clone $baseQuery)
            ->whereBetween('start_time', [$filterStartDate, $filterEndDate])
            ->get();

        $dateRangeHours = round(
            $dateRangeSessions->sum(fn ($session) => $session->duration_hours),
            2
        );

        /*
        |--------------------------------------------------------------------------
        | THIS WEEK HOURS
        |--------------------------------------------------------------------------
        */
        $weekStart = Carbon::now()->startOfWeek()->startOfDay();
        $weekEnd = Carbon::now()->endOfWeek()->endOfDay();

        $weeklySessions = (clone $baseQuery)
            ->whereBetween('start_time', [$weekStart, $weekEnd])
            ->get();

        $weeklyHours = round(
            $weeklySessions->sum(fn ($session) => $session->duration_hours),
            2
        );

        /*
        |--------------------------------------------------------------------------
        | TOP ACTIVE EMPLOYEE NAME
        |--------------------------------------------------------------------------
        */
        $topEmployee = User::with(['workSessions' => function ($q) use ($filterStartDate, $filterEndDate) {
            $q->whereBetween('start_time', [$filterStartDate, $filterEndDate]);
        }])
            ->when($this->selectedUser, fn ($q) => $q->where('id', $this->selectedUser))
            ->when(! $user->canViewAll(), fn ($q) => $q->where('id', $user->id))
            ->whereHas('workSessions', function ($q) use ($filterStartDate, $filterEndDate) {
                $q->whereBetween('start_time', [$filterStartDate, $filterEndDate]);
            })
            ->get()
            ->map(function ($emp) {
                return [
                    'user' => $emp,
                    'hours' => $emp->workSessions->sum(fn ($s) => $s->duration_hours),
                ];
            })
            ->sortByDesc('hours')
            ->first();

        $topEmployeeName = $topEmployee['user']->name ?? 'N/A';
        $topEmployeeHours = round($topEmployee['hours'] ?? 0, 2);

        /*
        |--------------------------------------------------------------------------
        | IDLE SESSIONS IN DATE RANGE
        |--------------------------------------------------------------------------
        */
        $idleCount = (clone $baseQuery)
            ->where('status', 'idle')
            ->whereBetween('start_time', [$filterStartDate, $filterEndDate])
            ->count();

        $stats = [
            Stat::make(
                $user->canViewAll() ? 'Total Hours' : 'My Hours',
                $dateRangeHours . ' hrs'
            )
                ->description($this->startDate && $this->endDate
                    ? "From {$this->startDate} to {$this->endDate}"
                    : 'Today\'s tracked hours')
                ->color('success')
                ->icon('heroicon-m-clock')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]),

            Stat::make(
                $user->canViewAll() ? 'Weekly Hours' : 'My Weekly Hours',
                $weeklyHours . ' hrs'
            )
                ->description('Current week tracked hours')
                ->color('primary')
                ->icon('heroicon-m-calendar-days')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]),

            Stat::make(
                'Top Active Employee',
                $topEmployeeName
            )
                ->description($topEmployeeHours > 0 ? "{$topEmployeeHours} hrs" : 'No active employee')
                ->color('success')
                ->icon('heroicon-m-user')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]),

            Stat::make(
                'Idle Sessions',
                $idleCount
            )
                ->description('Idle sessions in selected period')
                ->color('warning')
                ->icon('heroicon-m-pause-circle')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]),
        ];

        /*
        |--------------------------------------------------------------------------
        | TOP EMPLOYEE (Admin only, when no user selected)
        |--------------------------------------------------------------------------
        */
        return $stats;
    }
}
    
