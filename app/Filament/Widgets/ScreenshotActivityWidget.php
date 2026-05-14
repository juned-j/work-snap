<?php

namespace App\Filament\Widgets;

use App\Models\Screenshot;
use Carbon\Carbon;
use Filament\Widgets\Widget;
use Livewire\Attributes\On;
use Livewire\Attributes\Reactive;

class ScreenshotActivityWidget extends Widget
{
    protected static string $view =
        'filament.widgets.screenshot-activity-widget';

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

        $query = Screenshot::query()
            ->with([
                'user',
                'session',
            ]);

        /*
        |--------------------------------------------------------------------------
        | ROLE BASED ACCESS
        |--------------------------------------------------------------------------
        |
        | Admin => all screenshots
        | Employee => own screenshots only
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
            | EMPLOYEE => ONLY OWN SCREENSHOTS
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

                $query->whereBetween('captured_at', [
                    $this->startDate . ' 00:00:00',
                    $this->endDate . ' 23:59:59',
                ]);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | VALID SESSION SCREENSHOTS ONLY
        |--------------------------------------------------------------------------
        */

        $query->whereNotNull('session_id');

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

        $todayQuery = clone $query;

        if (! $this->startDate || ! $this->endDate) {

            $todayQuery->whereDate(
                'captured_at',
                Carbon::today()
            );
        }

        $todayCount = $todayQuery->count();

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