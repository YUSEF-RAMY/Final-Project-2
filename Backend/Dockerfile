FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    && docker-php-ext-install pdo_mysql zip exif pcntl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# نزل Composer عشان نقدر ننزل الـ Vendors
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تحديد مكان الكود جوه الـ Container
WORKDIR /var/www

# نسخ كل ملفات المشروع من جهازك للـ Container
COPY . .

# ضبط الصلاحيات للمجلدات المهمة عشان متبقاش Read-only
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]