import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import axios from 'axios'; 

axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { HospitalPage } from './components/HospitalPage';
import { ServicePage } from './components/ServicePage';
import { DoctorPage } from './components/DoctorPage';
import { PatientPage } from './components/PatientPage';
import { HospitalisationHub } from './components/HospitalisationHub'; 
import { DiagnosticHub } from './components/DiagnosticHub';
import { FamilyHistoryPage } from './components/FamilyHistoryPage';
import { HabitsPage } from './components/HabitsPage';
import { SurgeryHistoryPage } from './components/SurgeryHistoryPage';
import { MedicationHistoryPage } from './components/MedicationHistoryPage';
import { ObgynHistoryPage } from './components/ObgynHistoryPage';
import { TransplantHistoryPage } from './components/TransplantHistoryPage';
import { MedicalHistoryPage } from './components/MedicalHistoryPage';
import { HematologyPage } from './components/HematologyPage';
import { ImagingHistoryPage } from './components/ImagingHistoryPage';
import { BiochemistryUrinePage } from './components/BiochemistryUrinePage';
import { BiochemistryBloodPage } from './components/BiochemistryBloodPage';
import { TumorMarkersPage } from './components/TumorMarkersPage';
import { HormonesVitaminsPage } from './components/HormonesVitaminsPage';
import { InfectiousPage } from './components/InfectiousPage';
import { ImmunologyPage } from './components/ImmunologyPage'; 
import { ActiveTransplantPage } from './components/ActiveTransplantPage';
import { DonorPage } from './components/DonorPage';
import { ImmunoTreatmentsPage } from './components/ImmunoTreatmentsPage';
import { NephropathyPage } from './components/NephropathyPage';
import { DiagnosticDonorHub } from './components/DiagnosticDonorHub';
import { MedicamentsCatalogPage } from './components/MedicamentsCatalogPage';

import { ValidationsPage } from './components/ValidationsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/hospitalisation-hub" replace />} />
              
                <Route path="/hospitalisation-hub" element={<HospitalisationHub />} />
                
                <Route path="/diagnostic-hub" element={<DiagnosticHub />} />

                <Route path="/diagnostic-donor-hub" element={<DiagnosticDonorHub />} />

                <Route path="/hospitals" element={<HospitalPage />} />
                <Route path="/services" element={<ServicePage />} />
                <Route path="/doctors" element={<DoctorPage />} />
                <Route path="/patients" element={<PatientPage />} />
                <Route path="/donors" element={<DonorPage />} />

                <Route path="/nephropathy-initial" element={<NephropathyPage />} />

                <Route path="/family-history" element={<FamilyHistoryPage />} />
                <Route path="/donors/family-history" element={<FamilyHistoryPage />} />

                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/donors/habits" element={<HabitsPage />} />

                <Route path="/surgery-history" element={<SurgeryHistoryPage />} />
                <Route path="/donors/surgery-history" element={<SurgeryHistoryPage />} />

                <Route path="/medications" element={<MedicationHistoryPage />} />
                <Route path="/donors/medications" element={<MedicationHistoryPage />} />

                <Route path="/obgyn-history" element={<ObgynHistoryPage />} />
                <Route path="/donors/obgyn-history" element={<ObgynHistoryPage />} />

                <Route path="/transplants" element={<TransplantHistoryPage />} />

                <Route path="/medical-history" element={<MedicalHistoryPage />} />
                <Route path="/donors/medical-history" element={<MedicalHistoryPage />} />

                <Route path="/hematology" element={<HematologyPage />} />
                <Route path="/donors/hematology" element={<HematologyPage />} />

                <Route path="/imaging" element={<ImagingHistoryPage />} />
                <Route path="/donors/imaging" element={<ImagingHistoryPage />} />

                <Route path="/biochemistry-urine" element={<BiochemistryUrinePage />} />
                <Route path="/donors/biochemistry-urine" element={<BiochemistryUrinePage />} />
                
                <Route path="/biochemistry-blood" element={<BiochemistryBloodPage />} />
                <Route path="/donors/biochemistry-blood" element={<BiochemistryBloodPage />} />

                <Route path="/tumor-markers" element={<TumorMarkersPage />} />
                <Route path="/donors/tumor-markers" element={<TumorMarkersPage />} />

                <Route path="/hormones-vitamins" element={<HormonesVitaminsPage />} />
                <Route path="/donors/hormones-vitamins" element={<HormonesVitaminsPage />} />
                
                <Route path="/infectious" element={<InfectiousPage />} />
                <Route path="/donors/infectious" element={<InfectiousPage />} />
                
                <Route path="/immunology" element={<ImmunologyPage />} />
                <Route path="/donors/immunology" element={<ImmunologyPage />} />

                <Route path="/transplantations-hub" element={<ActiveTransplantPage />} />
                <Route path="/immuno-treatments" element={<ImmunoTreatmentsPage />} />
                
                <Route path="/medicaments-catalog" element={<MedicamentsCatalogPage />} />


                <Route path="/validations" element={<ValidationsPage />} />

                
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;