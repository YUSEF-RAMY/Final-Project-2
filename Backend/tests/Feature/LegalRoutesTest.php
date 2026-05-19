<?php

test('privacy policy page renders successfully', function () {
    $response = $this->get('/privacy-policy');

    $response->assertOk()
        ->assertSee('Privacy Policy')
        ->assertSee('yuseframy14@gmail.com');
});

test('user data deletion endpoint returns expected json instructions', function () {
    $response = $this->getJson('/data-deletion');

    $response->assertOk()
        ->assertJson([
            'message' => 'To delete your data, please send an email to yuseframy14@gmail.com. We will permanently delete all associated user data from our system.',
            'contact_email' => 'yuseframy14@gmail.com',
            'status' => 'success',
        ]);
});
