<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class Currency extends Model
{
    use HasFactory;

    protected $table = 'currencies';

    protected $fillable = [
        'text_box',
        'currency_code',
        'currency_name',
        'exchange_rate',
        'currency_symbol',
        'is_default',
    ];
    protected static function booted()
    {
        static::saving(function (Currency $model) {
            if ($model->isDirty('is_default') && ! $model->is_default) {
                $otherDefaultExists = static::where('is_default', true)
                    ->when($model->id, fn($q) => $q->where('id', '!=', $model->id))
                    ->exists();

                if (! $otherDefaultExists) {
                    throw ValidationException::withMessages([
                        'is_default' => 'At least one default currency is required.',
                    ]);
                }
            }
        });

        static::saved(function (Currency $model) {
            if ($model->is_default) {
                static::where('id', '!=', $model->id)
                    ->update(['is_default' => false]);
            }
        });
    }
}
