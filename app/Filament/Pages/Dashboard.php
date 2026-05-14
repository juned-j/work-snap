<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Livewire\Attributes\Url;

class Dashboard extends Page
{
    protected static string $view = 'filament.pages.dashboard';

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationLabel = 'Dashboard';
    
    // FIX: Title ko khali mat chhodein, kam se kam ek string dein
    protected static ?string $title = '';
    
    protected static ?int $navigationSort = -5;

    // URL properties
    #[Url] public $startDate;
    #[Url] public $endDate;
    #[Url] public $selectedUser = null;

    public function mount(): void
    {
        // FIX: Default dates ko initialize karna zaroori hai
        $this->startDate = now()->toDateString();
        $this->endDate = now()->toDateString();
    }

    public function updated($propertyName)
    {
        if (in_array($propertyName, ['startDate', 'endDate', 'selectedUser'])) {
            // Widgets ko update bhejein
            $this->dispatch('filtersUpdated', filters: [
                'startDate' => $this->startDate,
                'endDate' => $this->endDate,
                'selectedUser' => $this->selectedUser,
            ]);
        }
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