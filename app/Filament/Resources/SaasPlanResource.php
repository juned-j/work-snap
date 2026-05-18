<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SaasPlanResource\Pages;
use App\Models\SaasPlan;
use App\Models\Currency;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;

class SaasPlanResource extends Resource
{
    protected static ?string $model = SaasPlan::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';


    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(50),

                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true),

                TextInput::make('price')
                    ->numeric()
                    ->required()
                    ->rule('min:0'),

                // Select::make('currency')
                //     ->label('Currency')
                //     ->options(
                //         Currency::query()
                //             ->pluck('currency_name', 'currency_name')
                //             ->toArray()
                //     )
                //     ->searchable()
                //     ->required(),

                Select::make('billing_interval')
                    ->options([
                        'monthly' => 'Monthly',
                        'yearly' => 'Yearly',
                    ])
                    ->required(),

                TextInput::make('max_branches')
                    ->numeric()
                    ->rule('min:0')
                    ->required()
                    ->default(1),

                TextInput::make('max_trainers')
                    ->numeric()
                    ->rule('min:0')
                    ->required()
                    ->default(1),

                TextInput::make('max_members')
                    ->numeric()
                    ->rule('min:0')
                    ->required()
                    ->default(10),

                Textarea::make('features')
                    ->label('Features (JSON)')
                    ->helperText('Example: ["Feature 1", "Feature 2"]'),

                Toggle::make('is_active')
                    ->default(true),

                TextInput::make('stripe_product_id'),

                TextInput::make('stripe_price_id'),

                TextInput::make('stripe_plan_id'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('price')
                    ->money('INR')
                    ->sortable(),

                Tables\Columns\TextColumn::make('currency')
                    ->searchable(),

                Tables\Columns\BadgeColumn::make('billing_interval'),

                Tables\Columns\TextColumn::make('max_members'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSaasPlans::route('/'),
            'create' => Pages\CreateSaasPlan::route('/create'),
            'edit' => Pages\EditSaasPlan::route('/{record}/edit'),
        ];
    }
}