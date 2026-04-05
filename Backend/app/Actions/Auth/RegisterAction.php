<?php
namespace App\Actions\Auth;

use App\Repositories\Auth\UserRepository;
use App\Repositories\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class RegisterAction
{
    // هنستخدم الـ Repository هنا بدل الموديل مباشرة
    public function __construct(protected UserRepository $userRepo) {}

    public function execute(array $data)
    {
        // تشفير الباسورد قبل الحفظ
        $data['password'] = Hash::make($data['password']);
        
        // حفظ المستخدم عن طريق الـ Repo
        return $this->userRepo->create($data);
    }
}