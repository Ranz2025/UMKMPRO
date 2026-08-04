<?php

namespace App\Exceptions;

use Exception;

/**
 * BusinessException — dilempar oleh Service layer untuk error bisnis yang
 * diharapkan (bukan bug). Akan di-render sebagai JSON oleh exception handler.
 *
 * Contoh: stok tidak cukup, SKU duplikat, limit plan terlampaui, dll.
 */
class BusinessException extends Exception
{
    public function __construct(
        string $message,
        private int $httpStatus = 422,
        private string $errorCode = 'BUSINESS_ERROR',
    ) {
        parent::__construct($message);
    }

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Render exception sebagai JSON response.
     * Dipanggil oleh Laravel Exception Handler secara otomatis.
     */
    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'code'    => $this->errorCode,
        ], $this->httpStatus);
    }
}
