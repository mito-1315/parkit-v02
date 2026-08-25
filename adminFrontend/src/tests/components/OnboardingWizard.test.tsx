<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach } from 'vitest';
import { OnboardingWizard } from '../../pages/OnboardingWizard';
import { useAuthStore } from '../../store/authStore';
import { server } from '../setup';

function renderWizard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OnboardingWizard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Onboarding wizard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'fake_token',
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'FACILITY_ADMIN', facility_id: 1 },
      activeFacilityId: 1,
    });
  });

  it('step 1 submits facility + admin payload', async () => {
    let posted: any = null;
    server.use(
      http.get('http://localhost:4000/api/v1/onboarding/status', () =>
        HttpResponse.json({
          hasFacility: false,
          hasAdmin: false,
          onboardingStatus: 'NOT_STARTED',
          onboardingStep: 0,
          facilityId: null,
        }),
      ),
      http.post('http://localhost:4000/api/v1/onboarding/facility', async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({
          accessToken: 'fake_token',
          refreshToken: 'fake_refresh',
          facility: { facility_id: 1, onboarding_status: 'IN_PROGRESS', onboarding_step: 1 },
          admin: { admin_id: 1, facility_id: 1, name: 'Ada', email: 'ada@test.com', role: 'FACILITY_ADMIN' },
        }, { status: 201 });
      }),
    );

    renderWizard();
    await waitFor(() => expect(screen.getByText(/Facility & admin account/i)).toBeInTheDocument());

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Harbor Mall' } });
    fireEvent.change(inputs[1], { target: { value: '1 Harbor Road' } });
    fireEvent.change(inputs[2], { target: { value: 'Mumbai' } });
    fireEvent.change(inputs[3], { target: { value: 'MH' } });
    fireEvent.change(inputs[4], { target: { value: 'India' } });
    fireEvent.change(inputs[5], { target: { value: '400001' } });
    fireEvent.change(inputs[6], { target: { value: '9999999999' } });
    fireEvent.change(inputs[7], { target: { value: 'ops@harbor.test' } });
    fireEvent.change(inputs[8], { target: { value: 'Ada Admin' } });
    fireEvent.change(inputs[9], { target: { value: 'ada@test.com' } });
    const password = document.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(password, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /save and continue/i }));

    await waitFor(() => expect(posted).toBeTruthy());
    expect(posted.name).toBe('Harbor Mall');
    expect(posted.admin.email).toBe('ada@test.com');
    expect(posted.admin.password).toBe('password123');
  });

  it('duplicate review removes a box after reject and disables complete while pending', async () => {
    let pending = [
      { detection_id: 1, camera_id: 1, suggested_code: 'CAM1-BOX01', bounding_box: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, status: 'PENDING_REVIEW' },
      { detection_id: 2, camera_id: 2, suggested_code: 'CAM2-BOX01', bounding_box: { x: 0.12, y: 0.35, width: 0.14, height: 0.18 }, status: 'PENDING_REVIEW' },
    ];

    server.use(
      http.get('http://localhost:4000/api/v1/onboarding/status', () =>
        HttpResponse.json({
          hasFacility: true,
          hasAdmin: true,
          onboardingStatus: 'IN_PROGRESS',
          onboardingStep: 4,
          facilityId: 1,
        }),
      ),
      http.get('http://localhost:4000/api/v1/onboarding/raw-detections', () =>
        HttpResponse.json({
          pendingCount: pending.length,
          cameras: [
            { camera_id: 1, name: 'Cam A', empty_lot_image_url: '/static/empty-lots/lot-a.svg', detections: pending.filter((d) => d.camera_id === 1) },
            { camera_id: 2, name: 'Cam B', empty_lot_image_url: '/static/empty-lots/lot-b.svg', detections: pending.filter((d) => d.camera_id === 2) },
          ],
        }),
      ),
      http.get('http://localhost:4000/api/v1/facilities/1/zones', () =>
        HttpResponse.json([{ zone_id: 1, name: 'P1', floor_level: 1 }]),
      ),
      http.post('http://localhost:4000/api/v1/raw-detections/1/reject', () => {
        pending = pending.filter((d) => d.detection_id !== 1);
        return HttpResponse.json({ detection_id: 1, status: 'REJECTED' });
      }),
      http.post('http://localhost:4000/api/v1/raw-detections/2/mark-duplicate', async () => {
        pending = pending.filter((d) => d.detection_id !== 2);
        return HttpResponse.json({ detection_id: 2, status: 'DUPLICATE_REMOVED' });
      }),
      http.post('http://localhost:4000/api/v1/raw-detections/1/confirm', async () => {
        pending = pending.filter((d) => d.detection_id !== 1);
        return HttpResponse.json({ detection: { detection_id: 1, status: 'CONFIRMED' } }, { status: 201 });
      }),
      http.get('http://localhost:4000/api/v1/onboarding/summary', () =>
        HttpResponse.json({
          zoneCount: 1,
          confirmedSlotCount: 0,
          gateCount: 0,
          slotsPerCamera: [],
          pricing: { currency: 'INR', hourly_rate: 40 },
        }),
      ),
    );

    renderWizard();
    await waitFor(() => expect(screen.getAllByText('CAM1-BOX01').length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByRole('button', { name: /not a real space/i })[0]);
    await waitFor(() => expect(screen.queryAllByText('CAM1-BOX01')).toHaveLength(0));
    expect(screen.getAllByText('CAM2-BOX01').length).toBeGreaterThan(0);
  });

  it('Complete Onboarding is disabled while PENDING_REVIEW rows remain', async () => {
    server.use(
      http.get('http://localhost:4000/api/v1/onboarding/status', () =>
        HttpResponse.json({
          hasFacility: true,
          hasAdmin: true,
          onboardingStatus: 'IN_PROGRESS',
          onboardingStep: 7,
          facilityId: 1,
        }),
      ),
      http.get('http://localhost:4000/api/v1/onboarding/summary', () =>
        HttpResponse.json({
          zoneCount: 1,
          confirmedSlotCount: 2,
          gateCount: 2,
          slotsPerCamera: [{ camera_id: 1, name: 'Cam A', confirmedSlots: 2 }],
          pricing: { currency: 'INR', hourly_rate: 40 },
        }),
      ),
      http.get('http://localhost:4000/api/v1/onboarding/raw-detections', () =>
        HttpResponse.json({
          pendingCount: 3,
          cameras: [{ camera_id: 1, name: 'Cam A', detections: [{ detection_id: 9, status: 'PENDING_REVIEW' }] }],
        }),
      ),
    );

    renderWizard();
    await waitFor(() => expect(screen.getByRole('button', { name: /complete onboarding/i })).toBeDisabled());
  });
});
