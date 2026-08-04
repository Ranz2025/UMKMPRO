<?php

namespace App\Jobs;

use App\Models\Business;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendLowStockAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries = 3;

    public function __construct(
        public int $businessId,
        public int $productId
    ) {}

    public function handle(): void
    {
        $business = Business::find($this->businessId);
        $product  = Product::find($this->productId);

        if (! $business || ! $product) {
            return;
        }

        Log::info("Low stock alert triggered for business '{$business->name}', product '{$product->name}' (stock: {$product->stock})");
    }
}
