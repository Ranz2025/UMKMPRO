<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = ['name', 'email', 'password', 'phone', 'avatar_url', 'status'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function businesses(): BelongsToMany
    {
        return $this->belongsToMany(Business::class)->withPivot(['role'])->withTimestamps();
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function getRoleForBusiness(Business $business): ?string
    {
        return $this->businesses()
            ->where('business_id', $business->id)
            ->first()?->pivot?->role;
    }

    public function hasPermissionInBusiness(string $permission, Business $business): bool
    {
        return (bool) $this->getRoleForBusiness($business)
            && $this->hasPermissionTo($permission);
    }
}
