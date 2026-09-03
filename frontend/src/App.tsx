import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { FreightForecastPage } from './pages/FreightForecastPage';
import { DecisionTwinPage } from './pages/DecisionTwinPage';
import { MarketIntelligencePage } from './pages/MarketIntelligencePage';
import { VesselOptimizerPage } from './pages/VesselOptimizerPage';
import { PortIntelligencePage } from './pages/PortIntelligencePage';
import { RouteAnalysisPage } from './pages/RouteAnalysisPage';
import { ContractIntelligencePage } from './pages/ContractIntelligencePage';
import { ProcurementIntelligencePage } from './pages/ProcurementIntelligencePage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { RiskMonitorPage } from './pages/RiskMonitorPage';
import { AIAdvisorPage } from './pages/AIAdvisorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { ExecutiveModePage } from './pages/ExecutiveModePage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-cyan-400 text-xs">
        Loading PortIN Environment...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Maritime Console Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/forecast" element={<FreightForecastPage />} />
            <Route path="/decision-twin" element={<DecisionTwinPage />} />
            <Route path="/market" element={<MarketIntelligencePage />} />
            <Route path="/vessel-optimizer" element={<VesselOptimizerPage />} />
            <Route path="/port-intelligence" element={<PortIntelligencePage />} />
            <Route path="/route-analysis" element={<RouteAnalysisPage />} />
            <Route path="/contract-optimizer" element={<ContractIntelligencePage />} />
            <Route path="/procurement" element={<ProcurementIntelligencePage />} />
            <Route path="/scenario-lab" element={<ScenarioLabPage />} />
            <Route path="/risk-monitor" element={<RiskMonitorPage />} />
            <Route path="/ai-advisor" element={<AIAdvisorPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/history" element={<DecisionHistoryPage />} />
            <Route path="/executive" element={<ExecutiveModePage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
