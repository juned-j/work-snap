<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('personal_access_tokens')) {
            return;
        }

        $driver = config('database.default');

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE VARCHAR(255) USING tokenable_id::text");
        } else {
            DB::statement("ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE VARCHAR(255)");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('personal_access_tokens')) {
            return;
        }

        $driver = config('database.default');

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE BIGINT USING tokenable_id::bigint");
        } else {
            DB::statement("ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE BIGINT");
        }
    }
};
