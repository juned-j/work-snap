<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('work_sessions', function (Blueprint $table) {
            // Add security tracking fields
            $table->string('ip_address')->nullable()->after('is_active');
            $table->string('user_agent')->nullable()->after('ip_address');
            $table->timestamp('paused_at')->nullable()->after('end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_sessions', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent', 'paused_at']);
        });
    }
};
