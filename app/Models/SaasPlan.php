<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\UserDataScope;

class SaasPlan extends Model
{
    use HasFactory , UserDataScope;

    protected $table = 'saas_plans';

    protected $fillable = [
        'name',
        'slug',
        'price',
        // 'currency',
        'billing_interval',
        'stripe_product_id',
        'stripe_price_id',
        'stripe_plan_id',
        'features',
        'max_branches',
        'max_trainers',
        'max_members',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}