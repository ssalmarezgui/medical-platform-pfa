import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  IconActivity, 
  IconMedicalCross, 
  IconScissors, 
  IconDna, 
  IconPill, 
  IconHeartbeat,
  IconUsersGroup,
  IconDroplet,        
  IconBiohazard,      
  IconFlask,          
  IconTestPipe,       
  IconVirus,          
  IconShield,         
  IconPhoto           
} from '@tabler/icons-react';

export const DiagnosticHub = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const cards = [
    { 
      title: "Néphropathie & Bilan Pré-greffe",
      desc: "Consigner la maladie d'origine, les paramètres biopsiques, l'historique de dialyse et le rapport de bilan pré-greffe.", 
      icon: <IconHeartbeat size={32} />, 
      path: "/nephropathy-initial", 
      color: "bg-teal-50 text-teal-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Antécédents Familiaux",
      desc: "Historique médical de la famille, types de relations, tares et pathologies héréditaires.", 
      icon: <IconUsersGroup size={32} />, 
      path: "/family-history", 
      color: "bg-indigo-50 text-indigo-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Habitudes", 
      desc: "Gérer la consommation de substances, le tabagisme, l'exposition et le sevrage du patient.", 
      icon: <IconActivity size={32} />, 
      path: "/habits", 
      color: "bg-blue-50 text-[#2B5296]",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Antécédents Médicaux", 
      desc: "Enregistrer les pathologies antérieures, traitements associés et leur évolution.", 
      icon: <IconMedicalCross size={32} />, 
      path: "/medical-history", 
      color: "bg-emerald-50 text-emerald-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Antécédents Chirurgicaux", 
      desc: "Suivi des interventions chirurgicales subies, dates, lieux et évolution clinique.", 
      icon: <IconScissors size={32} />, 
      path: "/surgery-history", 
      color: "bg-purple-50 text-purple-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Antécédents Gynéco-Obstétriques", 
      desc: "Suivi obstétrique complet pour les patientes (grossesses, accouchements, contraception).", 
      icon: <IconDna size={32} />, 
      path: "/obgyn-history", 
      color: "bg-pink-50 text-pink-500",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Médicaments Long Cours", 
      desc: "Registre des traitements médicamenteux habituels, molécules et indications cliniques.", 
      icon: <IconPill size={32} />, 
      path: "/medications", 
      color: "bg-amber-50 text-amber-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Transplantation Antérieure", 
      desc: "Registre des transplantations rénales antérieures, types de donneurs et traitements d'induction.", 
      icon: <IconHeartbeat size={32} />, 
      path: "/transplants", 
      color: "bg-teal-50 text-teal-600",
      allowedRoles: ['ADMIN', 'MEDECIN_SUIVI', 'MEDECIN_INVESTIGATEUR']
    },
    { 
      title: "Hématologie & Hémostase",
      desc: "Groupe Sanguin, rhésus, phénotypage et numération de la formule sanguine (NFS).", 
      icon: <IconDroplet size={32} />, 
      path: "/hematology", 
      color: "bg-red-50 text-red-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Bilan Immunologique",
      desc: "Suivi du typage HLA, des anticorps cytotoxiques, du complément sérique et de la RAI.", 
      icon: <IconBiohazard size={32} />, 
      path: "/immunology", 
      color: "bg-orange-50 text-orange-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Biochimie Sanguine",
      desc: "Analyses biochimiques du sang (créatinine, urée, électrolytes, etc.).", 
      icon: <IconFlask size={32} />, 
      path: "/biochemistry-blood", 
      color: "bg-sky-50 text-sky-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Biochimie Urinaire",
      desc: "Analyses de la biochimie des urines et autres fluides corporels.", 
      icon: <IconTestPipe size={32} />, 
      path: "/biochemistry-urine", 
      color: "bg-violet-50 text-violet-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Marqueurs Tumoraux",
      desc: "Suivi et dosage des marqueurs tumoraux (PSA et autres marqueurs spécifiques).", 
      icon: <IconShield size={32} />, 
      path: "/tumor-markers", 
      color: "bg-yellow-50 text-yellow-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Microbiologie & Sérologie",
      desc: "Enquête infectieuse complète (Uroculture, HIV, Ag HbS, PCR HVB, CMV).", 
      icon: <IconVirus size={32} />, 
      path: "/infectious", 
      color: "bg-rose-50 text-rose-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Examens d'Imagerie",
      desc: "Suivi des radiographies, échographies et scanners subis par le patient.", 
      icon: <IconPhoto size={32} />, 
      path: "/imaging", 
      color: "bg-gray-50 text-gray-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
    { 
      title: "Hormones & Vitamines",
      desc: "Bilan endocrinien complet (Parathormone, FT4/TSH, Vitamine D, B12/Folates).", 
      icon: <IconPill size={32} />, 
      path: "/hormones-vitamins", 
      color: "bg-teal-50 text-teal-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE']
    },
  ];

  const filteredCards = cards.filter(card => {
    if (!user) return false;
    return card.allowedRoles.includes(user.roleU);
  });

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Portail Diagnostic & Clinique</h1>
        <p className="text-[#6588BB] text-sm mt-1">
          Identifié en tant que : <strong className="text-[#2B5296] font-bold">{user?.roleU?.replace('_', ' ')}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className="bg-white border border-[#A7C0E4]/30 rounded-[24px] p-6 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            <div>
              <div className={`p-3 rounded-2xl ${card.color} shrink-0 w-fit mb-6`}>
                {card.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">{card.desc}</p>
            </div>
            
            <span className="text-xs font-bold text-[#2B5296] inline-flex items-center gap-1 mt-auto pt-4 border-t border-slate-50 w-full">
              Consulter la fiche <span className="text-[14px]">→</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};