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
        Schema::table('screenshots', function (Blueprint $table) {
            // Add secure storage fields
            $table->string('file_path')->nullable()->after('image_url');
            $table->boolean('idle_detected')->default(false)->after('file_path');
            $table->string('access_token')->nullable()->after('idle_detected')->index();
            $table->timestamp('access_token_expires_at')->nullable()->after('access_token');
            $table->string('ip_address')->nullable()->after('access_token_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('screenshots', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'idle_detected', 'access_token', 'access_token_expires_at', 'ip_address']);
        });
    }
};
