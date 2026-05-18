<?php

namespace App\Filament\Resources\SaasPlanResource\Pages;

use App\Filament\Resources\SaasPlanResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSaasPlan extends EditRecord
{
    protected static string $resource = SaasPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
