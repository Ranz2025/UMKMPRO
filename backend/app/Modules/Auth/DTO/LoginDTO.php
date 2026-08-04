<?php

namespace App\Modules\Auth\DTO;

use App\Modules\Auth\Requests\LoginRequest;

class LoginDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly bool $remember = false,
    ) {}

    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            remember: (bool) $request->boolean('remember', false),
        );
    }
}
