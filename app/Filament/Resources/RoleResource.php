<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RoleResource\Pages;
use App\Models\Role;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RoleResource extends Resource
{
    protected static ?string $model = Role::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationLabel = 'Roles';


  
    public static function form(Form $form): Form
    {
        return $form->schema([

            Forms\Components\TextInput::make('name')
                ->label('Role Key (system)')
                ->required()
                ->maxLength(50)
                ->unique(ignoreRecord: true)
                ->helperText('Example: admin, manager, employee'),

            Forms\Components\TextInput::make('label')
                ->label('Display Name')
                ->required()
     ->maxLength(50)
                ->helperText('Example: Admin, Manager, Employee'),
        ]);
    }
//dd check 
   
    public static function table(Table $table): Table
    {
        return $table
        ->searchable(false)
            ->columns([

            
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                                  ->extraAttributes([
                        'style' => 'max-width: 200px; white-space: normal; word-wrap: break-word;',
                    ])
                    ->wrap()
                    ->badge(),

                Tables\Columns\TextColumn::make('label')
                              ->extraAttributes([
                        'style' => 'max-width: 200px; white-space: normal; word-wrap: break-word;',
                    ])
                    ->wrap()
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),

            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

   
    public static function getRelations(): array
    {
        return [];
    }

   
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRoles::route('/'),
            'create' => Pages\CreateRole::route('/create'),
            'edit' => Pages\EditRole::route('/{record}/edit'),
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