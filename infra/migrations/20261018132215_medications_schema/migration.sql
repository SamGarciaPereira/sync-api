-- CreateTable
CREATE TABLE `medication_catalog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active_ingredient` VARCHAR(191) NULL,
    `concentration` VARCHAR(191) NULL,
    `form` ENUM('TABLET', 'CAPSULE', 'DROPS', 'LIQUID', 'INJECTION', 'INHALER', 'TOPICAL', 'PATCH') NOT NULL,
    `default_unit` ENUM('PILULA', 'MG', 'ML', 'GOTAS', 'UI', 'JATO', 'APLICACAO') NOT NULL,
    `allowed_units` JSON NOT NULL,
    `allows_splitting` BOOLEAN NOT NULL DEFAULT false,
    `requires_fasting` BOOLEAN NOT NULL DEFAULT false,
    `default_instructions` TEXT NULL,

    INDEX `medication_catalog_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `catalog_id` INTEGER NULL,
    `custom_name` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `form` ENUM('TABLET', 'CAPSULE', 'DROPS', 'LIQUID', 'INJECTION', 'INHALER', 'TOPICAL', 'PATCH') NOT NULL,
    `dosage_amount` DOUBLE NOT NULL,
    `dosage_unit` ENUM('PILULA', 'MG', 'ML', 'GOTAS', 'UI', 'JATO', 'APLICACAO') NOT NULL,
    `is_conditional` BOOLEAN NOT NULL DEFAULT false,
    `condition_rule` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `visual_description` VARCHAR(191) NULL,
    `current_stock` DOUBLE NOT NULL DEFAULT 0,
    `min_stock_alert` DOUBLE NOT NULL DEFAULT 5,
    `alerts_enabled` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medication_id` INTEGER NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `days_of_week` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medication` ADD CONSTRAINT `medication_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication` ADD CONSTRAINT `medication_catalog_id_fkey` FOREIGN KEY (`catalog_id`) REFERENCES `medication_catalog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_schedule` ADD CONSTRAINT `medication_schedule_medication_id_fkey` FOREIGN KEY (`medication_id`) REFERENCES `medication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
