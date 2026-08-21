import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import { RequireAuth, RequireSession, RedirectIfAuthed } from './components/RouteGuards';

import Splash from './pages/Splash';
import Login from './pages/Login';
import CreateProfile from './pages/CreateProfile';
import Dashboard from './pages/Dashboard';
import ReportsList from './pages/ReportsList';
import UploadReport from './pages/UploadReport';
import ReportUnderstanding from './pages/ReportUnderstanding';
import RecordSymptoms from './pages/RecordSymptoms';
import SymptomHistory from './pages/SymptomHistory';
import MedicationHistory from './pages/MedicationHistory';
import ConsultationHistory from './pages/ConsultationHistory';
import HealthHistory from './pages/HealthHistory';
import DoctorSummary from './pages/DoctorSummary';
import FindCare from './pages/FindCare';
import VoiceAssistant from './pages/VoiceAssistant';
import PrivacyCenter from './pages/PrivacyCenter';
import EmergencyScreen from './pages/EmergencyScreen';
import Settings from './pages/Settings';

export default function App() {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/create-profile"
          element={
            <RequireSession>
              <CreateProfile />
            </RequireSession>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <ReportsList />
            </RequireAuth>
          }
        />
        <Route
          path="/upload-report"
          element={
            <RequireAuth>
              <UploadReport />
            </RequireAuth>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <RequireAuth>
              <ReportUnderstanding />
            </RequireAuth>
          }
        />
        <Route
          path="/record-symptoms"
          element={
            <RequireAuth>
              <RecordSymptoms />
            </RequireAuth>
          }
        />
        <Route
          path="/record-symptoms/:symptomId"
          element={
            <RequireAuth>
              <RecordSymptoms />
            </RequireAuth>
          }
        />
        <Route
          path="/voice-assistant"
          element={
            <RequireAuth>
              <VoiceAssistant />
            </RequireAuth>
          }
        />
        <Route
          path="/symptom-history"
          element={
            <RequireAuth>
              <SymptomHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/medications"
          element={
            <RequireAuth>
              <MedicationHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/consultations"
          element={
            <RequireAuth>
              <ConsultationHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/health-history"
          element={
            <RequireAuth>
              <HealthHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/find-care"
          element={
            <RequireAuth>
              <FindCare />
            </RequireAuth>
          }
        />
        <Route
          path="/doctor-summary"
          element={
            <RequireAuth>
              <DoctorSummary />
            </RequireAuth>
          }
        />
        <Route
          path="/privacy"
          element={
            <RequireAuth>
              <PrivacyCenter />
            </RequireAuth>
          }
        />
        <Route
          path="/emergency"
          element={
            <RequireAuth>
              <EmergencyScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
