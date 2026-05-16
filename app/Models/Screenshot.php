<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screenshot extends Model
{
    use HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'session_id',
        'captured_at',
        'image_url',
        'file_path',
        'idle_detected',
        'access_token',
        'access_token_expires_at',
        'ip_address',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
        'access_token_expires_at' => 'datetime',
        'idle_detected' => 'boolean',
    ];

    protected $hidden = [
        'access_token',
        'file_path',
        'ip_address'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function session()
    {
        return $this->belongsTo(WorkSession::class, 'session_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        $value = $this->attributes['image_url'] ?? null;

        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return asset($value);
    }

    /**
     * Check if the access token is still valid
     */
    public function isAccessTokenValid(): bool
    {
        if (!$this->access_token_expires_at) {
            return false;
        }

        return now()->isBefore($this->access_token_expires_at);
    }

    public function getEmployeeAttribute()
    {
        return $this->user;
    }
}
