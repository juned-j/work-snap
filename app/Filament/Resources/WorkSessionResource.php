<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WorkSessionResource\Pages;
use App\Models\WorkSession;

use Filament\Forms\Form;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Toggle;

use Filament\Resources\Resource;

use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteBulkAction;

class WorkSessionResource extends Resource
{
    protected static ?string $model = WorkSession::class;

    protected static ?string $navigationIcon = 'heroicon-o-clock';
    protected static ?string $navigationLabel = 'Work Sessions';

    /**
     * FORM
     */
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->label('User')
                    ->searchable()
                    ->required(),

                DateTimePicker::make('start_time')
                    ->label('Start Time')
                    ->required(),

                DateTimePicker::make('end_time')
                    ->label('End Time'),

                Select::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Active',
                        'ended' => 'Ended',
                        'paused' => 'Paused',
                    ])
                    ->default('active')
                    ->required(),

                Toggle::make('is_active')
                    ->label('Is Active')
                    ->default(true),
            ]);
    }

    /**
     * TABLE
     */
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
               

                TextColumn::make('user.name')
                    ->label('User')
                    ->sortable()
            ->searchable(isIndividual: true),


                BadgeColumn::make('status')
                    ->label('Status')
            ->searchable(isIndividual: true)

                    ->colors([
                        'success' => 'active',
                        'danger' => 'ended',
                        'warning' => 'paused',
                    ]),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
                TextColumn::make('start_time')
                    ->label('Start Time')
                    ->dateTime()
                    ->sortable(),

                TextColumn::make('end_time')
                    ->label('End Time')
                    ->dateTime()
                    ->sortable(),


                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                DeleteBulkAction::make(),
            ]);
    }

    /**
     * PAGES
     */
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWorkSessions::route('/'),
            'create' => Pages\CreateWorkSession::route('/create'),
            'edit' => Pages\EditWorkSession::route('/{record}/edit'),
        ];
    }

//      public static function canViewAny(): bool
// {
//     $user = auth()->user();

//     if (! $user) {
//         return false;
//     }

//     return $user->hasRole([
//         'super_admin',
//         'admin',
//     ]);
// }
}