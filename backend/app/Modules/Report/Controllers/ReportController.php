<?php

namespace App\Modules\Report\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class ReportController extends Controller
{
    /**
     * Dashboard — ringkasan hari ini / minggu / bulan (Cached 5 menit).
     */
    public function dashboard(Request $request): JsonResponse
    {
        $period   = $request->get('period', 'today');
        $business = app('current.business');

        $cacheKey = "dashboard:summary:{$business->id}:{$period}:".now()->format('YmdH');

        $data = Cache::remember($cacheKey, 300, function () use ($period) {
            [$startDate, $endDate] = $this->parsePeriod($period);

            // Total penjualan periode ini
            $totalSales = Sale::where('status', 'paid')
                ->whereBetween('sold_at', [$startDate, $endDate])
                ->sum('grand_total');

            $totalTransactions = Sale::where('status', 'paid')
                ->whereBetween('sold_at', [$startDate, $endDate])
                ->count();

            // Total pengeluaran
            $totalExpenses = Expense::whereBetween('expense_date', [
                $startDate->toDateString(),
                $endDate->toDateString(),
            ])->sum('amount');

            // Total pembelian
            $totalPurchases = Purchase::where('status', 'received')
                ->whereBetween('purchased_at', [$startDate, $endDate])
                ->sum('grand_total');

            // HPP (Harga Pokok Penjualan)
            $hpp = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->join('products', 'sale_items.product_id', '=', 'products.id')
                ->where('sales.status', 'paid')
                ->whereBetween('sales.sold_at', [$startDate, $endDate])
                ->selectRaw('SUM(sale_items.quantity * products.cost_price) as total_hpp')
                ->value('total_hpp') ?? 0;

            $grossProfit = $totalSales - $hpp;
            $netProfit   = $grossProfit - $totalExpenses;

            // Laba bersih margin
            $margin = $totalSales > 0 ? round(($netProfit / $totalSales) * 100, 2) : 0;

            // Perbandingan dengan periode sebelumnya
            [$prevStart, $prevEnd] = $this->previousPeriod($period, $startDate, $endDate);

            $prevSales = Sale::where('status', 'paid')
                ->whereBetween('sold_at', [$prevStart, $prevEnd])
                ->sum('grand_total');

            $salesGrowth = $prevSales > 0
                ? round((($totalSales - $prevSales) / $prevSales) * 100, 2)
                : null;

            // Grafik penjualan per hari (7 hari terakhir)
            $salesChart = Sale::where('status', 'paid')
                ->whereBetween('sold_at', [$startDate, $endDate])
                ->selectRaw('DATE(sold_at) as date, SUM(grand_total) as total, COUNT(*) as count')
                ->groupByRaw('DATE(sold_at)')
                ->orderBy('date')
                ->get();

            // Top 5 produk terlaris
            $topProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
                ->where('sales.status', 'paid')
                ->whereBetween('sales.sold_at', [$startDate, $endDate])
                ->selectRaw('sale_items.product_id, sale_items.product_name, SUM(sale_items.quantity) as total_qty, SUM(sale_items.line_total) as total_amount')
                ->groupBy('sale_items.product_id', 'sale_items.product_name')
                ->orderByDesc('total_amount')
                ->limit(5)
                ->get();

            // Produk hampir habis stok
            $lowStockCount = Product::whereRaw('stock <= min_stock')
                ->where('is_active', true)
                ->count();

            return [
                'period' => $period,
                'summary' => [
                    'total_sales'        => (int) $totalSales,
                    'total_transactions' => (int) $totalTransactions,
                    'total_expenses'     => (int) $totalExpenses,
                    'total_purchases'    => (int) $totalPurchases,
                    'gross_profit'       => (int) $grossProfit,
                    'net_profit'         => (int) $netProfit,
                    'profit_margin'      => $margin,
                ],
                'comparison' => [
                    'sales_growth' => $salesGrowth,
                    'prev_sales'   => (int) $prevSales,
                ],
                'charts' => [
                    'sales_by_date' => $salesChart,
                    'top_products'  => $topProducts,
                ],
                'alerts' => [
                    'low_stock_count' => $lowStockCount,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * Laporan Penjualan (Ringkasan & Detail Transaksi).
     */
    public function salesSummary(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->get('end_date', now()->toDateString());

        $sales = Sale::where('status', 'paid')
            ->whereBetween('sold_at', ["{$startDate} 00:00:00", "{$endDate} 23:59:59"])
            ->with(['items', 'customer'])
            ->latest('sold_at')
            ->paginate((int) $request->get('per_page', 15));

        $totalSalesAmount = Sale::where('status', 'paid')
            ->whereBetween('sold_at', ["{$startDate} 00:00:00", "{$endDate} 23:59:59"])
            ->sum('grand_total');

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => [
                    'total_sales_amount' => (int) $totalSalesAmount,
                    'total_orders'       => $sales->total(),
                    'start_date'         => $startDate,
                    'end_date'           => $endDate,
                ],
                'sales' => $sales->items(),
            ],
            'meta' => [
                'current_page' => $sales->currentPage(),
                'per_page'     => $sales->perPage(),
                'total'        => $sales->total(),
                'last_page'    => $sales->lastPage(),
            ],
        ]);
    }

    private function parsePeriod(string $period): array
    {
        return match ($period) {
            'today'      => [now()->startOfDay(), now()->endOfDay()],
            'yesterday'  => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
            'this_week'  => [now()->startOfWeek(), now()->endOfWeek()],
            'this_month' => [now()->startOfMonth(), now()->endOfMonth()],
            'this_year'  => [now()->startOfYear(), now()->endOfYear()],
            default      => [now()->startOfDay(), now()->endOfDay()],
        };
    }

    private function previousPeriod(string $period, Carbon $startDate, Carbon $endDate): array
    {
        $diffInDays = $startDate->diffInDays($endDate) + 1;

        return [
            $startDate->copy()->subDays($diffInDays),
            $endDate->copy()->subDays($diffInDays),
        ];
    }
}
