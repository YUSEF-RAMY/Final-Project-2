<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .wrapper { padding: 40px 0; background-color: #f9fafb; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
        .header { background-color: #0f172a; color: #ffffff; padding: 25px; text-align: center; }
        .content { padding: 40px; text-align: center; color: #1f2937; }
        .otp-box { font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 10px; margin: 30px 0; padding: 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; display: inline-block; }
        .footer { padding: 20px; text-align: center; font-size: 13px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h2 style="margin:0;">{{ env('APP_NAME') }}</h2>
            </div>
            <div class="content">
                <h3 style="margin-top:0;">Password Reset Request</h3>
                <p>We received a request to reset your password. Use the following 6-digit code to complete the process:</p>
                <div class="otp-box">{{ $code }}</div>
                <p style="font-size: 14px; color: #9ca3af;">This code is valid for <b>10 minutes</b> only.</p>
                <p style="font-size: 13px; margin-top: 25px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} {{ env('APP_NAME') }}. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>