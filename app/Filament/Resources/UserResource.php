<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Models\Role;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Illuminate\Database\Eloquent\Builder;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationLabel = 'Users';

    public static function form(Form $form): Form
    {
        return $form->schema([

            TextInput::make('name')
                ->label('Name')
                ->required()
                ->maxLength(50),

            TextInput::make('email')
                ->label('Email')
                ->email()
                ->required()
                ->unique(ignoreRecord: true),

            Select::make('role_id')
                ->label('Role')
                ->relationship('role', 'label')
                ->searchable()
                ->preload()
                ->live()
                ->required(),

            Select::make('manager_id')
                ->label('Manager')
                ->relationship(
                    name: 'manager',
                    titleAttribute: 'name',
                    modifyQueryUsing: fn ($query) =>
                        $query->whereHas(
                            'role',
                            fn ($q) => $q->where('name', 'manager')
                        )
                )
                ->searchable()
                ->preload()
                ->visible(function (Get $get) {

                    $roleId = $get('role_id');

                    if (! $roleId) {
                        return false;
                    }

                    $employeeRoleIds = Role::whereIn('name', [
                        'employee',
                        'user',
                    ])->pluck('id')->toArray();

                    return in_array($roleId, $employeeRoleIds);
                }),

            TextInput::make('password')
                ->label('Password')
                ->password()
                ->required(fn ($livewire) =>
                    $livewire instanceof \Filament\Resources\Pages\CreateRecord
                )
                ->dehydrated(fn ($state) => filled($state))
                ->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->searchable(false)
            ->columns([

                TextColumn::make('name')
                    ->searchable(isIndividual: true),

                TextColumn::make('email')
                    ->sortable()
                    ->searchable(isIndividual: true),

                TextColumn::make('role.label')
                    ->label('Role')
                    ->badge()
                    ->sortable()
                    ->searchable(isIndividual: true),

                TextColumn::make('manager.name')
                    ->label('Manager')
                    ->searchable(isIndividual: true),

            
              TextColumn::make('created_at')
    ->label('Created')
    ->dateTime('d M Y')
    ->description(fn ($record) => $record->created_at?->format('h:i A'))
    ->sortable(),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                DeleteBulkAction::make(),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        $user = auth()->user();

        $query = parent::getEloquentQuery();

        // Super Admin & Admin
        if ($user->isAdmin()) {
            return $query;
        }

        // Manager
        if ($user->isManager()) {
            return $query->where(function ($q) use ($user) {
                $q->where('id', $user->id)
                    ->orWhere('manager_id', $user->id);
            });
        }

        // Employee/User
        return $query->where('id', $user->id);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return auth()->check();
    }
}