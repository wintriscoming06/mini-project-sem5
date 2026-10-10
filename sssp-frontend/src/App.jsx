import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Player Pages
import PlayerDashboard from './pages/player/PlayerDashboard';
import PlayerProfile from './pages/player/PlayerProfile';
import TournamentList from './pages/player/TournamentList';
import TournamentDetail from './pages/player/TournamentDetail';
import MyApplications from './pages/player/MyApplications';
import PlayerStats from './pages/player/PlayerStats';
import CustomizeCard from './pages/player/CustomizeCard';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerTournaments from './pages/organizer/OrganizerTournaments';
import CreateTournament from './pages/organizer/CreateTournament';
import ManageTournament from './pages/organizer/ManageTournament';
import MatchList from './pages/organizer/MatchList';
import MatchDetail from './pages/organizer/MatchDetail';
import MatchScoring from './pages/organizer/MatchScoring';

// Scout Pages
import ScoutDashboard from './pages/scout/ScoutDashboard';
import ScoutProfile from './pages/scout/ScoutProfile';
import PlayerSearch from './pages/scout/PlayerSearch';
import Shortlist from './pages/scout/Shortlist';
import ScoutAlerts from './pages/scout/ScoutAlerts';
import PlayerView from './pages/scout/PlayerView';
import PlayerComparison from './pages/scout/PlayerComparison';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CorrectionQueue from './pages/admin/CorrectionQueue';
import AuditLogView from './pages/admin/AuditLogView';
import GPIConfig from './pages/admin/GpiConfig';

// Misc
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* General Dashboard routing */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } />

        {/* SHARED / ROLE-AWARE PROFILE ROUTE */}
        <Route path="/profile" element={<ProtectedRoute roles={['PLAYER', 'SCOUT']}><ProfileRouter /></ProtectedRoute>} />

        {/* PLAYER ROUTES */}
        <Route path="/tournaments" element={<ProtectedRoute roles={['PLAYER']}><TournamentList /></ProtectedRoute>} />
        <Route path="/tournaments/:id" element={<ProtectedRoute roles={['PLAYER']}><TournamentDetail /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['PLAYER']}><MyApplications /></ProtectedRoute>} />
        <Route path="/player/stats" element={<ProtectedRoute roles={['PLAYER']}><PlayerStats /></ProtectedRoute>} />
        <Route path="/player/card-studio" element={<ProtectedRoute roles={['PLAYER']}><CustomizeCard /></ProtectedRoute>} />
        <Route path="/player/customize-card" element={<Navigate to="/player/card-studio" replace />} />

        {/* ORGANIZER ROUTES */}
        <Route path="/my-tournaments" element={<ProtectedRoute roles={['ORGANIZER']}><OrganizerTournaments /></ProtectedRoute>} />
        <Route path="/tournaments/create" element={<ProtectedRoute roles={['ORGANIZER']}><CreateTournament /></ProtectedRoute>} />
        <Route path="/tournaments/:id/manage" element={<ProtectedRoute roles={['ORGANIZER']}><ManageTournament /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute roles={['ORGANIZER']}><MatchList /></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute roles={['ORGANIZER']}><MatchDetail /></ProtectedRoute>} />
        <Route path="/matches/:id/score" element={<ProtectedRoute roles={['ORGANIZER']}><MatchScoring /></ProtectedRoute>} />

        {/* SCOUT ROUTES */}
        <Route path="/search" element={<ProtectedRoute roles={['SCOUT']}><PlayerSearch /></ProtectedRoute>} />
        <Route path="/shortlist" element={<ProtectedRoute roles={['SCOUT']}><Shortlist /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute roles={['SCOUT']}><ScoutAlerts /></ProtectedRoute>} />
        <Route path="/players/:id" element={<ProtectedRoute roles={['SCOUT']}><PlayerView /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute roles={['SCOUT']}><PlayerComparison /></ProtectedRoute>} />

        {/* ADMIN ROUTES */}
        <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="/corrections" element={<ProtectedRoute roles={['ADMIN']}><CorrectionQueue /></ProtectedRoute>} />
        <Route path="/audit-log" element={<ProtectedRoute roles={['ADMIN']}><AuditLogView /></ProtectedRoute>} />
        <Route path="/gpi-config" element={<ProtectedRoute roles={['ADMIN']}><GPIConfig /></ProtectedRoute>} />

        {/* Role-prefixed route aliases */}
        <Route path="/player/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/scout/profile" element={<Navigate to="/profile" replace />} />
        <Route path="/player/tournaments" element={<Navigate to="/tournaments" replace />} />
        <Route path="/player/tournaments/:id" element={<ProtectedRoute roles={['PLAYER']}><TournamentDetail /></ProtectedRoute>} />
        <Route path="/scout/search" element={<Navigate to="/search" replace />} />
        <Route path="/scout/shortlist" element={<Navigate to="/shortlist" replace />} />
        <Route path="/scout/alerts" element={<Navigate to="/alerts" replace />} />
        <Route path="/scout/compare" element={<Navigate to="/compare" replace />} />
        <Route path="/scout/player/:id" element={<ProtectedRoute roles={['SCOUT']}><PlayerView /></ProtectedRoute>} />
        <Route path="/scout/players/:id" element={<ProtectedRoute roles={['SCOUT']}><PlayerView /></ProtectedRoute>} />
        <Route path="/organizer/tournaments/create" element={<Navigate to="/tournaments/create" replace />} />
        <Route path="/organizer/tournaments/:id" element={<ProtectedRoute roles={['ORGANIZER']}><ManageTournament /></ProtectedRoute>} />
        <Route path="/organizer/tournaments" element={<Navigate to="/my-tournaments" replace />} />
        <Route path="/organizer/matches" element={<Navigate to="/matches" replace />} />
        <Route path="/organizer/matches/:id" element={<ProtectedRoute roles={['ORGANIZER']}><MatchDetail /></ProtectedRoute>} />
        <Route path="/organizer/matches/:id/scoring" element={<ProtectedRoute roles={['ORGANIZER']}><MatchScoring /></ProtectedRoute>} />
        <Route path="/organizer/matches/:id/score" element={<ProtectedRoute roles={['ORGANIZER']}><MatchScoring /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// Helper to route to correct profile dossier based on role
function ProfileRouter() {
  const { user } = useAuth();
  if (user?.role === 'SCOUT') {
    return <ScoutProfile />;
  }
  return <PlayerProfile />;
}

// Helper to route to correct dashboard based on role
function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'PLAYER': return <PlayerDashboard />;
    case 'ORGANIZER': return <OrganizerDashboard />;
    case 'SCOUT': return <ScoutDashboard />;
    case 'ADMIN': return <AdminDashboard />;
    default: return <Navigate to="/login" replace />;
  }
}

export default App;
