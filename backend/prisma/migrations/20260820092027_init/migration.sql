-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'BLOCKED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('NORMAL', 'EV', 'ACCESSIBLE', 'VIP', 'TWO_WHEELER', 'HEAVY');

-- CreateEnum
CREATE TYPE "CameraType" AS ENUM ('PARKING_SLOT_CAM', 'GATE_ENTRY_CAM', 'GATE_EXIT_CAM', 'ANPR');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "GateType" AS ENUM ('ENTRY', 'EXIT', 'BOTH');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'FACILITY_ADMIN', 'SECURITY_STAFF');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BIKE', 'EV_CAR', 'EV_BIKE', 'TRUCK', 'OTHER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('RESERVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "DetectionType" AS ENUM ('SLOT_OCCUPANCY', 'VEHICLE_PLATE');

-- CreateEnum
CREATE TYPE "DetectedStatus" AS ENUM ('EMPTY', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PARKING_FULL', 'CAMERA_OFFLINE', 'SLOT_CONFLICT', 'LOW_CONFIDENCE_DETECTION', 'UNAUTHORIZED_SLOT_OCCUPANCY', 'ENTRANCE_CONGESTION', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "Facility" (
    "facility_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("facility_id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "zone_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "floor_level" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("zone_id")
);

-- CreateTable
CREATE TABLE "ParkingSlot" (
    "slot_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "slot_code" TEXT NOT NULL,
    "slot_type" "SlotType" NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'UNKNOWN',
    "coordinates" TEXT,
    "distance_from_gate" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_status_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "camera_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "zone_id" INTEGER,
    "name" TEXT NOT NULL,
    "camera_type" "CameraType" NOT NULL,
    "stream_url" TEXT,
    "location_description" TEXT,
    "status" "CameraStatus" NOT NULL DEFAULT 'ONLINE',
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_heartbeat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("camera_id")
);

-- CreateTable
CREATE TABLE "CameraSlotCoverage" (
    "coverage_id" SERIAL NOT NULL,
    "camera_id" INTEGER NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "confirmed_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CameraSlotCoverage_pkey" PRIMARY KEY ("coverage_id")
);

-- CreateTable
CREATE TABLE "Gate" (
    "gate_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "camera_id" INTEGER,
    "name" TEXT NOT NULL,
    "gate_type" "GateType" NOT NULL,
    "qr_code" TEXT NOT NULL,
    "location_description" TEXT,
    "status" "GateStatus" NOT NULL DEFAULT 'ONLINE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gate_pkey" PRIMARY KEY ("gate_id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "admin_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicle_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "license_plate" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "ParkingSession" (
    "session_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "entry_gate_id" INTEGER,
    "exit_gate_id" INTEGER,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entry_time" TIMESTAMP(3),
    "exit_time" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'RESERVED',
    "duration_minutes" INTEGER,
    "parking_fee" DECIMAL(65,30),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "detection_id" SERIAL NOT NULL,
    "camera_id" INTEGER NOT NULL,
    "slot_id" INTEGER,
    "gate_id" INTEGER,
    "detection_type" "DetectionType" NOT NULL,
    "detected_status" "DetectedStatus",
    "license_plate_detected" TEXT,
    "confidence_score" DOUBLE PRECISION,
    "bounding_box" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("detection_id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "alert_id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "alert_type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "related_camera_id" INTEGER,
    "related_slot_id" INTEGER,
    "related_gate_id" INTEGER,
    "related_session_id" INTEGER,
    "message" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alert_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSlot_facility_id_slot_code_key" ON "ParkingSlot"("facility_id", "slot_code");

-- CreateIndex
CREATE UNIQUE INDEX "CameraSlotCoverage_camera_id_slot_id_key" ON "CameraSlotCoverage"("camera_id", "slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "Gate_camera_id_key" ON "Gate"("camera_id");

-- CreateIndex
CREATE UNIQUE INDEX "Gate_qr_code_key" ON "Gate"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_license_plate_key" ON "Vehicle"("license_plate");

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraSlotCoverage" ADD CONSTRAINT "CameraSlotCoverage_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("camera_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraSlotCoverage" ADD CONSTRAINT "CameraSlotCoverage_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "ParkingSlot"("slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gate" ADD CONSTRAINT "Gate_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gate" ADD CONSTRAINT "Gate_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("camera_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "ParkingSlot"("slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_entry_gate_id_fkey" FOREIGN KEY ("entry_gate_id") REFERENCES "Gate"("gate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_exit_gate_id_fkey" FOREIGN KEY ("exit_gate_id") REFERENCES "Gate"("gate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "Camera"("camera_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "ParkingSlot"("slot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_gate_id_fkey" FOREIGN KEY ("gate_id") REFERENCES "Gate"("gate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("facility_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_related_camera_id_fkey" FOREIGN KEY ("related_camera_id") REFERENCES "Camera"("camera_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_related_slot_id_fkey" FOREIGN KEY ("related_slot_id") REFERENCES "ParkingSlot"("slot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_related_gate_id_fkey" FOREIGN KEY ("related_gate_id") REFERENCES "Gate"("gate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_related_session_id_fkey" FOREIGN KEY ("related_session_id") REFERENCES "ParkingSession"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "AdminUser"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;
