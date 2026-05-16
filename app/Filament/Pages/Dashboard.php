<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Livewire\Attributes\Url;

class Dashboard extends Page
{
    protected static string $view = 'filament.pages.dashboard';
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationLabel = 'Dashboard';
    protected static ?int $navigationSort = -5;
protected static ?string $title = '';


    #[Url]
    public $startDate;

    #[Url]
    public $endDate;

    #[Url]
    public $selectedUser = null;

    public function mount(): void
    {
        $this->startDate = now()->toDateString();
        $this->endDate = now()->toDateString();
        $this->dispatchFilterUpdate();
    }

    private function dispatchFilterUpdate(): void
    {
        $this->dispatch('filtersUpdated', [
            'startDate' => $this->startDate,
            'endDate' => $this->endDate,
            'selectedUser' => $this->selectedUser,
        ]);
    }

    public function updated(string $propertyName, $value): void
    {
        if (in_array($propertyName, ['startDate', 'endDate', 'selectedUser'], true)) {
            $this->dispatchFilterUpdate();
        }
    }

    public function resetFilters(): void
    {
        $this->selectedUser = '';
        $this->startDate = now()->toDateString();
        $this->endDate = now()->toDateString();
        $this->dispatchFilterUpdate();
    }

    public static function canAccess(): bool
    {
        $user = auth()->user();

        if (! $user) {
            return false;
        }

        // hasRole check
        return $user->hasRole([
            'super_admin',
            'admin',
        ]);
    }
}