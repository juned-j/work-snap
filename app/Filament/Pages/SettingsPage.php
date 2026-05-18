<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class SettingsPage extends Page
{
    
    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $slug = 'settings';

    protected static ?string $navigationIcon = 'heroicon-o-cog'; // Optional: Icon for navigation

    protected static string $view = 'filament.pages.settings-page';

    public function mount(): void
    {
        // Perform any initialization here
    }
    public function getTitle(): string
    {
        return 'Settings';
    }
}
