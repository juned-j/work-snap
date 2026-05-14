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
            // id: int8 Primary Key (Auto-incrementing)
            $table->id(); 

            // user_id: uuid (Foreign Key reference)
            $table->uuid('user_id');

            // session_id: int8 (Session tracking)
            $table->bigInteger('session_id');

            // event_type: varchar
            $table->string('event_type');

            // metadata: jsonb (Supabase/Postgres specific)
            // Note: Agar MySQL hai toh simple json() use karein
            $table->jsonb('metadata')->default('{}');

            // created_at: timestamptz
            // timestamps() default 'created_at' aur 'updated_at' bana deta hai
            $table->timestampTz('created_at')->useCurrent();
            
            // Agar aapko updated_at bhi chahiye toh:
            // $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

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