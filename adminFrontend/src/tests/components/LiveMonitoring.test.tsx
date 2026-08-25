import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveMonitoring } from '../../pages/LiveMonitoring';
import { useAuthStore } from '../../store/authStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock socket manager
vi.mock('../../sockets/socketManager', () => ({
  socketManager: {
    getDashboardSocket: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
    })),
    getAlertsSocket: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
    })),
  }
}));

describe('LiveMonitoring Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    useAuthStore.setState({ activeFacilityId: 1 });
  });

  it('renders zones and slots from MSW', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LiveMonitoring />
      </QueryClientProvider>
    );

    // Initial loading
    expect(screen.getByText(/Live Monitoring/i)).toBeInTheDocument();

    // Wait for the zone to appear
    await waitFor(() => {
      expect(screen.getAllByText('Zone A').length).toBeGreaterThan(0);
    });

    // Wait for slots to appear
    await waitFor(() => {
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
    });

    // A1 is AVAILABLE, A2 is OCCUPIED (based on MSW data)
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
    expect(screen.getByText('OCCUPIED')).toBeInTheDocument();
  });
});
