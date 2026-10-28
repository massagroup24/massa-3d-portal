import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, Clock, MessageSquare } from 'lucide-react';

interface VipContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultResidenceName?: string;
}

export function VipContactModal({
  isOpen,
  onClose,
  defaultResidenceName,
}: VipContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(defaultResidenceName || 'RESIDENCIA JEJÉN (Cali)');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generar mensaje estructurado de WhatsApp
    const text = `Hola MASSA GROUP, solicito agendar una consulta privada VIP:
• Nombre: ${name}
• Teléfono: ${phone}
• Email: ${email || 'No especificado'}
• Proyecto o Interés: ${interest}
• Fecha tentativa de visita: ${preferredDate || 'A coordinar'}
• Mensaje / Requerimiento: ${message || 'Deseo conocer opciones de inversión y terrenos.'}`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/573108924410?text=${encoded}`, '_blank');
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#141416] border border-[#9CD01A]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(156,208,26,0.15)] overflow-hidden"
        >
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cabecera del Modal */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
              <span className="text-[10px] font-bold tracking-widest text-[#9CD01A] uppercase">
                ATENCIÓN PRIVADA DE AUTOR
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Agendar Asesoría VIP
            </h3>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              Coordinemos una reunión privada o asesoría personalizada para tus proyectos en Cúcuta y Norte de Santander con el equipo directivo de MASSA.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#9CD01A]/20 border border-[#9CD01A] flex items-center justify-center text-[#9CD01A] mb-4 shadow-[0_0_20px_rgba(156,208,26,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">¡Solicitud Enviada!</h4>
              <p className="text-xs text-white/60 max-w-xs">
                Se ha generado tu contacto directo con nuestro Arquitecto Líder en WhatsApp. Te responderemos de inmediato.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Sarmiento"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@vip.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                  Residencia o Ubicación de Interés
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1c1c1f] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition cursor-pointer"
                >
                  <option value="HACIENDA F22 (Cúcuta)">HACIENDA F22 • Condominio Hacienda (Lote F22)</option>
                  <option value="IBIZA A14 (Cúcuta)">IBIZA A14 • Condominio Ibiza (Lote A14)</option>
                  <option value="RESIDENCIA JEJÉN (Cali)">RESIDENCIA JEJÉN • Cali (480 m²)</option>
                  <option value="SEDE MARQUIMODA">SEDE CORPORATIVA MARQUIMODA (620 m²)</option>
                  <option value="PROYECTO DESDE CERO">Diseño & Construcción en Lote Propio</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                  Fecha Tentativa para Visita / Llamada
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase block mb-1">
                  Mensaje o Especificación Adicional
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detalles sobre terreno propio, presupuesto estimado o preguntas..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9CD01A] transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#9CD01A] hover:bg-[#aef01e] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_10px_25px_rgba(156,208,26,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <MessageSquare className="w-4 h-4 text-black" />
                <span>Confirmar & Abrir WhatsApp con Asesor Líder</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-white/40 pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#9CD01A]" />
                  Respuesta en &lt; 15 min
                </span>
                <span>•</span>
                <span>Confidencialidad Garantizada</span>
              </div>
            </form>
          )}

        </m.div>
      </div>
    </AnimatePresence>
  );
}
