#!/bin/bash
set -e

TARGET_COMMIT=$1

if [ -z "$TARGET_COMMIT" ]; then
    echo "⚠️ Target commit hash not specified. Usage: bash rollback.sh <commit_hash>"
    exit 1
fi

echo "🚨 Rolling back to commit: $TARGET_COMMIT"

php artisan down || true

git checkout "$TARGET_COMMIT"
composer install --no-dev --optimize-autoloader
php artisan migrate:rollback --step=1 || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart || true

php artisan up

echo "✅ Rollback completed successfully!"
