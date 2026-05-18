<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionResource\Pages;
use App\Models\Subscription;
use App\Models\User;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationLabel = 'Subscriptions';

    protected static ?string $modelLabel = 'Subscription';

    protected static ?string $pluralModelLabel = 'Subscriptions';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Subscription Assignment')
                ->description('Link a member to a membership plan.')
                ->schema([
                    Select::make('user_id')
                        ->label('Member')
                        ->relationship('user', 'name')
                        ->searchable()
                        ->preload()
                        ->required()
                        ->options(function () {
                            return User::whereHas('role', function ($query) {
                                $query->where('name', 'member');
                            })->pluck('name', 'id');
                        }),

                ])
                ->columns(2),

            Section::make('Status & Timing')
                ->schema([
                    Select::make('status')
                        ->options([
                            'active' => 'Active',
                            'trialing' => 'Trialing',
                            'past_due' => 'Past Due',
                            'canceled' => 'Canceled',
                            'expired' => 'Expired',
                        ])
                        ->default('active')
                        ->required(),

                    TextInput::make('stripe_subscription_id')
                        ->label('Stripe Subscription ID')
                        ->placeholder('sub_xxxxxxxxx')
                        ->nullable(),

                    DateTimePicker::make('trial_ends_at')
                        ->label('Trial Ends At')
                        ->native(false),

                    DateTimePicker::make('ends_at')
                        ->label('Subscription Ends At')
                        ->native(false),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Member')
                    ->searchable()
                    ->sortable(),


                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'trialing',
                        'danger' => ['past_due', 'canceled', 'expired'],
                    ]),

                Tables\Columns\TextColumn::make('trial_ends_at')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('ends_at')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
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

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptions::route('/'),
            'create' => Pages\CreateSubscription::route('/create'),
            'edit' => Pages\EditSubscription::route('/{record}/edit'),
        ];
    }
}