<?php

namespace App\Filament\Widgets;

use App\Models\User;
use App\Models\WorkSession;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ProductivityOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = auth()->user();

        $todayStart = now()->startOfDay();
        $todayEnd   = now()->endOfDay();

        $weekStart  = now()->startOfWeek();
        $weekEnd    = now()->endOfWeek();

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY (scoped by user_id if not admin)
        |--------------------------------------------------------------------------
        */
        $baseQuery = WorkSession::query();

        if (! $user->canViewAll()) {
            $baseQuery->where('user_id', $user->id);
        }

        /*
        |--------------------------------------------------------------------------
        | TOTAL HOURS TODAY (sessions started today)
        |--------------------------------------------------------------------------
        */
        $todaySessions = (clone $baseQuery)
            ->whereBetween('start_time', [$todayStart, $todayEnd])
            ->get();

        $todayHours = round(
            $todaySessions->sum(fn ($session) => $session->duration_hours),
            2
        );

        /*
        |--------------------------------------------------------------------------
        | WEEKLY HOURS (sessions started this week)
        |--------------------------------------------------------------------------
        */
        $weeklySessions = (clone $baseQuery)
            ->whereBetween('start_time', [$weekStart, $weekEnd])
            ->get();

        $weeklyHours = round(
            $weeklySessions->sum(fn ($session) => $session->duration_hours),
            2
        );

        /*
        |--------------------------------------------------------------------------
        | IDLE SESSIONS (only today)
        |--------------------------------------------------------------------------
        */
        $idleCount = (clone $baseQuery)
            ->where('status', 'idle')
            ->whereBetween('start_time', [$todayStart, $todayEnd])
            ->count();

        /*
        |--------------------------------------------------------------------------
        | STATS ARRAY
        |--------------------------------------------------------------------------
        */
        $stats = [
            Stat::make(
                $user->canViewAll() ? 'Total Hours Today' : 'My Hours Today',
                $todayHours . ' hrs'
            )
                ->description('Tracked working hours today')
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
                'Idle Sessions',
                $idleCount
            )
                ->description('Idle sessions today')
                ->color('warning')
                ->icon('heroicon-m-pause-circle')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]),
        ];

        /*
        |--------------------------------------------------------------------------
        | TOP ACTIVE EMPLOYEE (Admin only, sessions started today)
        |--------------------------------------------------------------------------
        */
        if ($user->canViewAll()) {
            $topEmployee = User::with(['workSessions' => function ($q) use ($todayStart, $todayEnd) {
                    $q->whereBetween('start_time', [$todayStart, $todayEnd]);
                }])
                ->get()
                ->map(function ($employee) {
                    $hours = $employee->workSessions->sum(fn ($session) => $session->duration_hours);
                    $employee->total_hours = $hours;
                    return $employee;
                })
                ->sortByDesc('total_hours')
                ->first();

            $topEmployeeName  = $topEmployee?->name ?? 'N/A';
            $topEmployeeHours = round($topEmployee?->total_hours ?? 0, 2);

            $stats[] = Stat::make(
                'Top Active Employee',
                $topEmployeeName
            )
                ->description($topEmployeeHours . ' hrs today')
                ->color('info')
                ->icon('heroicon-m-trophy')
                ->extraAttributes([
                    'class' => 'bg-transparent shadow-none ring-0 border-0 dark:bg-transparent',
                ]);
        }

        return $stats;
    }
}
