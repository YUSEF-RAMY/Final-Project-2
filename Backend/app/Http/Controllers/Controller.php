<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * نجاح العملية مع إرسال بيانات (Data)
     */
    public function sendResponse($data, $message, $code = 200)
    {
        return response()->json(
            [
                'status' => 'success',
                'status_code' => $code,
                'message' => $message,
                'data' => $data,
            ],
            $code,
        );
    }

    /**
     * نجاح العملية بدون بيانات (Success Message Only)
     */
    public function sendSuccess($message, $code = 200)
    {
        return response()->json(
            [
                'status' => 'success',
                'status_code' => $code,
                'message' => $message,
            ],
            $code,
        );
    }

    /**
     * معالجة الأخطاء (Error Response)
     */
    public function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'status' => 'error',
            'status_code' => $code,
            'message' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['errors'] = $errorMessages;
        }

        return response()->json($response, $code);
    }
}
