<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['name', 'email', 'password', 'profile_image'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = ['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime:Y-m-d h:i:s A',
            'updated_at' => 'datetime:Y-m-d h:i:s A',
            'password' => 'hashed',
        ];
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function routeNotificationForFcm()
    {
        return $this->devices()->pluck('fcm_token')->toArray();
    }

    public function body_report()
    {
        return $this->hasMany(Body_report::class);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function target()
    {
        return $this->hasOne(UserTarget::class, 'user_id');
    }

    public function meals()
    {
        return $this->hasMany(Meal::class);
    }

    public function mealPlans()
    {
        return $this->hasMany(MealPlan::class);
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        return Str::of($this->name)->explode(' ')->take(2)->map(fn ($word) => Str::substr($word, 0, 1))->implode('');
    }
}
