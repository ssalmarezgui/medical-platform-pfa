import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  IconActivity, 
  IconMedicalCross, 
  IconScissors, 
  IconDna, 
  IconPill, 
  IconUsersGroup,
  IconDroplet,        
  IconBiohazard,      
  IconFlask,          
  IconTestPipe,       
  IconVirus,          
  IconShield,         
  IconPhoto           
} from '@tabler/icons-react';

export const DiagnosticDonorHub = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Détermination du mode Lecture Seule (R pour le médecin de suivi)
  const isReadOnly = user?.roleU === 'MEDECIN_SUIVI';

  const cards = [
    { 
      title: "Antécédents Familiaux",
      desc: "Historique médical de la famille, tares et pathologies héréditaires pour l'évaluation génétique.", 
      icon: <IconUsersGroup size={32} />, 
      path: "/donors/family-history", 
      color: "bg-indigo-50 text-indigo-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Habitudes", 
      desc: "Gérer la consommation de substances, le tabagisme, l'exposition et le sevrage du donneur.", 
      icon: <IconActivity size={32} />, 
      path: "/donors/habits", 
      color: "bg-blue-50 text-[#2B5296]",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Antécédents Médicaux", 
      desc: "Enregistrer les pathologies antérieures, traitements associés et leur évolution.", 
      icon: <IconMedicalCross size={32} />, 
      path: "/donors/medical-history", 
      color: "bg-emerald-50 text-emerald-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Antécédents Chirurgicaux", 
      desc: "Suivi des interventions chirurgicales subies, dates, lieux et évolution clinique.", 
      icon: <IconScissors size={32} />, 
      path: "/donors/surgery-history", 
      color: "bg-purple-50 text-purple-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Antécédents Gynéco-Obstétriques", 
      desc: "Suivi obstétrique complet pour les donneuses (grossesses, accouchements, contraception).", 
      icon: <IconDna size={32} />, 
      path: "/donors/obgyn-history", 
      color: "bg-pink-50 text-pink-500",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Médicaments Long Cours", 
      desc: "Registre des traitements médicamenteux habituels, molécules et indications cliniques.", 
      icon: <IconPill size={32} />, 
      path: "/donors/medications", 
      color: "bg-amber-50 text-amber-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Hématologie & Hémostase",
      desc: "Groupe Sanguin, rhésus, phénotypage et numération de la formule sanguine (NFS).", 
      icon: <IconDroplet size={32} />, 
      path: "/donors/hematology", 
      color: "bg-red-50 text-red-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Bilan Immunologique",
      desc: "Suivi du typage HLA, des anticorps cytotoxiques, du complément sérique et de la RAI.", 
      icon: <IconBiohazard size={32} />, 
      path: "/donors/immunology", 
      color: "bg-orange-50 text-orange-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Biochimie Sanguine",
      desc: "Analyses biochimiques du sang (créatinine, urée, électrolytes, etc.).", 
      icon: <IconFlask size={32} />, 
      path: "/donors/biochemistry-blood", 
      color: "bg-sky-50 text-sky-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Biochimie Urinaire",
      desc: "Analyses de la biochimie des urines et autres fluides corporels.", 
      icon: <IconTestPipe size={32} />, 
      path: "/donors/biochemistry-urine", 
      color: "bg-violet-50 text-violet-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Marqueurs Tumoraux",
      desc: "Suivi et dosage des marqueurs tumoraux (PSA et autres marqueurs spécifiques).", 
      icon: <IconShield size={32} />, 
      path: "/donors/tumor-markers", 
      color: "bg-yellow-50 text-yellow-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Microbiologie & Sérologie",
      desc: "Enquête infectieuse complète (Uroculture, HIV, Ag HbS, PCR HVB, CMV).", 
      icon: <IconVirus size={32} />, 
      path: "/donors/infectious", 
      color: "bg-rose-50 text-rose-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Examens d'Imagerie",
      desc: "Suivi des radiographies, échographies et scanners subis par le donneur.", 
      icon: <IconPhoto size={32} />, 
      path: "/donors/imaging", 
      color: "bg-gray-50 text-gray-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
    { 
      title: "Hormones & Vitamines",
      desc: "Bilan endocrinien complet (Parathormone, FT4/TSH, Vitamine D, B12/Folates).", 
      icon: <IconPill size={32} />, 
      path: "/donors/hormones-vitamins", 
      color: "bg-teal-50 text-teal-600",
      allowedRoles: ['ADMIN', 'MEDECIN_INVESTIGATEUR', 'AGENT_LABORATOIRE', 'MEDECIN_SUIVI'] // Ajout MEDECIN_SUIVI (R)
    },
  ];
  
  const filteredCards = cards.filter(card => {
    if (!user) return false;
    return card.allowedRoles.includes(user.roleU);
  });

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Portail Diagnostic & Clinique - Donneurs</h1>
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
            
            {/* Adaptation dynamique de la légende du bouton de redirection */}
            <span className="text-xs font-bold text-[#2B5296] inline-flex items-center gap-1 mt-auto pt-4 border-t border-slate-50 w-full">
              {isReadOnly ? "Consulter la fiche (Lecture seule)" : "Saisir & Consulter"} <span className="text-[14px]">→</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};