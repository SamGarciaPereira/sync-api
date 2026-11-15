-- AlterTable
-- O valor SOS_CALL nunca foi gravado: os acionamentos do SOS ficam em `sos_event`.
ALTER TABLE `activity_event` MODIFY `type` ENUM('ALARM') NOT NULL;
