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
        Schema::create('saas_plans', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->string('slug')->unique();

            $table->decimal('price', 10, 2);

            $table->string('currency', 10)->default('INR');

            $table->string('billing_interval');

            $table->integer('max_branches')->default(1);

            $table->integer('max_trainers')->default(1);

            $table->integer('max_members')->default(10);

            $table->string('stripe_product_id')->nullable();

            $table->string('stripe_price_id')->nullable();

            $table->string('stripe_plan_id')->nullable();

            $table->json('features')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_plans');
    }
};