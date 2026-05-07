#!/bin/sh
set -e

echo "============================================"
echo "  Healthify Backend - Starting Up"
echo "============================================"

# Resolve secret paths
SECRETS_DB_PATH="/run/secrets/db_password"
SECRETS_MAIL_PATH="/run/secrets/mail_password"

# Function to run artisan commands with secrets injected only into the specific command
run_secure_artisan() {
    # If secrets exist, they take priority by being exported to the process environment
    if [ -f "$SECRETS_DB_PATH" ]; then export DB_PASSWORD=$(cat "$SECRETS_DB_PATH"); fi
    if [ -f "$SECRETS_MAIL_PATH" ]; then export MAIL_PASSWORD=$(cat "$SECRETS_MAIL_PATH"); fi

    php artisan "$@"
}

# 0. Clear any stale caches from host volumes immediately
echo "Clearing stale caches..."
php artisan config:clear || true
php artisan optimize:clear || true

# 1. Automate .env configuration
if [ ! -f .env ]; then
    echo "Creating .env from .env.docker..."
    if [ -f .env.docker ]; then
        cp .env.docker .env
    elif [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "WARNING: Neither .env.docker nor .env.example found. Laravel might fail."
    fi
fi

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
    run_secure_artisan key:generate --force --no-interaction
fi

# Run database migrations
echo "Running database migrations..."
run_secure_artisan migrate --force --no-interaction

# Seed database
echo "Seeding database..."
run_secure_artisan db:seed --force --no-interaction

# Cache configuration for production performance
# This is CRITICAL: secrets are baked into the config cache here and nowhere else
echo "Caching configuration..."
run_secure_artisan config:cache
run_secure_artisan route:cache
run_secure_artisan view:cache

# Ensure storage link exists
run_secure_artisan storage:link --force --no-interaction 2>/dev/null || true

# Fix storage permissions (safety net)
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true

# Start queue worker in the background
echo "Starting queue worker..."
# Queue worker also needs the secrets if it doesn't use the cached config
run_secure_artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

# Start scheduler in the background
echo "Starting scheduler..."
run_secure_artisan schedule:work &

echo "============================================"
echo "  Starting PHP-FPM..."
echo "============================================"
# Start php-fpm as PID 1. It will read from the cached config in bootstrap/cache/config.php
exec php-fpm