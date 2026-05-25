<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScreenshotResource\Pages;
use App\Models\Screenshot;
use Filament\Forms\Form;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Tables;

class ScreenshotResource extends Resource
{
    protected static ?string $model = Screenshot::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationLabel = 'Screenshots';

 
    public static function form(Form $form): Form
    {
        return $form->schema([

            
        ]);
    }

  
    public static function table(Table $table): Table
    {
        return $table
        ->recordUrl(null)
  ->searchable(false)
           
            ->modifyQueryUsing(fn ($query) =>
                $query->with(['user', 'session'])
                      ->orderByDesc('captured_at')
                      ->orderByDesc('id')
            )

            ->paginated([10, 25, 50, 100])

            ->deferLoading()

            ->columns([

            
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable(isIndividual: true)
                    ->sortable()
                    ->toggleable(),

       Tables\Columns\TextColumn::make('session_status')
    ->label('Session')
    ->getStateUsing(function ($record) {

        if (! $record->session) {
            return 'No Session';
        }

        return $record->session->is_active
            ? 'Active'
            : 'Ended';
    })
    ->badge()
    ->color(fn ($state) =>
        $state === 'Active'
            ? 'success'
            : 'danger'
    )
    ->sortable(false)
    ->toggleable(),

                Tables\Columns\TextColumn::make('captured_at')
                    ->label('Captured At')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\ImageColumn::make('image_url')
                    ->label('Screenshot')
                    ->disk('public')
                    ->height(60)
                    
                    ->width(100)
                    ->toggleable(),

            
            ])

            ->actions([
           
            ])

            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

 
    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListScreenshots::route('/'),
            'create' => Pages\CreateScreenshot::route('/create'),
            'edit'   => Pages\EditScreenshot::route('/{record}/edit'),
        ];
    }
     public static function canViewAny(): bool
{
    $user = auth()->user();

    if (! $user) {
        return false;
    }

    return $user->hasRole([
        'super_admin',
        'admin',
    ]);
}
}