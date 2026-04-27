<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('body_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('report_image')->nullable(); // مسار الصورة المخزنة

            // البيانات الأساسية (نستخدم decimal لدقة أعلى)
            $table->decimal('height', 5, 2)->nullable();
            $table->integer('age')->nullable();
            $table->string('gender')->nullable();
            $table->timestamp('datetime')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('smm', 5, 2)->nullable(); // Skeletal Muscle Mass
            $table->decimal('body_fat_mass', 5, 2)->nullable();
            $table->decimal('water', 5, 2)->nullable();
            $table->decimal('protein', 5, 2)->nullable();
            $table->decimal('minerals', 5, 2)->nullable();
            $table->decimal('bmi', 5, 2)->nullable();
            $table->decimal('pbf', 5, 2)->nullable(); // Percent Body Fat

            // بيانات الـ InBody التخصصية (بنفس أسامي الـ AI للسهولة)

            // تاريخ القياس الفعلي اللي جاي من ورقة الـ InBody
            $table->timestamp('measured_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_reports');
    }
};
