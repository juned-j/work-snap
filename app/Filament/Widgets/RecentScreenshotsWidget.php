<?php

namespace App\Filament\Widgets;

use App\Models\Screenshot;
use Filament\Widgets\Widget;
use Livewire\Attributes\On;
use Livewire\WithPagination;

class RecentScreenshotsWidget extends Widget
{
    use WithPagination;

    protected static string $view =
        'filament.widgets.recent-screenshots-widget';

    public $startDate;

    public $endDate;

    public $selectedUser;

    #[On('filtersUpdated')]
    public function updateFilters($filters): void
    {
        $this->startDate = $filters['startDate'] ?? null;

        $this->endDate = $filters['endDate'] ?? null;

        $this->selectedUser = $filters['selectedUser'] ?? null;

        $this->resetPage();
    }

    protected function getViewData(): array
    {
        $user = auth()->user();

       

        $query = Screenshot::with([
            'user',
            'session',
        ]);

       

        if ($user->canViewAll()) {

          

            if ($this->selectedUser) {
                $query->where('user_id', $this->selectedUser);
            }

        } else {

          
            $query->where('user_id', $user->id);
        }

       

        $query->when(
            $this->startDate && $this->endDate,
            function ($q) {

                return $q->whereBetween('captured_at', [
                    $this->startDate . ' 00:00:00',
                    $this->endDate . ' 23:59:59',
                ]);
            }
        );

     

        $query->whereNotNull('session_id');

    

        $recentScreenshots = $query
            ->orderByDesc('captured_at')
            ->paginate(6);

        return [
            'recentScreenshots' => $recentScreenshots,
        ];
    }
}