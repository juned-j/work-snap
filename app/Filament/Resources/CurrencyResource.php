<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CurrencyResource\Pages;
use App\Models\Currency;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rule;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\BulkActionGroup;
use Illuminate\Support\Collection;
use Filament\Notifications\Notification;


class CurrencyResource extends Resource
{
    protected static ?string $model = Currency::class;
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('currency_code')
                    ->label('Currency Code')
                    ->required()
                    ->maxLength(30)
                    ->unique(
                        table: 'currencies',
                        column: 'currency_code',
                        ignorable: fn($record) => $record
                    )
                    ->validationAttribute('Currency Code'),
                Forms\Components\TextInput::make('currency_name')
                    ->label('Currency Name')
                    ->required()
                    ->maxLength(30)
                    ->rules(['max:30'])
                    ->validationAttribute('Currency Name'),
                Forms\Components\TextInput::make('exchange_rate')
                    ->label('Exchange Rate')
                    ->required()
                    ->numeric()
                    ->minValue(0.01)
                    ->rules(['numeric', 'min:0.01'])
                    ->validationMessages([
                        'min' => 'The exchange rate must be greater than 0.'
                    ])
                    ->validationAttribute('Exchange Rate'),
                Forms\Components\TextInput::make('currency_symbol')
                    ->label('Currency Symbol')
                    ->required()
                    ->maxLength(4)
                    ->unique(
                        table: 'currencies',
                        column: 'currency_symbol',
                        ignorable: fn($record) => $record
                    )
                    ->rules(['max:4'])
                    ->validationAttribute('Currency Symbol'),
                Forms\Components\Checkbox::make('is_default')
                    ->label('Set as Default Currency')
                    ->helperText('Only one currency can be set as default.')
                    ->default(false)
                    ->rule(function ($get, $context, $record) {
                        if ($get('is_default')) {
                            return Rule::unique('currencies', 'is_default')
                                ->where(function ($query) use ($record) {
                                    if ($record) {
                                        $query->where('id', '!=', $record->id);
                                    }
                                    return $query->where('is_default', true);
                                });
                        }
                        return null;
                    }),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('currency_code')
                    ->label('Currency Code')
                    ->sortable()
                    ->searchable(isIndividual: true)
                    ->formatStateUsing(function ($state, $record) {
                        return $record->is_default
                            ? "{$state} <span class='badge' style='background-color: #17a2b8; color: white; padding: 0.2rem 0.4rem;'>Default Currency</span>"
                            : $state;
                    })->html(),
                Tables\Columns\TextColumn::make('currency_name')
                    ->label('Currency Name')
                    ->sortable()
                    ->searchable(isIndividual: true)
                    ->limit(30),
                Tables\Columns\TextColumn::make('exchange_rate')
                    ->label('Exchange Rate')
                    ->sortable()
                    ->searchable(isIndividual: true),
                Tables\Columns\TextColumn::make('currency_symbol')
                    ->label('Currency Symbol')
                    ->sortable()
                    ->searchable(isIndividual: true),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn($record) => !$record->is_default),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->before(function (Collection $records, DeleteBulkAction $action) {
                            $defaultRecords = $records->where('is_default', true);

                            if ($defaultRecords->isNotEmpty()) {
                                $records->forget($defaultRecords->keys());
                                Notification::make()
                                    ->title('Default currencies cannot be deleted.')
                                    ->warning()
                                    ->send();
                            }
                            if ($records->isEmpty()) {
                                $action->cancel();
                            }
                        }),
                ]),
            ])
            ->searchable(false);;
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCurrencies::route('/'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }
}
