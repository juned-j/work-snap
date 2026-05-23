<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\DatabaseNotification;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens  ;

    /*
    |--------------------------------------------------------------------------
    | UUID CONFIG
    |--------------------------------------------------------------------------
    */
    public $incrementing = false;
    protected $keyType = 'string';

    /*
    |--------------------------------------------------------------------------
    | FILLABLE
    |--------------------------------------------------------------------------
    */
    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        
        'role_id',
        'manager_id',
    ];

    /*
    |--------------------------------------------------------------------------
    | HIDDEN
    |--------------------------------------------------------------------------
    */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function setPasswordAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $this->attributes['password'] = Hash::needsRehash($value)
            ? Hash::make($value)
            : $value;
    }

    /*
    |--------------------------------------------------------------------------
    | BOOT UUID
    |--------------------------------------------------------------------------
    */
    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (empty($user->id)) {
                $user->id = (string) Str::uuid();
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function managedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function workSessions(): HasMany
    {
        return $this->hasMany(\App\Models\WorkSession::class, 'user_id');
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(\App\Models\Screenshot::class, 'user_id');
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(DatabaseNotification::class, 'notifiable')->orderBy('created_at', 'desc');
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE HELPERS
    |--------------------------------------------------------------------------
    */

  public function hasRole($roles): bool
{
    $roles = (array) $roles;

    return in_array(
        $this->role?->name ?? '',
        $roles,
        true
    );
}
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['admin', 'super_admin']);
    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isEmployee(): bool
    {
        return $this->hasRole('employee');
    }

    /*
    |--------------------------------------------------------------------------
    | TEAM HELPERS
    |--------------------------------------------------------------------------
    */

    public function getTeamUserIds(): array
    {
        return $this->managedUsers()->pluck('id')->toArray();
    }

    public function canViewAll(): bool
    {
        
    return $this->isAdmin();
    }


    
}