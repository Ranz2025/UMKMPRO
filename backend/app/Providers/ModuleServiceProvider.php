<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        foreach ($this->modulePaths() as $modulePath) {
            $bindingFile = $modulePath.'/bindings.php';

            if (File::exists($bindingFile)) {
                $bindings = require $bindingFile;

                foreach ($bindings as $abstract => $concrete) {
                    $this->app->bind($abstract, $concrete);
                }
            }
        }
    }

    public function boot(): void
    {
        foreach ($this->modulePaths() as $modulePath) {
            $routes = $modulePath.'/routes.php';

            if (File::exists($routes)) {
                // Load SATU KALI dengan prefix 'api' agar konsisten dengan
                // konvensi Laravel (routes/api.php mendapat prefix /api otomatis).
                // Masing-masing routes.php module sudah mendefinisikan sub-prefix v1/*.
                Route::prefix('api')->group($routes);
            }
        }
    }

    /**
     * @return array<int, string>
     */
    protected function modulePaths(): array
    {
        return collect(File::directories(app_path('Modules')))
            ->sort()
            ->values()
            ->all();
    }
}
