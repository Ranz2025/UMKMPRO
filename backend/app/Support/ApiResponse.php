<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'Berhasil', int $status = 200, array $meta = []): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if (! is_null($data)) {
            $payload['data'] = $data;
        }

        if (! empty($meta)) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function error(string $message = 'Terjadi kesalahan', int $status = 400, string $code = 'ERROR', array $errors = []): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'code' => $code,
        ];

        if (! empty($errors)) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
