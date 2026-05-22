<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'api_token',
        'role',
    ];

    protected $hidden = [
        'password',
        'api_token',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
