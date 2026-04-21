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
        Schema::create('work_sessions', function (Blueprint $table) {
            $table->id(); 

            
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            
            $table->timestampTz('start_time')->useCurrent();
            $table->timestampTz('end_time')->nullable();
            
            $table->string('status')->default('active'); 
            
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_sessions');
    }
};