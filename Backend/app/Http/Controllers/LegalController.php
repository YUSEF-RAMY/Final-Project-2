<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class LegalController extends Controller
{
    /**
     * Render the Privacy Policy page.
     */
    public function privacyPolicy(): View
    {
        return view('privacy-policy');
    }

    /**
     * Return the User Data Deletion instructions as JSON response.
     */
    public function dataDeletion(): JsonResponse
    {
        return response()->json([
            'message' => 'To delete your data, please send an email to yuseframy14@gmail.com. We will permanently delete all associated user data from our system.',
            'instruction' => 'Upon receiving your request, we will permanently delete all associated user data, including name, email, profile image, phone number, linked social accounts, and application activity from our system within 48 hours.',
            'contact_email' => 'yuseframy14@gmail.com',
            'status' => 'success',
        ]);
    }
}
