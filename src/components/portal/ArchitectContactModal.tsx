import { m, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  MessageSquare, 
  X, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface ArchitectContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  architect: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
    whatsapp: string;
  };
  projectName: string;
}

export function ArchitectContactModal({
  isOpen,
  onClose,
  architect,
  projectName
}: ArchitectContactModalProps) {
  if (!isOpen) return null;

  const prefilledMessage = encodeURIComponent(
    `Hola ${architect.name}, te escribo desde el portal VIEW de MASSA GROUP sobre el proyecto ${projectName}. Quisiera coordinar una consulta técnica.`
  );
  const whatsappUrl = `https://wa.me/${architect.whatsapp}?text=${prefilledMessage}`;
  const phoneUrl = `tel:${architect.phone.replace(/\s+/g, '')}`;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard
            variant="panel"
            glowColor="#9CD01A"
            className="p-6 md:p-8 border-white/15 relative overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#A3A3A3] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#9CD01A] p-0.5 shadow-[0_0_25px_rgba(156,208,26,0.4)]">
                  <img
                    src={architect.avatar}
                    alt={architect.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#9CD01A] border-2 border-black flex items-center justify-center text-black" title="Activo">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[#9CD01A] text-xs font-semibold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Arquitecto Responsable</span>
              </div>

              <h3 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
                {architect.name}
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                {architect.role} • MASSA GROUP
              </p>
            </div>

            {/* Info / Availability details */}
            <div className="space-y-3 mb-6 bg-black/40 rounded-2xl p-4 border border-white/5 text-xs text-[#A3A3A3]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/80">
                  <Clock className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span>Horario de Atención:</span>
                </span>
                <span className="font-medium text-white">Lun - Vie (8am - 6pm)</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span>Proyecto Asignado:</span>
                <span className="font-semibold text-[#9CD01A]">{projectName}</span>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button
                  variant="primary"
                  className="w-full justify-center gap-2 shadow-[0_0_20px_rgba(156,208,26,0.3)]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversar por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                </Button>
              </a>

              <a
                href={phoneUrl}
                className="w-full"
              >
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2 border-white/15 hover:border-white/30"
                >
                  <Phone className="w-4 h-4 text-[#9CD01A]" />
                  <span>Llamar al {architect.phone}</span>
                </Button>
              </a>
            </div>
          </GlassCard>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
