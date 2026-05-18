<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', // Add other attributes you want to allow for mass assignment
    ];

    public function suppliers()
    {
        return $this->hasMany(Supplier::class); // The 'suppliers' table should have a 'country_id' foreign key
    }
}