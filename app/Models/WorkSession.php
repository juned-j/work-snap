<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'status',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function screenshots()
    {
        return $this->hasMany(Screenshot::class, 'session_id');
    }

    public function getDurationHoursAttribute(): float
    {
        $end = $this->end_time ?: now();

        if (! $this->start_time) {
            return 0;
        }

        return round($this->start_time->diffInSeconds($end) / 3600, 2);
    }

    public function getDurationTextAttribute(): string
    {
        return number_format($this->duration_hours, 2) . ' hrs';
    }
}
