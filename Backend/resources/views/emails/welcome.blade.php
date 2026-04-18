<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
        .header { text-align: center; background-color: #4f46e5; padding: 20px; border-radius: 10px 10px 0 0; color: white; }
        .content { padding: 30px; text-align: center; }
        .user-name { color: #4f46e5; font-weight: bold; }
        .button { display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Healthify System</h1>
        </div>
        <div class="content">
            <h2>Welcome aboard, <span class="user-name">{{ $user->name }}</span>!</h2>
            <p>We're thrilled to have you with us. Your journey towards a healthier lifestyle starts here.</p>
            <p>You can now access your dashboard and explore our features.</p>
            {{-- <a href="{{ config('app.url') }}" class="button">Go to Dashboard</a> --}}
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Healthify All rights reserved.</p>
        </div>
    </div>
</body>
</html>