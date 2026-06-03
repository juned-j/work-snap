<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

trait UserDataScope
{
    protected static function bootUserDataScope(): void
    {
        static::addGlobalScope('user_data_scope', function (Builder $builder) {

            Log::info('UserDataScope Triggered');

            if (! auth()->check()) {

                Log::warning('Auth check failed');

                return;
            }

            $user = auth()->user();

            $model = $builder->getModel();
            $table = $model->getTable();

            Log::info('Authenticated User', [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role?->name ?? null,
                'table' => $table,
            ]);

            // Only apply filter on tables having user_id column
            if (! Schema::hasColumn($table, 'user_id')) {
                return;
            }

            /**
             * Admin can see all records
             * Adjust role name if your role is different
             */
            if (
                $user->role?->name === 'Admin' ||
                $user->role?->name === 'admin'
            ) {
                Log::info('Admin detected - skipping user filter', [
                    'user_id' => $user->id,
                    'table' => $table,
                ]);

                return;
            }

            // Normal users can only see their own data
            $builder->where($table . '.user_id', $user->id);

            Log::info('Applied strict user filter', [
                'user_id' => $user->id,
                'table' => $table,
            ]);
        });
    }
}