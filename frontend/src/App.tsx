import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HospitalPage } from './components/HospitalPage';
import { ServicePage } from './components/ServicePage';
import { DoctorPage } from './components/DoctorPage';
import { PatientPage } from './components/PatientPage';

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/hospitals" replace />} />
        <Route path="/hospitals" element={<HospitalPage />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/doctors" element={<DoctorPage />} />
        <Route path="/patients" element={<PatientPage />} />
        
        <Route path="/dashboard" element={<div className="text-xl font-bold text-[#2B5296]">Tableau de bord (Contenu)</div>} />
        <Route path="/services" element={<div className="text-xl font-bold text-[#2B5296]">Gestion des Services (Contenu)</div>} />
        <Route path="/doctors" element={<div className="text-xl font-bold text-[#2B5296]">Gestion des Médecins (Contenu)</div>} />
        <Route path="/patients" element={<div className="text-xl font-bold text-[#2B5296]">Gestion des Patients (Contenu)</div>} />
        <Route path="/settings" element={<div className="text-xl font-bold text-[#2B5296]">Profil Utilisateur (Contenu)</div>} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;