<?php

use App\Models\User;
use App\Services\Inbody\InBodyService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('sends the file with correct multipart field name', function () {
    $user = User::factory()->create();

    // Create a fake image in temp_inbody
    $fakeImage = UploadedFile::fake()->image('inbody.jpg');
    $path = Storage::disk('public')->putFile('temp_inbody', $fakeImage);

    Http::fake([
        config('services.ai.url').'/predict*' => Http::response([
            'status' => 'success',
            'status_code' => 200,
            'inbody_data' => [
                'height' => '1.84',
                'weight' => '109.70',
                'age' => '21.00',
                'gender' => 'Male',
                'muscle_mass' => '35.20',
                'body_fat_percentage' => '41.50',
                'body_fat_mass' => '45.50',
                'water' => '46.90',
                'protein' => '11.80',
                'minerals' => '5.50',
                'bmi' => '32.40',
                'measured_at' => '08/04/2020',
            ],
        ], 200),
    ]);

    $service = new InBodyService;
    $result = $service->processInBodyImage($user, $path);

    Http::assertSent(function ($request) {
        // Verify the multipart field is named 'file' not 'image'
        foreach ($request->data() as $item) {
            if ($item['name'] === 'file') {
                return true;
            }
        }

        return false;
    });
});

it('normalizes AI response field names correctly', function () {
    $user = User::factory()->create();

    $fakeImage = UploadedFile::fake()->image('inbody.jpg');
    $path = Storage::disk('public')->putFile('temp_inbody', $fakeImage);

    Http::fake([
        config('services.ai.url').'/predict*' => Http::response([
            'status' => 'success',
            'status_code' => 200,
            'inbody_data' => [
                'height' => '1.84',
                'weight' => '109.70',
                'age' => '21.00',
                'gender' => 'Male',
                'muscle_mass' => '35.20',
                'body_fat_percentage' => '41.50',
                'body_fat_mass' => '45.50',
                'water' => '46.90',
                'protein' => '11.80',
                'minerals' => '5.50',
                'bmi' => '32.40',
                'measured_at' => '08/04/2020',
            ],
        ], 200),
    ]);

    $service = new InBodyService;
    $result = $service->processInBodyImage($user, $path);

    $aiData = $result['ai_data'];

    // muscle_mass should be mapped to smm
    expect($aiData)->toHaveKey('smm')
        ->and($aiData['smm'])->toBe('35.20');

    // body_fat_percentage should be mapped to pbf
    expect($aiData)->toHaveKey('pbf')
        ->and($aiData['pbf'])->toBe('41.50');

    // Original keys should NOT exist
    expect($aiData)->not->toHaveKey('muscle_mass')
        ->and($aiData)->not->toHaveKey('body_fat_percentage');
});

it('converts height from meters to centimeters', function () {
    $user = User::factory()->create();

    $fakeImage = UploadedFile::fake()->image('inbody.jpg');
    $path = Storage::disk('public')->putFile('temp_inbody', $fakeImage);

    Http::fake([
        config('services.ai.url').'/predict*' => Http::response([
            'status' => 'success',
            'status_code' => 200,
            'inbody_data' => [
                'height' => '1.84',
                'weight' => '109.70',
                'age' => '21.00',
                'gender' => 'Male',
                'muscle_mass' => '35.20',
                'body_fat_percentage' => '41.50',
                'body_fat_mass' => '45.50',
                'water' => '46.90',
                'protein' => '11.80',
                'minerals' => '5.50',
                'bmi' => '32.40',
                'measured_at' => '08/04/2020',
            ],
        ], 200),
    ]);

    $service = new InBodyService;
    $result = $service->processInBodyImage($user, $path);

    // 1.84m should become 184cm
    expect((float) $result['ai_data']['height'])->toBe(184.0);
});

it('normalizes gender to lowercase', function () {
    $user = User::factory()->create();

    $fakeImage = UploadedFile::fake()->image('inbody.jpg');
    $path = Storage::disk('public')->putFile('temp_inbody', $fakeImage);

    Http::fake([
        config('services.ai.url').'/predict*' => Http::response([
            'status' => 'success',
            'status_code' => 200,
            'inbody_data' => [
                'height' => '1.84',
                'weight' => '109.70',
                'age' => '21.00',
                'gender' => 'Male',
                'muscle_mass' => '35.20',
                'body_fat_percentage' => '41.50',
                'body_fat_mass' => '45.50',
                'water' => '46.90',
                'protein' => '11.80',
                'minerals' => '5.50',
                'bmi' => '32.40',
                'measured_at' => '08/04/2020',
            ],
        ], 200),
    ]);

    $service = new InBodyService;
    $result = $service->processInBodyImage($user, $path);

    expect($result['ai_data']['gender'])->toBe('male');
});

it('throws exception when AI service returns error', function () {
    $user = User::factory()->create();

    $fakeImage = UploadedFile::fake()->image('inbody.jpg');
    $path = Storage::disk('public')->putFile('temp_inbody', $fakeImage);

    Http::fake([
        config('services.ai.url').'/predict*' => Http::response([
            'detail' => [['type' => 'missing', 'msg' => 'Field required']],
        ], 422),
    ]);

    $service = new InBodyService;
    $service->processInBodyImage($user, $path);
})->throws(Exception::class, 'AI Model error');
