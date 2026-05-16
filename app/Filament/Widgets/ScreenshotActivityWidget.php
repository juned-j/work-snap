<?php

namespace App\Filament\Widgets;

use App\Models\Screenshot;
use Carbon\Carbon;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Log;

class ScreenshotActivityWidget extends Widget
{
    protected static string $view =
        'filament.widgets.screenshot-activity-widget';

    public ?string $startDate = null;

    public ?string $endDate = null;

    public static bool $isLazy = false;

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
        $user = auth()->user();

        // Parse dates
        $filterStartDate = $this->startDate ? Carbon::parse($this->startDate)->startOfDay() : Carbon::today()->startOfDay();
        $filterEndDate = $this->endDate ? Carbon::parse($this->endDate)->endOfDay() : Carbon::today()->endOfDay();

        Log::debug('ScreenshotActivityWidget filters', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
        ]);

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY - with proper relationships
        |--------------------------------------------------------------------------
        */
        $query = Screenshot::query()
            ->with(['user', 'session'])
            ->whereNotNull('session_id');

        Log::debug('ScreenshotActivityWidget baseQuery', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | ROLE BASED ACCESS & USER FILTERING
        |--------------------------------------------------------------------------
        */
        if ($user->canViewAll()) {
            if ($this->selectedUser) {
                $query->where('user_id', $this->selectedUser);
            }
        } else {
            $query->where('user_id', $user->id);
        }

        /*
        |--------------------------------------------------------------------------
        | DATE RANGE FILTERING
        |--------------------------------------------------------------------------
        */
        $query->whereBetween('captured_at', [$filterStartDate, $filterEndDate]);

        /*
        |--------------------------------------------------------------------------
        | RECENT SCREENSHOTS
        |--------------------------------------------------------------------------
        */
        $recentScreenshots = (clone $query)
            ->orderByDesc('captured_at')
            ->limit(6)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | TODAY COUNT
        |--------------------------------------------------------------------------
        */
        $todayCount = (clone $query)->count();

        /*
        |--------------------------------------------------------------------------
        | LAST SCREENSHOT
        |--------------------------------------------------------------------------
        */
        $lastScreenshot = $recentScreenshots->first();

        return [
            'todayCount' => $todayCount,
            'recentScreenshots' => $recentScreenshots,
            'lastScreenshot' => $lastScreenshot,
        ];
    }
}
