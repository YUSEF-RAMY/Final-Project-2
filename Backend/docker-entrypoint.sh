#!/bin/sh
set -e

echo "============================================"
echo "  Healthify Backend - Starting Up"
echo "============================================"

# Wait for the database to be ready
echo "Waiting for database at ${DB_HOST:-healthify-db}:${DB_PORT:-3306}..."
MAX_RETRIES=30
RETRY_COUNT=0
until nc -z "${DB_HOST:-healthify-db}" "${DB_PORT:-3306}" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Database not available after ${MAX_RETRIES} attempts. Exiting."
        exit 1
    fi
    echo "  Attempt ${RETRY_COUNT}/${MAX_RETRIES} - database not ready, retrying in 2s..."
    sleep 2
done
echo "Database is up!"

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    echo "Generating application key..."
    php artisan key:generate --force --no-interaction
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --no-interaction

# Seed database
echo "Seeding database..."
php artisan db:seed --force --no-interaction

# Cache configuration for production performance
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure storage link exists
php artisan storage:link --force --no-interaction 2>/dev/null || true

# Fix storage permissions (safety net)
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true
# Start queue worker in the background
echo "Starting queue worker..."
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

echo "============================================"
echo "  Starting PHP-FPM..."
echo "============================================"
# Start php-fpm as PID 1 for proper signal handling
exec php-fpm