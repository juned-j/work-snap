<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\UserDataScope;
class WorkSession extends Model
{
    use HasFactory   , UserDataScope;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'status',
        'is_active',
        'paused_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'paused_at' => 'datetime',
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

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'session_id');
    }

    public function getDurationHoursAttribute(): float
    {
        // If no start_time, return 0
        if (! $this->start_time) {
            return 0;
        }

        // Determine the correct end boundary for the session.
        // Paused sessions should freeze at paused_at, stopped sessions at end_time,
        // and active sessions should continue from now.
        if ($this->end_time) {
            $end = $this->end_time;
        } elseif ($this->status === 'paused' || ! $this->is_active) {
            $end = $this->paused_at ?? $this->start_time;
        } else {
            $end = now();
        }

        if ($end->lessThan($this->start_time)) {
            return 0;
        }

        $pausedSeconds = (int) ($this->total_paused_seconds ?? 0);
        $durationSeconds = max(0, $this->start_time->diffInSeconds($end) - $pausedSeconds);

        return round($durationSeconds / 3600, 2);
    }

    public function getDurationTextAttribute(): string
    {
        return number_format($this->duration_hours, 2) . ' hrs';
    }
}
