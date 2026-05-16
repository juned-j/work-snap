<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'session_id',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function session()
    {
        return $this->belongsTo(WorkSession::class, 'session_id');
    }

    /**
     * Get logs for user with optional filtering
     */
    public static function getUserLogs($userId, $action = null, $limit = 100)
    {
        $query = self::where('user_id', $userId)->latest();

        if ($action) {
            $query->where('action', $action);
        }

        return $query->limit($limit)->get();
    }
}
