/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { AdminRole, CameraType, GateType, VehicleType, SlotType, AlertType, AlertSeverity, SessionStatus, PaymentStatus } from '../src/enums';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1 Facility
  const facility = await prisma.facility.upsert({
    where: { facility_id: 1 },
    update: {
      onboarding_status: 'COMPLETED',
      onboarding_step: 8,
      hourly_rate: 40,
      currency: 'INR',
      grace_period_minutes: 15,
      minimum_fee: 20,
    },
    create: {
      name: 'Central Plaza Parking',
      address: '123 Main St',
      city: 'Tech City',
      state: 'Innovation State',
      country: 'Codeland',
      pincode: '123456',
      contact_phone: '+1234567890',
      contact_email: 'admin@centralplaza.com',
      total_slots: 20,
      onboarding_status: 'COMPLETED',
      onboarding_step: 8,
      hourly_rate: 40,
      currency: 'INR',
      grace_period_minutes: 15,
      minimum_fee: 20,
    },
  });

  // 3 Zones
  const zonesData = [
    { name: 'Ground Floor', floor_level: 0 },
    { name: 'Basement 1', floor_level: -1 },
    { name: 'Basement 2', floor_level: -2 },
  ];

  const zones = [];
  for (const z of zonesData) {
    const zone = await prisma.zone.upsert({
      where: { zone_id: zones.length + 1 },
      update: {},
      create: {
        facility_id: facility.facility_id,
        name: z.name,
        floor_level: z.floor_level,
      },
    });
    zones.push(zone);
  }

  // 20 ParkingSlots
  const slots = [];
  for (let i = 1; i <= 20; i++) {
    let type = SlotType.NORMAL;
    if (i % 7 === 0) type = SlotType.EV;
    else if (i % 5 === 0) type = SlotType.ACCESSIBLE;

    const zoneId = zones[i % 3].zone_id;
    const slotCode = `S${String(i).padStart(3, '0')}`;

    const slot = await prisma.parkingSlot.upsert({
      where: { facility_id_slot_code: { facility_id: facility.facility_id, slot_code: slotCode } },
      update: { status: 'AVAILABLE' },
      create: {
        facility_id: facility.facility_id,
        zone_id: zoneId,
        slot_code: slotCode,
        slot_type: type,
        status: 'AVAILABLE',
      },
    });
    slots.push(slot);
  }

  // 4 Cameras (2 PARKING_SLOT_CAM, 2 ANPR for gates)
  const cameraTypes = [CameraType.PARKING_SLOT_CAM, CameraType.PARKING_SLOT_CAM, CameraType.ANPR, CameraType.ANPR];
  const cameras = [];
  for (let i = 0; i < cameraTypes.length; i++) {
    const camera = await prisma.camera.upsert({
      where: { camera_id: i + 1 },
      update: {
        empty_lot_image_url: i < 2 ? `/static/empty-lots/${i === 0 ? 'lot-a' : 'lot-b'}.svg` : null,
      },
      create: {
        facility_id: facility.facility_id,
        zone_id: i < 2 ? zones[0].zone_id : null,
        name: `Cam ${i + 1}`,
        camera_type: cameraTypes[i],
        empty_lot_image_url: i < 2 ? `/static/empty-lots/${i === 0 ? 'lot-a' : 'lot-b'}.svg` : null,
      },
    });
    cameras.push(camera);
  }

  // Each slot is owned by exactly one camera
  for (let i = 0; i < slots.length; i++) {
    await prisma.parkingSlot.update({
      where: { slot_id: slots[i].slot_id },
      data: { primary_camera_id: cameras[i < 10 ? 0 : 1].camera_id },
    });
  }

  // 2 Gates
  const entryGate = await prisma.gate.upsert({
    where: { qr_code: 'ENTRY_GATE_1_QR' },
    update: {},
    create: {
      facility_id: facility.facility_id,
      camera_id: cameras[2].camera_id,
      name: 'Main Entry',
      gate_type: GateType.ENTRY,
      qr_code: 'ENTRY_GATE_1_QR',
    },
  });

  const exitGate = await prisma.gate.upsert({
    where: { qr_code: 'EXIT_GATE_1_QR' },
    update: {},
    create: {
      facility_id: facility.facility_id,
      camera_id: cameras[3].camera_id,
      name: 'Main Exit',
      gate_type: GateType.EXIT,
      qr_code: 'EXIT_GATE_1_QR',
    },
  });

  // 2 AdminUsers
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@centralplaza.com' },
    update: {},
    create: {
      facility_id: facility.facility_id,
      name: 'Alice Admin',
      email: 'admin@centralplaza.com',
      password_hash: passwordHash,
      role: AdminRole.FACILITY_ADMIN,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: 'security@centralplaza.com' },
    update: {},
    create: {
      facility_id: facility.facility_id,
      name: 'Bob Security',
      email: 'security@centralplaza.com',
      password_hash: passwordHash,
      role: AdminRole.SECURITY_STAFF,
    },
  });

  // 5 Users, each with 1 Vehicle
  const users = [];
  const vehicles = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password_hash: passwordHash,
      },
    });
    users.push(user);

    const vehicle = await prisma.vehicle.upsert({
      where: { license_plate: `ABC${1000 + i}` },
      update: {},
      create: {
        user_id: user.user_id,
        license_plate: `ABC${1000 + i}`,
        vehicle_type: VehicleType.CAR,
        make: 'Generic Motors',
        model: 'Sedan',
        color: 'Black',
      },
    });
    vehicles.push(vehicle);
  }

  // 10 Historical ParkingSessions
  for (let i = 0; i < 10; i++) {
    const now = new Date();
    const entryTime = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000); // spread over last 10 days
    const exitTime = new Date(entryTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    await prisma.parkingSession.upsert({
      where: { session_id: i + 1 },
      update: {},
      create: {
        facility_id: facility.facility_id,
        vehicle_id: vehicles[i % 5].vehicle_id,
        user_id: users[i % 5].user_id,
        slot_id: slots[i % 20].slot_id,
        entry_gate_id: entryGate.gate_id,
        exit_gate_id: exitGate.gate_id,
        entry_time: entryTime,
        exit_time: exitTime,
        status: SessionStatus.COMPLETED,
        duration_minutes: 120,
        parking_fee: 10.0,
        payment_status: PaymentStatus.PAID,
      },
    });
  }

  // 2 Alerts (one resolved, one unresolved)
  await prisma.alert.upsert({
    where: { alert_id: 1 },
    update: {},
    create: {
      facility_id: facility.facility_id,
      alert_type: AlertType.CAMERA_OFFLINE,
      severity: AlertSeverity.CRITICAL,
      message: 'Camera 1 went offline',
      is_resolved: true,
      resolved_at: new Date(),
      related_camera_id: cameras[0].camera_id,
    },
  });

  await prisma.alert.upsert({
    where: { alert_id: 2 },
    update: {},
    create: {
      facility_id: facility.facility_id,
      alert_type: AlertType.SLOT_CONFLICT,
      severity: AlertSeverity.WARNING,
      message: 'Conflicting detections for Slot S001',
      is_resolved: false,
      related_slot_id: slots[0].slot_id,
    },
  });

  const extraAlerts: Array<{ alert_id: number; alert_type: AlertType; severity: AlertSeverity; message: string }> = [
    { alert_id: 3, alert_type: AlertType.PARKING_FULL, severity: AlertSeverity.WARNING, message: 'Facility approaching capacity' },
    { alert_id: 4, alert_type: AlertType.LOW_CONFIDENCE_DETECTION, severity: AlertSeverity.INFO, message: 'Plate read confidence 0.41 at Main Entry' },
    { alert_id: 5, alert_type: AlertType.UNAUTHORIZED_SLOT_OCCUPANCY, severity: AlertSeverity.CRITICAL, message: 'Slot S004 occupied without a session' },
    { alert_id: 6, alert_type: AlertType.ENTRANCE_CONGESTION, severity: AlertSeverity.WARNING, message: 'Queue building at Main Entry' },
  ];
  for (const a of extraAlerts) {
    await prisma.alert.upsert({
      where: { alert_id: a.alert_id },
      update: {},
      create: { facility_id: facility.facility_id, ...a, is_resolved: false },
    });
  }

  // Live reserved + active sessions so Entry/Exit and Live Map have data
  await prisma.parkingSlot.update({ where: { slot_id: slots[10].slot_id }, data: { status: 'RESERVED' } });
  await prisma.parkingSlot.update({ where: { slot_id: slots[11].slot_id }, data: { status: 'OCCUPIED' } });

  await prisma.parkingSession.upsert({
    where: { session_id: 11 },
    update: { status: SessionStatus.RESERVED, slot_id: slots[10].slot_id },
    create: {
      facility_id: facility.facility_id,
      vehicle_id: vehicles[0].vehicle_id,
      user_id: users[0].user_id,
      slot_id: slots[10].slot_id,
      entry_gate_id: entryGate.gate_id,
      status: SessionStatus.RESERVED,
      allocated_at: new Date(),
    },
  });

  await prisma.parkingSession.upsert({
    where: { session_id: 12 },
    update: { status: SessionStatus.ACTIVE, slot_id: slots[11].slot_id, entry_time: new Date(Date.now() - 35 * 60000) },
    create: {
      facility_id: facility.facility_id,
      vehicle_id: vehicles[1].vehicle_id,
      user_id: users[1].user_id,
      slot_id: slots[11].slot_id,
      entry_gate_id: entryGate.gate_id,
      status: SessionStatus.ACTIVE,
      allocated_at: new Date(Date.now() - 40 * 60000),
      entry_time: new Date(Date.now() - 35 * 60000),
    },
  });

  await prisma.detection.createMany({
    data: [
      { camera_id: cameras[0].camera_id, slot_id: slots[11].slot_id, detection_type: 'SLOT_OCCUPANCY', detected_status: 'OCCUPIED', confidence_score: 0.92 },
      { camera_id: cameras[2].camera_id, gate_id: entryGate.gate_id, detection_type: 'VEHICLE_PLATE', license_plate_detected: vehicles[0].license_plate, confidence_score: 0.88 },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
