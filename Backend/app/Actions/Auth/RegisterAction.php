<?php

namespace App\Actions\Auth;

use App\Mail\WelcomeUserMail;
use App\Repositories\Auth\UserRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class RegisterAction
{
    // هنستخدم الـ Repository هنا بدل الموديل مباشرة
    public function __construct(protected UserRepository $userRepo) {}

    public function execute(array $data)
    {
        if (isset($data['profile_image']) && $data['profile_image'] instanceof UploadedFile) {
            $path = $data['profile_image']->store('profile_images', 'public');

            $data['profile_image'] = $path;
        }
        $data['password'] = Hash::make($data['password']);

        // حفظ المستخدم عن طريق الـ Repo
        $user = $this->userRepo->create($data);

        Mail::to($user->email)->send(new WelcomeUserMail($user));

        return $user;
    }
}
