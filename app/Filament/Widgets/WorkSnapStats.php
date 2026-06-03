<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\WorkSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WorkSnapStats extends BaseWidget
{
    protected static ?int $sort = 1;

    public static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';

    public ?string $startDate = null;

    public ?string $endDate = null;

    public ?string $selectedUser = null;

    protected $listeners = [
        'filtersUpdated',
    ];

    public function mount(
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $selectedUser = null
    ): void {
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

        $filterStartDate = $this->startDate
            ? Carbon::parse($this->startDate)->startOfDay()
            : Carbon::today()->startOfDay();

        $filterEndDate = $this->endDate
            ? Carbon::parse($this->endDate)->endOfDay()
            : Carbon::today()->endOfDay();

        Log::debug('WorkSnapStats filters', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
            'logged_in_user' => $user?->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | ACTIVE QUERY
        |--------------------------------------------------------------------------
        */
        $activeQuery = User::query()
            ->when(
                ! empty($this->selectedUser),
                fn ($q) => $q->where('id', $this->selectedUser),
                fn ($q) => $q->where('id', $user->id)
            )
            ->whereHas('workSessions', function ($query) use (
                $filterStartDate,
                $filterEndDate
            ) {
                $query->whereBetween('start_time', [
                    $filterStartDate,
                    $filterEndDate,
                ])->where('is_active', true);
            });

        Log::debug('WorkSnapStats activeQuery', [
            'sql' => $activeQuery->toSql(),
            'bindings' => $activeQuery->getBindings(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | ACTIVE EMPLOYEES
        |--------------------------------------------------------------------------
        */
        $activeCount = User::query()
            ->when(
                ! empty($this->selectedUser),
                fn ($q) => $q->where('id', $this->selectedUser),
                fn ($q) => $q->where('id', $user->id)
            )
            ->whereHas('workSessions', function ($query) use (
                $filterStartDate,
                $filterEndDate
            ) {
                $query->whereBetween('start_time', [
                    $filterStartDate,
                    $filterEndDate,
                ])->where('is_active', true);
            })
            ->count();

        /*
        |--------------------------------------------------------------------------
        | TOTAL EMPLOYEES
        |--------------------------------------------------------------------------
        */
        $totalEmployees = User::query()
            ->when(
                ! empty($this->selectedUser),
                fn ($q) => $q->where('id', $this->selectedUser),
                fn ($q) => $q->where('id', $user->id)
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | INACTIVE EMPLOYEES
        |--------------------------------------------------------------------------
        */
        $inactiveCount = max(0, $totalEmployees - $activeCount);

        /*
        |--------------------------------------------------------------------------
        | TOTAL SESSIONS
        |--------------------------------------------------------------------------
        */
        $totalSessions = WorkSession::query()
            ->when(
                ! empty($this->selectedUser),
                fn ($q) => $q->where('user_id', $this->selectedUser),
                fn ($q) => $q->where('user_id', $user->id)
            )
            ->whereBetween('start_time', [
                $filterStartDate,
                $filterEndDate,
            ])
            ->count();

        return [

            Stat::make('🟢 Active Employees', $activeCount)
                ->description("Active: {$activeCount} of {$totalEmployees}")
                ->descriptionIcon('heroicon-m-user-group')
                ->color('success')
                ->chart([7, 12, 10, 15, 8, 14, 18]),

            Stat::make('🔴 Inactive Employees', $inactiveCount)
                ->description("Inactive: {$inactiveCount} of {$totalEmployees}")
                ->descriptionIcon('heroicon-m-user-minus')
                ->color('danger')
                ->chart([15, 10, 12, 8, 6, 5, 4]),

            Stat::make('📊 Total Sessions', $totalSessions)
                ->description(
                    $this->startDate && $this->endDate
                        ? "Sessions: {$this->startDate} to {$this->endDate}"
                        : 'Total activity sessions'
                )
                ->descriptionIcon('heroicon-m-cursor-arrow-ripple')
                ->color('primary')
                ->chart([5, 8, 12, 18, 22, 28, 35]),
        ];
    }
}