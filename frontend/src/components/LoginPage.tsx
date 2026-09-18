import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { IconPill, IconLock, IconUser, IconBuildingHospital, IconId, IconDeviceMobile, IconMail } from '@tabler/icons-react';
import { Toast } from './ui/Toast';
import axios from 'axios';

interface Hospital {
  identifiantH: string;
  libelleH: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');

  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');


  const [regRole, setRegRole] = useState<'ROLE_MEDECIN_SUIVI' | 'ROLE_MEDECIN_INVESTIGATEUR' | 'ROLE_AGENT_LABORATOIRE' | 'ROLE_AGENT_IMMUNO'>('ROLE_MEDECIN_SUIVI');
  const [regHospital, setRegHospital] = useState('');
  const [services, setServices] = useState<{ identifiantS: number; libelleS: string }[]>([]);
  const [regService, setRegService] = useState('');


  useEffect(() => {
    if (regHospital) {
      axios.get(`http://localhost:8081/api/services/public?hopitalId=${regHospital}`)
        .then(res => setServices(res.data))
        .catch(err => console.error("Impossible de charger les services", err));
    } else {
      setServices([]);
    }
  }, [regHospital]);

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

    if (role === 'ADMIN') {
      navigate('/admin-dashboard');
    } else if (role === 'AGENT_IMMUNO') {
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
    
    const isMedecin = regRole.startsWith('ROLE_MEDECIN');

    if (!username || !password || !email || (isMedecin && !matricule) || (!isMedecin && !regService)) {
      setToastType('error');
      setToastMessage("Veuillez remplir tous les champs obligatoires.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        loginU: username,
        motPasseU: password,
        emailU: email,
        roleU: regRole,
      };

      if (isMedecin) {
        payload.medecinId = Number(matricule);
      } else {
        payload.serviceId = Number(regService);
      }

      await axios.post('http://localhost:8081/api/v1/auth/register', payload);

      setIsLoading(false);
      setToastType('success');
      setToastMessage("Compte créé avec succès ! Votre compte est en attente de validation par l'administration.");
      setToastOpen(true);
      
      setPassword('');
      setMatricule('');
      setEmail('');
      setRegService('');
      setRegHospital('');
      setActiveTab('login');
      setLoginStep('credentials');

    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Erreur d'inscription.");
      setToastOpen(true);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setToastType('error');
      setToastMessage("Veuillez saisir votre adresse email.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:8081/api/v1/auth/forgot-password', {
        emailU: forgotEmail
      });

      setIsLoading(false);
      setToastType('success');
      setToastMessage("Un code de réinitialisation vous a été envoyé par email.");
      setToastOpen(true);
      
      // Passage à l'étape suivante (saisie du nouveau mot de passe et de l'OTP)
      setForgotStep('reset');
    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Impossible de traiter la demande pour cette adresse email.");
      setToastOpen(true);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      setToastType('error');
      setToastMessage("Veuillez remplir tous les champs.");
      setToastOpen(true);
      return;
    }

    if (newPassword.length < 8) {
      setToastType('error');
      setToastMessage("Le mot de passe doit faire au moins 8 caractères.");
      setToastOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:8081/api/v1/auth/reset-password', {
        emailU: forgotEmail,
        otpCode: forgotOtp,
        newPassword: newPassword
      });

      setIsLoading(false);
      setToastType('success');
      setToastMessage("Votre mot de passe a été réinitialisé ! Connectez-vous.");
      setToastOpen(true);

      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setActiveTab('login');
      setLoginStep('credentials');
      setForgotStep('request');
    } catch (err: any) {
      setIsLoading(false);
      setToastType('error');
      setToastMessage(err.response?.data?.message || "Erreur de réinitialisation.");
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
          <h1 className="text-2xl font-black text-[#2B5296]">NephroCare</h1>
          <p className="text-[10px] font-bold text-[#6588BB] uppercase tracking-[0.15em] mt-1.5">Portail de Connexion Clinique</p>
        </div>

        {loginStep === 'credentials' && activeTab !== 'forgot' && (
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

        {activeTab === 'login' && (
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black text-[#6588BB] uppercase">Mot de passe *</label>
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('forgot'); setForgotStep('request'); }}
                    className="text-[10px] text-[#2B5296] font-bold border-none bg-transparent cursor-pointer hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
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
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            {/* SÉLECTEUR DE RÔLE */}
            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Profil Clinique *</label>
              <div className="relative">
                <select
                  value={regRole}
                  onChange={(e: any) => setRegRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white"
                >
                  <option value="ROLE_MEDECIN_SUIVI">Médecin de Suivi</option>
                  <option value="ROLE_MEDECIN_INVESTIGATEUR">Médecin Investigateur</option>
                  <option value="ROLE_AGENT_LABORATOIRE">Agent de Laboratoire</option>
                  <option value="ROLE_AGENT_IMMUNO">Agent d'Immunologie</option>
                </select>
              </div>
            </div>

            {/* SI C'EST UN MÉDECIN : Saisie du matricule de référence */}
            {regRole.startsWith('ROLE_MEDECIN') ? (
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
            ) : (
              /* SI C'EST UN AGENT : Sélection obligatoire de l'hôpital puis de son service */
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Établissement *</label>
                    <select
                      required
                      value={regHospital}
                      onChange={(e) => setRegHospital(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white"
                    >
                      <option value="">Sélectionner...</option>
                      {hospitals.map((h) => (
                        <option key={h.identifiantH} value={h.identifiantH}>{h.libelleH}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Pôle de Soins *</label>
                    <select
                      required
                      disabled={!regHospital}
                      value={regService}
                      onChange={(e) => setRegService(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800 bg-white disabled:opacity-50"
                    >
                      <option value="">Sélectionner...</option>
                      {services.map((s) => (
                        <option key={s.identifiantS} value={s.identifiantS}>{s.libelleS}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Adresse Email Professionnelle *</label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800 bg-white" 
                  placeholder="exemple@hopital.com" 
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

        {activeTab === 'forgot' && (
          forgotStep === 'request' ? (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4 text-xs">
              <div className="text-center bg-blue-50/40 p-4 rounded-xl border border-blue-50">
                <p className="text-[#2B5296] font-bold mb-1">Mot de passe oublié ?</p>
                <p className="text-[11px] text-[#6588BB] leading-relaxed">
                  Saisissez votre adresse email clinique. Un code de réinitialisation vous sera envoyé.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Adresse Email clinique *</label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800 bg-white" 
                    placeholder="exemple@hopital.com" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('login')} 
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold border-none cursor-pointer hover:bg-slate-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] bg-[#2B5296] text-white py-3 rounded-xl font-bold border-none cursor-pointer shadow-lg shadow-[#2B5296]/20 transition-all hover:bg-blue-900 disabled:opacity-50"
                >
                  {isLoading ? "Envoi..." : "Envoyer le code"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div className="text-center bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 font-bold mb-1">Code envoyé !</p>
                <p className="text-[11px] text-[#6588BB] leading-relaxed">
                  Saisissez le code temporaire envoyé à <strong className="text-emerald-700">{forgotEmail}</strong> ainsi que votre nouveau mot de passe.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Code de réinitialisation *</label>
                <div className="relative">
                  <IconDeviceMobile className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={forgotOtp} 
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none font-bold text-center text-lg tracking-[0.25em] text-[#2B5296] bg-white" 
                    placeholder="******" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#6588BB] uppercase mb-1.5">Nouveau mot de passe *</label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    required 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none bg-white" 
                    placeholder="Minimum 8 caractères" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setForgotStep('request')} 
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold border-none cursor-pointer hover:bg-slate-200"
                >
                  Retour
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-bold border-none cursor-pointer shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isLoading ? "Modification..." : "Réinitialiser le mot de passe"}
                </button>
              </div>
            </form>
          )
        )}

      </div>

      <Toast isOpen={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  );
};