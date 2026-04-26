# ============================================
# Stage 1: Install PHP dependencies
# ============================================
FROM composer:2 AS composer-stage

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ============================================
# Stage 2: Build frontend assets (Vite + TailwindCSS)
# Needs vendor/ because app.css imports flux.css from vendor
# ============================================
FROM node:20-alpine AS node-stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy vendor from composer stage (needed for flux.css and blade source paths)
COPY --from=composer-stage /app/vendor ./vendor

COPY vite.config.js ./
COPY resources/ ./resources/
RUN npm run build

# ============================================
# Stage 3: Final production image
# ============================================
FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    netcat-openbsd \
    && docker-php-ext-install pdo_mysql zip exif pcntl bcmath \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Copy application code
COPY . .

# Clear cached service providers from dev environment
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php

# Copy vendor from composer stage
COPY --from=composer-stage /app/vendor ./vendor

# Copy built frontend assets from node stage
COPY --from=node-stage /app/public/build ./public/build

# Create required storage directories
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# Set proper permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Copy and prepare entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

CMD ["docker-entrypoint.sh"]