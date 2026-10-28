import { useState, type MouseEvent } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Maximize, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  ArrowRight,
  Rotate3d,
  Check,
  ChevronRight,
  Sun,
  Compass,
  Wind,
  Droplets,
  VolumeX,
  Sliders,
  CreditCard,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { ProjectPublicSpecs } from '../../services/portalService';
import { Button } from '../ui/Button';

interface ProjectSpecsProps {
  projectName: string;
  specs: ProjectPublicSpecs;
  onContactCommercial?: () => void;
  onOpen360Tour?: () => void;
}

type SpecsTab = 'concept' | 'materials' | 'finishes' | 'spaces' | 'location' | 'financials' | 'bioclimatic';

// Photographic textures of genuine luxury architectural materials
const MATERIAL_SWATCHES = [
  {
    id: 'mat-1',
    name: 'Concreto Visto Arquitectónico',
    category: 'Estructura & Fachadas',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    tag: 'Architectural Concrete',
    benefit: 'Masa térmica con textura encofrada continua y sellado hidrófugo mate.',
    finish: 'Encofrado liso tipo tableta con juntas alineadas',
    specs: 'Resistencia f\'c 35 MPa • Sellador nanotecnológico antimoho'
  },
  {
    id: 'mat-2',
    name: 'Roble Europeo & Madera Termotratada',
    category: 'Carpintería & Decks',
    image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80',
    tag: 'Natural Wood & Decks',
    benefit: 'Aporte de calidez biofílica, absorción acústica y decks resistentes al sol.',
    finish: 'Aceitado mate a poro abierto con protección UV clase 4',
    specs: 'Certificación FSC • Ranurado antideslizante en áreas húmedas'
  },
  {
    id: 'mat-3',
    name: 'Mármol Calacatta Vagli & Pizarra',
    category: 'Revestimientos Nobles',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    tag: 'Noble Natural Stones',
    benefit: 'Piezas monolíticas de gran formato en islas centrales, baños y spa.',
    finish: 'Pulido sedoso apomazado antirreflejo',
    specs: 'Placas 320x160 cm continuas (Bookmatch) en isla y chimenea'
  },
  {
    id: 'mat-4',
    name: 'Ventanería Low-E & Perfilería Oculta',
    category: 'Envolvente Térmica',
    image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=800&q=80',
    tag: 'Acoustic & Solar Glass',
    benefit: 'Aislamiento acústico de 42 dB y control de ganancia solar pasiva.',
    finish: 'Vidrio templado laminado bajo emisivo con marco enrasado',
    specs: 'Factor Solar g = 0.38 • Transmitancia térmica U = 1.2 W/m²K'
  }
];

export function ProjectSpecs({ 
  projectName, 
  specs, 
  onContactCommercial,
  onOpen360Tour 
}: ProjectSpecsProps) {
  const [activeTab, setActiveTab] = useState<SpecsTab>('concept');
  const [selectedMaterial, setSelectedMaterial] = useState<number>(0);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0);

  // Spotlight mouse effect for interactive cards
  const handleSpotlight = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const whatsappMsg = encodeURIComponent(
    `Hola Massa Group, estoy explorando la ficha técnica de ${projectName} en su portal VIEW y quisiera agendar una asesoría de diseño para mi proyecto.`
  );
  const whatsappUrl = `https://wa.me/573108924410?text=${whatsappMsg}`;

  const handleAction = () => {
    if (onContactCommercial) {
      onContactCommercial();
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-8 pb-40 max-w-6xl mx-auto">
      
      {/* 1. Header Principal: Jerarquía Visual y Acciones */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          {/* Badge de Categoría */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_10px_#9CD01A] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#9CD01A]">
              FICHA TÉCNICA ARQUITECTÓNICA
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[11px] text-white/50 font-mono tracking-wider">
              MASSA DESIGN STUDIO
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F5F5F5]">
            {projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-[#A3A3A3]">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white font-medium border border-white/10">
              {specs.typology}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-[#9CD01A]" />
              {specs.location}
            </span>
            <span>•</span>
            <span className="text-white/60">
              {specs.architecturalStyle}
            </span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
          {onOpen360Tour && (
            <button
              onClick={onOpen360Tour}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-white transition-all cursor-pointer hover:scale-103 active:scale-97 shadow-lg"
            >
              <Rotate3d className="w-4 h-4 text-[#9CD01A]" />
              <span>Ver en 360°</span>
            </button>
          )}

          <Button
            variant="primary"
            onClick={handleAction}
            className="gap-2 shadow-[0_0_25px_rgba(156,208,26,0.35)] hover:scale-103 active:scale-97 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-black" />
            <span>Consultar con MASSA</span>
          </Button>
        </div>
      </div>

      {/* 2. Bento Grid de Métricas Arquitectónicas Clave (Con Spotlight e Interacción) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Métrica 1: Área Construida con desglose */}
        <div 
          onMouseMove={handleSpotlight}
          className="group relative p-5 rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
          style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
        >
          <div 
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(156, 208, 26, 0.12), transparent 80%)'
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3]">Área Construida</span>
              <Maximize className="w-4 h-4 text-[#9CD01A] group-hover:scale-115 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{specs.areaBuilt.split(' ')[0]}</span>
              <span className="text-xs sm:text-sm font-bold text-[#9CD01A]">m² cubiertos</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden flex">
              <div className="bg-[#9CD01A] h-full w-[65%]" title="Interiores (65%)" />
              <div className="bg-white/40 h-full w-[25%]" title="Terrazas (25%)" />
              <div className="bg-[#9CD01A]/40 h-full w-[10%]" title="Piscina (10%)" />
            </div>
            <div className="text-[10px] text-white/50 mt-1.5 flex justify-between font-mono">
              <span>Int. 65%</span>
              <span>Deck 25%</span>
              <span>Agua 10%</span>
            </div>
          </div>
        </div>

        {/* Métrica 2: Lote Privado */}
        <div 
          onMouseMove={handleSpotlight}
          className="group relative p-5 rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
          style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
        >
          <div 
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(156, 208, 26, 0.12), transparent 80%)'
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3]">Lote de Terreno</span>
              <Building2 className="w-4 h-4 text-[#9CD01A] group-hover:scale-115 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>{specs.lotArea?.split(' ')[0] || '850'}</span>
              <span className="text-xs sm:text-sm font-bold text-[#9CD01A]">m² lote</span>
            </div>
            <div className="text-[11px] text-white/60 mt-3 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#9CD01A]" />
              <span>Implantación topográfica</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">Topografía con vista abierta</div>
          </div>
        </div>

        {/* Métrica 3: Volumetría & Doble Altura */}
        <div 
          onMouseMove={handleSpotlight}
          className="group relative p-5 rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
          style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
        >
          <div 
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(156, 208, 26, 0.12), transparent 80%)'
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3]">Volumetría</span>
              <Layers className="w-4 h-4 text-[#9CD01A] group-hover:scale-115 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {specs.levels}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#9CD01A]/15 text-[#9CD01A] text-[10px] font-mono font-bold mt-2.5">
              <span>5.80m Doble Altura</span>
            </div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">Voladizo de 4.2m frontal</div>
          </div>
        </div>

        {/* Métrica 4: Asoleamiento & Confort Bioclimático */}
        <div 
          onMouseMove={handleSpotlight}
          className="group relative p-5 rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/10 hover:border-[#9CD01A]/50 transition-all duration-300 shadow-xl hover:-translate-y-1 overflow-hidden"
          style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
        >
          <div 
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(156, 208, 26, 0.12), transparent 80%)'
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3]">Estrategia Pasiva</span>
              <Sun className="w-4 h-4 text-[#9CD01A] group-hover:scale-115 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Bioclimática
            </div>
            <div className="text-[11px] text-[#9CD01A] font-semibold mt-2.5 flex items-center gap-1">
              <Wind className="w-3 h-3" />
              <span>Ventilación cruzada</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">Diseño {specs.year} • Eficiencia A+</div>
          </div>
        </div>

      </div>

      {/* 3. Selector de Pestañas Interactivas visionOS (Diseño con Píldoras Flotantes) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141416]/95 backdrop-blur-2xl border border-white/10 overflow-x-auto no-scrollbar w-fit max-w-full">
        
        <button
          type="button"
          onClick={() => setActiveTab('concept')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'concept'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Visión & Concepto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'materials'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Materiales Nobles ({MATERIAL_SWATCHES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spaces')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'spaces'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Zonificación & Recintos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finishes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'finishes'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ficha de Acabados</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'location'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Ubicación & Lote</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'financials'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Valor & Forma de Pago</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bioclimatic')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'bioclimatic'
              ? 'bg-[#9CD01A] text-black shadow-[0_0_20px_rgba(156,208,26,0.35)] scale-102 font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Confort & Sostenibilidad</span>
        </button>

      </div>

      {/* 4. Contenido Dinámico según la Pestaña Activa */}
      <AnimatePresence mode="wait">
        
        {/* ==============================================================
            PESTAÑA 1: VISIÓN & CONCEPTO ARQUITECTÓNICO
            ============================================================== */}
        {activeTab === 'concept' && (
          <m.div
            key="concept"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Editorial Statement: Cero muros de texto aburridos */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#161619] via-[#121214] to-[#0D0D0E] border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-[#9CD01A] text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
                  DECLARACIÓN DE DISEÑO
                </div>
                
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3 leading-snug">
                  "Una coreografía espacial de volúmenes en voladizo, luz cenital y serenidad biofílica."
                </h3>

                <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                  {specs.designConcept}
                </p>
              </div>

              {/* Botón interactivo para ver en 360 */}
              {onOpen360Tour && (
                <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-[#A3A3A3]">
                    Experimenta este concepto en primera persona recorriendo cada estancia en 360°.
                  </span>
                  <button
                    onClick={onOpen360Tour}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9CD01A]/15 hover:bg-[#9CD01A] border border-[#9CD01A]/30 text-xs font-bold text-[#9CD01A] hover:text-black transition-all cursor-pointer hover:scale-103"
                  >
                    <Rotate3d className="w-4 h-4" />
                    <span>Iniciar Recorrido Inmersivo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Atributos Clave Presentados como Bento Cards Interactivas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specs.keyFeatures.map((feat, idx) => {
                const parts = feat.split('(');
                const title = parts[0].trim();
                const detail = parts[1] ? parts[1].replace(')', '').trim() : 'Optimizado para máxima durabilidad y confort térmico.';
                
                return (
                  <div
                    key={idx}
                    onMouseMove={handleSpotlight}
                    className="group relative p-5 rounded-2xl bg-[#141416]/80 backdrop-blur-xl border border-white/10 hover:border-[#9CD01A]/40 transition-all duration-300 flex items-start gap-4 hover:-translate-y-1 shadow-lg cursor-pointer overflow-hidden"
                    style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
                  >
                    <div 
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), rgba(156, 208, 26, 0.1), transparent 80%)'
                      }}
                    />
                    
                    <div className="relative z-10 w-11 h-11 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/20 flex items-center justify-center text-[#9CD01A] shrink-0 group-hover:bg-[#9CD01A] group-hover:text-black group-hover:scale-110 transition-all">
                      {idx === 0 ? <Sun className="w-5 h-5" /> : idx === 1 ? <Droplets className="w-5 h-5" /> : idx === 2 ? <VolumeX className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>

                    <div className="relative z-10 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#9CD01A] transition-colors">
                          {title}
                        </h4>
                        <span className="text-[10px] font-mono text-white/40 group-hover:text-[#9CD01A]">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                        {detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA 2: LABORATORIO DE MATERIALES NOBLES
            ============================================================== */}
        {activeTab === 'materials' && (
          <m.div
            key="materials"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Grid de Muestras con Texturas Reales y Zoom Interactivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MATERIAL_SWATCHES.map((mat, idx) => {
                const isSelected = selectedMaterial === idx;
                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterial(idx)}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? 'border-[#9CD01A] ring-2 ring-[#9CD01A]/30 shadow-[0_15px_35px_rgba(156,208,26,0.25)] -translate-y-1'
                        : 'border-white/10 hover:border-white/30 bg-[#141416]/80'
                    }`}
                  >
                    {/* Fotografía de la Textura Real */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                      <img
                        src={mat.image}
                        alt={mat.name}
                        className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-115"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-black/25 to-transparent" />
                      
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-[#9CD01A] border border-white/15">
                        {mat.tag}
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#9CD01A] flex items-center justify-center text-black shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Ficha Descriptiva del Material */}
                    <div className="p-4 sm:p-5 bg-[#141416] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#9CD01A] tracking-wider block mb-1">
                          {mat.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1.5 group-hover:text-[#9CD01A] transition-colors">
                          {mat.name}
                        </h4>
                        <p className="text-xs text-[#A3A3A3] line-clamp-2 leading-relaxed">
                          {mat.benefit}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-white/10 text-[11px] text-white/60 font-mono flex items-center justify-between">
                        <span>Acabado:</span>
                        <span className="text-white font-medium truncate max-w-[130px]" title={mat.finish}>
                          {mat.finish.split(' ')[0]} {mat.finish.split(' ')[1] || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inspección Técnica del Material Seleccionado */}
            <div className="p-6 rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-widest font-bold">
                    ESPECIFICACIÓN TÉCNICA DETALLADA
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] text-white/50 font-mono">
                    {MATERIAL_SWATCHES[selectedMaterial].category}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white">
                  {MATERIAL_SWATCHES[selectedMaterial].name}
                </h4>

                <p className="text-xs text-[#CCCCCC] mt-1 max-w-2xl leading-relaxed">
                  {MATERIAL_SWATCHES[selectedMaterial].benefit} • <strong className="text-white">Acabado:</strong> {MATERIAL_SWATCHES[selectedMaterial].finish}.
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white/80 font-mono mt-3">
                  <Sliders className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span>{MATERIAL_SWATCHES[selectedMaterial].specs}</span>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs text-[#9CD01A] font-mono font-bold shrink-0 self-start sm:self-center">
                100% Certificado MASSA
              </div>
            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA 3: ZONIFICACIÓN ESPACIAL & RECINTOS
            ============================================================== */}
        {activeTab === 'spaces' && (
          <m.div
            key="spaces"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Selector de Niveles con Tabs Horizontales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {specs.spatialProgram.map((prog, idx) => {
                const isSelected = selectedZoneIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedZoneIndex(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#9CD01A]/15 border-[#9CD01A] shadow-[0_0_25px_rgba(156,208,26,0.25)] scale-102'
                        : 'bg-[#141416]/70 border-white/10 hover:border-white/20 text-[#A3A3A3]'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-mono uppercase block ${isSelected ? 'text-[#9CD01A] font-bold' : 'text-white/40'}`}>
                        NIVEL {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {prog.zone}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-white/10 text-white">
                      {prog.spaces.length} recintos
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Recintos de la Zona con Acciones Interactivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {specs.spatialProgram[selectedZoneIndex]?.spaces.map((space, sIdx) => (
                <div
                  key={sIdx}
                  onMouseMove={handleSpotlight}
                  className="group p-4 rounded-2xl bg-[#141416]/85 backdrop-blur-xl border border-white/10 hover:border-[#9CD01A]/50 transition-all flex items-center justify-between gap-3 shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                  style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as any}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#9CD01A] group-hover:scale-150 transition-transform shadow-[0_0_6px_#9CD01A]" />
                    <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#9CD01A] transition-colors">
                      {space}
                    </span>
                  </div>

                  {onOpen360Tour ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen360Tour();
                      }}
                      title="Explorar en 360°"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#9CD01A] text-white/50 hover:text-black transition-colors"
                    >
                      <Rotate3d className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#9CD01A] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA 4: CONFORT & ESTRATEGIA BIOCLIMÁTICA
            ============================================================== */}
        {activeTab === 'bioclimatic' && (
          <m.div
            key="bioclimatic"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Pilar 1: Luz Pasiva */}
              <div className="p-6 rounded-3xl bg-[#141416]/85 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/20 flex items-center justify-center text-[#9CD01A] mb-4 group-hover:scale-110 transition-transform">
                  <Sun className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  Luz Cenital & Asoleamiento
                </h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Orientación estudiada con aleros proyectados que bloquean la radiación directa en horas pico y permiten 82% de iluminación natural diurna.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#9CD01A]">
                  Aleros de 2.4m • 0% deslumbramiento
                </div>
              </div>

              {/* Pilar 2: Ventilación Cruzada */}
              <div className="p-6 rounded-3xl bg-[#141416]/85 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/20 flex items-center justify-center text-[#9CD01A] mb-4 group-hover:scale-110 transition-transform">
                  <Wind className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  Ventilación Eólica Pasiva
                </h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Efecto chimenea en la doble altura que evacúa el calor acumulado y canales de brisa cruzada que reducen la necesidad de aire acondicionado en un 65%.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#9CD01A]">
                  Flujo natural • -3.5°C confort térmico
                </div>
              </div>

              {/* Pilar 3: Microclima Hidráulico */}
              <div className="p-6 rounded-3xl bg-[#141416]/85 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-xl group">
                <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/20 flex items-center justify-center text-[#9CD01A] mb-4 group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">
                  Espejo de Agua & Piscina
                </h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Lámina de agua perimetral que humedece y refresca el aire que ingresa al área social, creando un oasis de tranquilidad acústica y confort.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-[#9CD01A]">
                  Piscina Infinity 62 m² • Enfriamiento evaporativo
                </div>
              </div>

            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA: FICHA DE ACABADOS & CARPINTERÍA
            ============================================================== */}
        {activeTab === 'finishes' && (
          <m.div
            key="finishes"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-[#141416]/90 border border-white/10 backdrop-blur-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                  ESPECIFICACIÓN DE MATERIALES & TERMINACIONES
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Cuadro de Acabados de Autor
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs font-mono font-bold text-[#9CD01A] self-start sm:self-auto">
                CALIDAD PREMIUM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">01 • Pisos & Revestimientos</span>
                <h4 className="text-base font-bold text-white mb-2">Pisos y Porcelanatos</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.flooring || 'Porcelanato rectificado de ultra gran formato y mármol apomazado en zonas húmedas.'}
                </p>
              </div>

              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">02 • Carpintería & Puertas</span>
                <h4 className="text-base font-bold text-white mb-2">Maderas Nobles</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.carpentry || 'Puertas piso a techo en roble natural con cerraduras magnéticas y closets modulares.'}
                </p>
              </div>

              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">03 • Cocina Gourmet</span>
                <h4 className="text-base font-bold text-white mb-2">Muebles & Mesones</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.kitchen || 'Mesón monolítico en cuarzo / Neolith, herrajes de cierre suave y campana oculta.'}
                </p>
              </div>

              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">04 • Baños & Spa</span>
                <h4 className="text-base font-bold text-white mb-2">Aparatos & Grifería</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.bathrooms || 'Sanitarios suspendidos, griferías monocontrol en negro mate y duchas termostáticas.'}
                </p>
              </div>

              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">05 • Envolvente & Fachada</span>
                <h4 className="text-base font-bold text-white mb-2">Textura & Vidrio</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.facade || 'Concreto visto arquitectónico, lamas bioclimáticas y ventanería con cristal de control térmico.'}
                </p>
              </div>

              <div onMouseMove={handleSpotlight} className="group relative p-5 rounded-2xl bg-[#141416]/80 border border-white/10 hover:border-[#9CD01A]/40 transition-all shadow-lg overflow-hidden">
                <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">06 • Domótica & Redes</span>
                <h4 className="text-base font-bold text-white mb-2">Automatización Smart</h4>
                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {specs.finishes?.automation || 'Puntos para control inteligente de iluminación, escenas de relax, cortinas y sonido multizona.'}
                </p>
              </div>
            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA: UBICACIÓN DEL CONJUNTO & LOTE
            ============================================================== */}
        {activeTab === 'location' && (
          <m.div
            key="location"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="rounded-3xl bg-[#141416]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A] shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                      LOCALIZACIÓN DEL PROYECTO
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Ubicación del Conjunto & Lote
                    </h3>
                  </div>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70 self-start sm:self-auto">
                  {specs.locationDetails?.city || specs.location}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Sector o Condominio</span>
                  <div className="text-lg font-black text-white">
                    {specs.locationDetails?.neighborhood || specs.location}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Identificación del Terreno</span>
                  <div className="text-lg font-black text-[#9CD01A]">
                    {specs.locationDetails?.lotNumber || specs.lotArea || 'Lote Privado'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Área y Tipología</span>
                  <div className="text-lg font-black text-white">
                    {specs.areaBuilt} • {specs.typology}
                  </div>
                </div>
              </div>

              {specs.locationDetails?.environment && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider font-bold block mb-1">
                    Entorno, Seguridad y Plusvalía
                  </span>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                    {specs.locationDetails.environment}
                  </p>
                </div>
              )}
            </div>
          </m.div>
        )}

        {/* ==============================================================
            PESTAÑA: VALOR DEL PROYECTO & FORMA DE PAGO
            ============================================================== */}
        {activeTab === 'financials' && (
          <m.div
            key="financials"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="rounded-3xl bg-gradient-to-br from-[#161720] via-[#111217] to-[#0c0d11] border border-[#9CD01A]/30 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#9CD01A] text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(156,208,26,0.35)]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                      ESTRUCTURA DE INVERSIÓN
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Valor del Proyecto & Forma de Pago
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 text-xs font-mono font-bold text-[#9CD01A]">
                    {specs.financials?.priceCOP || 'A Consultar'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
                    01 • Separación & Inicial
                  </span>
                  <div className="text-lg font-black text-white mb-1">
                    {specs.financials?.downPayment || '30% Durante Planeación'}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Firma de promesa de compraventa, estudios técnicos y radicación de licencias.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
                    02 • Durante Construcción
                  </span>
                  <div className="text-lg font-black text-white mb-1">
                    {specs.financials?.milestones || '50% en Hitos de Obra'}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Desembolsos contra actas de interventoría y avance estructural verificado.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] font-mono text-[#9CD01A] uppercase tracking-wider block mb-1">
                    03 • Entrega de Llaves
                  </span>
                  <div className="text-lg font-black text-white mb-1">
                    {specs.financials?.delivery || '20% Contra Entrega'}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Recibo a satisfacción, entrega de manuales de garantías y escrituración formal.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#9CD01A] shrink-0" />
                  <div className="text-xs text-white/80">
                    <strong className="text-white">Garantía Llave en Mano MASSA:</strong> Presupuesto cerrado sin imprevistos. Acompañamiento fiduciario y bancario integral.
                  </div>
                </div>
                <Button variant="primary" onClick={handleAction} className="shrink-0">
                  Solicitar Cotización Personalizada
                </Button>
              </div>
            </div>
          </m.div>
        )}

      </AnimatePresence>

      {/* 5. Banner de Confidencialidad y Propiedad Intelectual */}
      <div className="rounded-2xl bg-[#141416]/60 border border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#A3A3A3] leading-relaxed">
            <strong className="text-white block font-semibold mb-0.5">Propiedad Intelectual y Confidencialidad:</strong>
            Los planos estructurales, memorias de cálculo, presupuestos y licencias están protegidos bajo acuerdos de confidencialidad y reservados exclusivamente para el cliente propietario.
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest hidden md:inline shrink-0 font-bold">
          PROTEGIDO
        </span>
      </div>

      {/* 6. Banner Comercial de Alta Gama: Asesoría de Diseño con MASSA GROUP */}
      <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#161619] via-[#1D2515] to-[#111113] border border-[#9CD01A]/30 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9CD01A]/15 border border-[#9CD01A]/30 text-[#9CD01A] text-[10px] font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DISEÑO PERSONALIZADO MASSA GROUP</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              ¿Deseas concebir un proyecto a medida con este nivel de excelencia?
            </h3>

            <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2 leading-relaxed">
              Trabajamos con clientes e inversionistas para crear residencias y sedes exclusivas, integrando recorridos 360°, fotorrealismo cinematográfico y dirección de obra de principio a fin.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAction}
            className="gap-2.5 shadow-[0_0_35px_rgba(156,208,26,0.45)] shrink-0 self-start md:self-auto hover:scale-105 transition-transform"
          >
            <span>Agendar Consulta de Diseño</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
