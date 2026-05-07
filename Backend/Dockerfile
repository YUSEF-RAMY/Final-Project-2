# ============================================
# Stage 1: Install PHP dependencies
# ============================================
FROM composer:2 AS composer-stage

WORKDIR /app
COPY composer.json composer.lock ./
# Use cache mount for composer downloads
RUN --mount=type=cache,target=/tmp/cache \
    composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ============================================
# Stage 2: Build frontend assets (Vite + TailwindCSS)
# ============================================
FROM node:20-alpine AS node-stage

WORKDIR /app
COPY package.json package-lock.json ./
# Use cache mount for npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy only what is needed for the build
COPY vite.config.js ./
COPY resources/ ./resources/
# Also need vendor/ for Flux UI CSS/Blade components (Tailwind scans them)
COPY --from=composer-stage /app/vendor ./vendor

RUN npm run build

# ============================================
# Stage 3: Final production image
# ============================================
FROM php:8.4-fpm

# Install system dependencies and PHP extensions
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN apt-get update && apt-get install -y \
    libpng-dev \
    nano \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    netcat-openbsd \
    && install-php-extensions pdo_mysql zip exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# 1. Copy dependencies first (most stable layers)
COPY --from=composer-stage --chown=www-data:www-data /app/vendor ./vendor

# 2. Copy application code (excluding what is in .dockerignore)
COPY --chown=www-data:www-data . .

# 3. Copy built frontend assets
COPY --from=node-stage --chown=www-data:www-data /app/public/build ./public/build

# Clear cached service providers from dev environment
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php

# Create required storage directories with proper permissions
# Using mkdir -p and chown in one layer to minimize size and fix permission issues
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             storage/logs \
             bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy and prepare entrypoint
COPY --chown=www-data:www-data docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

# Run as root but entrypoint will handle process execution
CMD ["docker-entrypoint.sh"]