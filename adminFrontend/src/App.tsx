<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Configuration } from './pages/Configuration';
import { EntryExit } from './pages/EntryExit';
import { Vehicles } from './pages/Vehicles';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/monitoring" element={<LiveMonitoring />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/facilities" element={<Navigate to="/configuration" replace />} />
              <Route path="/cameras" element={<Navigate to="/configuration" replace />} />
              <Route path="/gates" element={<Navigate to="/configuration" replace />} />
              <Route path="/entry-exit" element={<EntryExit />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
