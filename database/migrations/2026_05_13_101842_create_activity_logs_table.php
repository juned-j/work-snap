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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id(); 

            // user_id: uuid (Foreign Key reference to users table)
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // session_id: int8 (Session tracking)
            $table->bigInteger('session_id');

            // event_type: varchar
            $table->string('event_type');

            // metadata: json (compatible with MySQL and PostgreSQL)
            $table->json('metadata')->default(json_encode([]));

            // created_at and updated_at timestamps
            $table->timestampsTz();

            // Indexes for performance
            $table->index('session_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};