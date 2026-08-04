#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Save current commit hash for rollback
PREV_COMMIT=$(git rev-parse HEAD)

# Maintenance mode with bypass key
echo "🔒 Enabling maintenance mode..."
php artisan down --retry=60 || true

# Pull latest code
echo "📥 Pulling latest release from git..."
git pull origin main

# Install PHP & NPM dependencies
echo "📦 Installing backend dependencies..."
composer install --no-dev --optimize-autoloader

# Run database migrations
echo "🗄️ Executing database migrations..."
php artisan migrate --force

# Optimize caches
echo "⚡ Clearing and caching configuration & routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart background queue workers
echo "🔄 Restarting queue workers..."
php artisan queue:restart || true

# Bring application out of maintenance mode
echo "🔓 Disabling maintenance mode..."
php artisan up

# Health check verification
echo "🩺 Running health check verification..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/up || echo "000")

if [ "$HEALTH_STATUS" != "200" ]; then
    echo "❌ Health check failed with status $HEALTH_STATUS! Initiating automatic rollback..."
    bash ./scripts/rollback.sh "$PREV_COMMIT"
    exit 1
fi

echo "✅ Deployment completed successfully!"
