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
    ];

    protected $casts = [
        'captured_at' => 'datetime',
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

    public function getEmployeeAttribute()
    {
        return $this->user;
    }
}
