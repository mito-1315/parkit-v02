-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RawDetectionStatus" AS ENUM ('PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'DUPLICATE_REMOVED');

-- DropForeignKey
ALTER TABLE "CameraSlotCoverage" DROP CONSTRAINT "CameraSlotCoverage_camera_id_fkey";

-- DropForeignKey
ALTER TABLE "CameraSlotCoverage" DROP CONSTRAINT "CameraSlotCoverage_slot_id_fkey";

-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "empty_lot_image_url" TEXT;

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "grace_period_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "minimum_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "onboarding_step" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ParkingSlot" ADD COLUMN     "primary_camera_id" INTEGER,
ADD COLUMN     "source_detection_id" INTEGER;

-- DropTable
DROP TABLE "CameraSlotCoverage";

-- CreateTable
CREATE TABLE "RawSlotDetection" (
    "detection_id" SERIAL NOT NULL,
    "camera_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "suggested_code" TEXT NOT NULL,
    "bounding_box" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" "RawDetectionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "duplicate_of_id" INTEGER,
    "promoted_slot_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawSlotDetection_pkey" PRIMARY KEY ("detection_id")
);

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_primary_camera_id_fkey" FOREIGN KEY ("primary_camera_id") REFERENCES "Camera"("camera_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawSlotDetection" ADD CONSTRAINT "RawSlotDetection_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("camera_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawSlotDetection" ADD CONSTRAINT "RawSlotDetection_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawSlotDetection" ADD CONSTRAINT "RawSlotDetection_duplicate_of_id_fkey" FOREIGN KEY ("duplicate_of_id") REFERENCES "RawSlotDetection"("detection_id") ON DELETE SET NULL ON UPDATE CASCADE;
