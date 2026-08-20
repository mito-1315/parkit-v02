import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:4000/api/v1/auth/admin/login', async ({ request }) => {
    const { email, password } = (await request.json()) as any;
    
    if (email === 'admin@smartpark.com' && password === 'password123') {
      return HttpResponse.json({
        accessToken: 'fake_token',
        refreshToken: 'fake_refresh',
      });
    }
    
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.get('http://localhost:4000/api/v1/admin-users/me', () => {
    return HttpResponse.json({
      id: 1,
      name: 'Admin User',
      email: 'admin@smartpark.com',
      role: 'ADMIN',
      facility_id: 1,
    });
  }),
  
  http.get('http://localhost:4000/api/v1/facilities', () => {
    return HttpResponse.json([
      { id: 1, name: 'Facility A' },
      { id: 2, name: 'Facility B' }
    ]);
  }),
  
  http.get('http://localhost:4000/api/v1/facilities/1/zones', () => {
    return HttpResponse.json([
      { id: 1, name: 'Zone A', facility_id: 1 }
    ]);
  }),
  
  http.get('http://localhost:4000/api/v1/zones/1/slots', () => {
    return HttpResponse.json([
      { id: 1, label: 'A1', slot_code: 'A1', status: 'AVAILABLE' },
      { id: 2, label: 'A2', slot_code: 'A2', status: 'OCCUPIED' }
    ]);
  }),

  http.get('http://localhost:4000/api/v1/facilities/1/slots', () => {
    return HttpResponse.json([
      { slot_id: 1, slot_code: 'A1', status: 'AVAILABLE', zone_id: 1, zone: { zone_id: 1, name: 'Zone A' } },
      { slot_id: 2, slot_code: 'A2', status: 'OCCUPIED', zone_id: 1, zone: { zone_id: 1, name: 'Zone A' } }
    ]);
  }),

  http.get('http://localhost:4000/api/v1/detections', () => {
    return HttpResponse.json([]);
  }),

  http.get('http://localhost:4000/api/v1/onboarding/status', () => {
    return HttpResponse.json({
      hasFacility: true,
      hasAdmin: true,
      onboardingStatus: 'COMPLETED',
      onboardingStep: 8,
      facilityId: 1,
    });
  }),
];
