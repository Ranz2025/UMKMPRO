<?php

namespace App\Modules\Auth\DTO;

use App\Modules\Auth\Requests\RegisterRequest;

class RegisterDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly ?string $phone = null,
    ) {}

    public static function fromRequest(RegisterRequest $request): self
    {
        return new self(
            name: (string) $request->validated('name'),
            email: (string) $request->validated('email'),
            password: (string) $request->validated('password'),
            phone: $request->validated('phone') ? (string) $request->validated('phone') : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'phone' => $this->phone,
        ], fn ($val) => $val !== null);
    }
}
