import { useNavigate } from 'react-router-dom';
import { 
  IconHospital, 
  IconBuildingHospital, 
  IconStethoscope, 
  IconUserHeart,
  IconUsers
} from '@tabler/icons-react';

export const HospitalisationHub = () => {
  const navigate = useNavigate();

  const cards = [
    { title: "Hôpitaux", desc: "Gérer le répertoire des structures de soin et établissements.", icon: <IconHospital size={32} />, path: "/hospitals", color: "bg-blue-50 text-[#2B5296]" },
    { title: "Services", desc: "Gérer les pôles cliniques et spécialités médicales.", icon: <IconBuildingHospital size={32} />, path: "/services", color: "bg-emerald-50 text-emerald-600" },
    { title: "Médecins", desc: "Gérer les profils du personnel médical et affectations.", icon: <IconStethoscope size={32} />, path: "/doctors", color: "bg-purple-50 text-purple-600" },
    { title: "Patients", desc: "Registre d'admission administrative et suivi clinique.", icon: <IconUserHeart size={32} />, path: "/patients", color: "bg-pink-50 text-pink-500" },
    { title: "Donneurs", desc: "Consulter et gérer le registre des donneurs de reins.", icon: <IconUsers size={32} />, path: "/donors", color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Portail Hospitalisation</h1>
        <p className="text-[#6588BB] text-sm mt-1">Sélectionnez un registre pour consulter et gérer les données administratives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className="bg-white border border-slate-100 rounded-[24px] p-8 flex items-start gap-5 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            <div className={`p-4 rounded-2xl ${card.color} shrink-0`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.desc}</p>
              <span className="text-xs font-bold text-[#2B5296] inline-flex items-center gap-1">
                Accéder au registre <span className="text-[14px]">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};