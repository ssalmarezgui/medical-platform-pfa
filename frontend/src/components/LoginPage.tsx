import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { IconPill, IconLock, IconUser, IconBuildingHospital, IconId, IconDeviceMobile } from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import axios from 'axios';

interface Hospital {
  identifiantH: string;
  libelleH: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [matricule, setMatricule] = useState('');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get<Hospital[]>('http://localhost:8081/api/hopitaux/public'); 
        setHospitals(response.data);
      } catch (err) {
        console.error("Impossible de charger la liste des hôpitaux", err);
      }
    };
    fetchHospitals();
  }, []);

  const handleLoginSuccess = (token: string, rawRole: string, rawAuthorities: any[], login: string) => {
    const role = rawRole.startsWith("ROLE_") ? rawRole.replace("ROLE_", "") : rawRole;
    const permissions = rawAuthorities.map((auth: string) => 
      auth.startsWith("ROLE_") ? auth.replace("ROLE_", "") : auth
    );

    loginUser(login, role, permissions, token, selectedHospital);

    if (role === 'AGENT_IMMUNO') {
      navigate('/immuno-treatments');
    } else if (role === 'MEDECIN_INVESTIGATEUR') {
      navigate('/diagnostic-hub');
    } else if (role === 'MEDECIN_SUIVI') {
      navigate('/patients');
    } else if (role === 'AGENT_LABORATOIRE') {
      navigate('/diagnostic-hub'); 
    } else {
      navigate('/hospitalisation-hub');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !selectedHospital) {
      setToastType('error');
      setToastMessage("Veuillez remplir tous les champs, y compris l'établissement.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/v1/auth/login-step1', {
        loginU: username,
        motPasseU: password,
        hopitalId: Number(selectedHospital)
      });

      setIsLoading(false);

      if (response.data.requiresOtp) {
        setMaskedEmail(response.data.maskedEmail || "votre adresse email");
        setLoginStep('otp');
        setToastType('success');
        setToastMessage("Un code de sécurité a été envoyé sur votre adresse email.");
        setToastOpen(true);
      } else {
        const auth = response.data.authResponse;
        handleLoginSuccess(auth.token, auth.role, auth.authorities, auth.loginU);
      }

    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Identifiant, mot de passe ou établissement incorrect.");
      setToastOpen(true);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setToastType('error');
      setToastMessage("Veuillez saisir le code OTP.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/v1/auth/verify-otp', {
        loginU: username,
        otpCode: otpCode
      });

      setIsLoading(false);
      
      const auth = response.data;
      handleLoginSuccess(auth.token, auth.role, auth.authorities, auth.loginU);

    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Code de validation incorrect ou expiré.");
      setToastOpen(true);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !matricule || !email) {
      setToastType('error');
      setToastMessage("Veuillez remplir tous les champs d'inscription.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:8081/api/v1/auth/register', {
        loginU: username,
        motPasseU: password,
        medecinId: Number(matricule),
        emailU: email,
      });

      setIsLoading(false);
      setToastType('success');
      setToastMessage("Compte créé avec succès ! Votre compte est en attente de validation par l'administration.");
      setToastOpen(true);
      
      setPassword('');
      setMatricule('');
      setEmail('');
      setActiveTab('login');
      setLoginStep('credentials');

    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Erreur d'inscription. Vérifiez votre matricule médecin.");
      setToastOpen(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F1F5FB] flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[6px]"
        style={{ 
          backgroundImage: 'url(/src/assets/bg-medical.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="bg-white border border-[#A7C0E4]/30 rounded-[30px] p-10 max-w-md w-full shadow-2xl space-y-6 relative z-10 mx-4">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2B5296] mx-auto mb-4">
            <IconPill size={32} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-[#2B5296]">MedPlatform</h1>
          <p className="text-[10px] font-bold text-[#6588BB] uppercase tracking-[0.15em] mt-1.5">Portail de Connexion Clinique</p>
        </div>

        {loginStep === 'credentials' && (
          <div className="flex border-b border-slate-100 pb-2">
            <button 
              type="button" 
              onClick={() => setActiveTab('login')} 
              className={`flex-1 pb-2 text-xs font-bold border-none bg-transparent cursor-pointer transition-colors ${activeTab === 'login' ? 'text-[#2B5296] border-b-2 border-[#2B5296]' : 'text-slate-400'}`}
            >
              Se Connecter
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('register')} 
              className={`flex-1 pb-2 text-xs font-bold border-none bg-transparent cursor-pointer transition-colors ${activeTab === 'register' ? 'text-[#2B5296] border-b-2 border-[#2B5296]' : 'text-slate-400'}`}
            >
              Créer un compte
            </button>
          </div>
        )}

        {activeTab === 'login' ? (
          loginStep === 'credentials' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Établissement Hospitalier *</label>
                <div className="relative">
                  <IconBuildingHospital className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    required
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Sélectionner votre hôpital</option>
                    {hospitals.map((h) => (
                      <option key={h.identifiantH} value={h.identifiantH}>
                        {h.libelleH}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Identifiant Clinique / Matricule *</label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    required 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white" 
                    placeholder="" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none bg-white" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#2B5296] text-white py-3.5 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#2B5296]/20 transition-all hover:bg-blue-900 disabled:opacity-50 mt-6"
              >
                {isLoading ? "Vérification..." : "Demander le code de validation"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
              <div className="text-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[#2B5296] font-bold mb-1">Double Authentification</p>
                <p className="text-[11px] text-[#6588BB] font-medium">
                  Saisissez le code de sécurité envoyé à l'adresse email <strong className="text-[#2B5296]">{maskedEmail}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Code de validation (OTP) *</label>
                <div className="relative">
                  <IconDeviceMobile className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-center text-lg tracking-[0.25em] text-[#2B5296] bg-white" 
                    placeholder="******" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setLoginStep('credentials'); setOtpCode(''); }} 
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold border-none cursor-pointer hover:bg-slate-200"
                >
                  Retour
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isLoading ? "Validation..." : "Valider et se connecter"}
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Matricule de Médecin de Référence *</label>
              <div className="relative">
                <IconId className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required 
                  value={matricule} 
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white" 
                  placeholder="" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Adresse Email Professionnelle *</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800 bg-white" 
                  placeholder="" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Identifiant de connexion souhaité *</label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white" 
                  placeholder="" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Mot de passe sécurisé *</label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none bg-white" 
                  placeholder="Créer un mot de passe" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50 mt-6"
            >
              {isLoading ? "Inscription..." : "Créer mon compte clinique"}
            </button>
          </form>
        )}
      </div>

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};