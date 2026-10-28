import { useState, useMemo } from 'react';
import { 
  Calculator, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Building, 
  Home, 
  TreePine, 
  Layers, 
  ShieldCheck
} from 'lucide-react';

interface InvestmentEstimatorProps {
  onOpenConsultation?: () => void;
}

type ProjectType = 'villa' | 'casa_urbana' | 'penthouse' | 'corporativo';
type LocationZone = 'cucuta' | 'calima' | 'dapa' | 'cali_pance' | 'rozo' | 'otra';
type QualityTier = 'contemporary' | 'signature' | 'masterpiece';

export function InvestmentEstimator({ onOpenConsultation }: InvestmentEstimatorProps) {
  const [projectType, setProjectType] = useState<ProjectType>('villa');
  const [locationZone, setLocationZone] = useState<LocationZone>('cucuta');
  const [areaSqM, setAreaSqM] = useState<number>(450);
  const [qualityTier, setQualityTier] = useState<QualityTier>('signature');
  const [includeLot, setIncludeLot] = useState<boolean>(false);
  const [include360Tour, setInclude360Tour] = useState<boolean>(true);

  // Estimación de costo por m² en COP según calidad
  const costPerSqM = useMemo(() => {
    switch (qualityTier) {
      case 'contemporary':
        return 3800000; // $3.8M COP/m²
      case 'signature':
        return 4500000; // $4.5M COP/m² (Mármol, ventanería hermética, domótica)
      case 'masterpiece':
        return 5400000; // $5.4M COP/m² (Piscina infinity, turco spa, maderas nobles, doble altura extrema)
    }
  }, [qualityTier]);

  // Costo estimado del terreno según ubicación
  const lotCost = useMemo(() => {
    if (!includeLot) return 0;
    switch (locationZone) {
      case 'cucuta':
        return 500000000; // $500M COP lote residencial exclusivo en Cúcuta / N.D.S.
      case 'calima':
        return 450000000; // $450M COP lote típico 1.500m² frente al lago
      case 'dapa':
        return 650000000; // $650M COP lote 2.500m² con vista panorámica
      case 'cali_pance':
        return 850000000; // $850M COP lote urbano en Pance
      case 'rozo':
        return 380000000; // $380M COP lote plano 2.000m²
      case 'otra':
        return 400000000;
    }
  }, [includeLot, locationZone]);

  const constructionBase = areaSqM * costPerSqM;
  const totalMinCOP = Math.round((constructionBase * 0.95 + lotCost) / 10000000) * 10000000;
  const totalMaxCOP = Math.round((constructionBase * 1.08 + lotCost) / 10000000) * 10000000;
  
  // Tasa orientativa COP -> USD (aprox 4.000)
  const totalMinUSD = Math.round(totalMinCOP / 4000);
  const totalMaxUSD = Math.round(totalMaxCOP / 4000);

  // Tiempo estimado de ejecución
  const estimatedMonths = useMemo(() => {
    if (areaSqM < 350) return '8 a 10 meses';
    if (areaSqM < 600) return '11 a 13 meses';
    return '14 a 18 meses';
  }, [areaSqM]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getTypeName = () => {
    switch (projectType) {
      case 'villa': return 'Villa Campestre de Lujo';
      case 'casa_urbana': return 'Residencia Urbana Exclusiva';
      case 'penthouse': return 'Penthouse / Sky Villa';
      case 'corporativo': return 'Sede Corporativa / Comercial';
    }
  };

  const getLocationName = () => {
    switch (locationZone) {
      case 'cucuta': return 'Cúcuta (Norte de Santander)';
      case 'calima': return 'Lago Calima, Valle';
      case 'dapa': return 'Dapa (Alta Montaña), Valle';
      case 'cali_pance': return 'Cali (Pance / Peñón)';
      case 'rozo': return 'Rozo / Cerrito';
      case 'otra': return 'Otra Región';
    }
  };

  const getTierName = () => {
    switch (qualityTier) {
      case 'contemporary': return 'Luxury Contemporary';
      case 'signature': return 'MASSA Signature (Ultralujo)';
      case 'masterpiece': return 'Masterpiece Monolítico';
    }
  };

  const handleSendWhatsAppQuote = () => {
    const text = `Hola Massa Group, acabo de realizar una estimación en su portal comercial VIEW:
• Tipo de Proyecto: ${getTypeName()}
• Ubicación: ${getLocationName()}
• Área Estimada: ${areaSqM} m²
• Nivel de Acabados: ${getTierName()}
• Incluye Gestión de Terreno: ${includeLot ? 'Sí' : 'No (Ya dispongo de lote propio)'}
• Presupuesto Estimado: ${formatCOP(totalMinCOP)} - ${formatCOP(totalMaxCOP)} (${formatUSD(totalMinUSD)} - ${formatUSD(totalMaxUSD)})
• Tiempo Estimado: ${estimatedMonths}

Me gustaría coordinar una reunión privada con el Arquitecto Líder para revisar la viabilidad y recibir el dossier comercial.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/573108924410?text=${encoded}`, '_blank');
  };

  return (
    <div id="cotizador" className="w-full relative py-16 sm:py-24">
      {/* Glow ambiental */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9CD01A]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Cabecera del Cotizador */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30 mb-4">
            <Calculator className="w-4 h-4 text-[#9CD01A]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#9CD01A] uppercase">
              COTIZADOR INTERACTIVO VIP
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Proyecta la Inversión de tu <span className="text-[#9CD01A]">Residencia de Autor</span>
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Personaliza el metraje, ubicación y nivel de acabados. Obtén un rango de inversión en tiempo real con garantía de entrega llave en mano y sin sobrecostos ocultos.
          </p>
        </div>

        {/* Contenedor Grid: Configuración a la izquierda, Resultados dinámicos a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA 1: Parámetros del Proyecto (7 columnas) */}
          <div className="lg:col-span-7 bg-[#141416]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-8">
            
            {/* 1. Tipo de Proyecto */}
            <div>
              <label className="text-xs font-bold tracking-wider text-white/50 uppercase block mb-3">
                1. Tipo de Residencia / Edificación
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'villa', label: 'Villa Campestre', icon: TreePine },
                  { id: 'casa_urbana', label: 'Casa Urbana', icon: Home },
                  { id: 'penthouse', label: 'Penthouse', icon: Building },
                  { id: 'corporativo', label: 'Corporativo', icon: Layers },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = projectType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProjectType(item.id as ProjectType)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#9CD01A]/15 border-[#9CD01A] text-white shadow-[0_0_20px_rgba(156,208,26,0.25)]'
                          : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${active ? 'text-[#9CD01A]' : 'text-white/40'}`} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Área Construida (Slider Interactivo) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold tracking-wider text-white/50 uppercase">
                  2. Área Construida Proyectada
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#9CD01A] font-mono">
                    {areaSqM}
                  </span>
                  <span className="text-xs font-bold text-white/60 uppercase">m² cubiertos</span>
                </div>
              </div>

              <input
                type="range"
                min="200"
                max="1200"
                step="25"
                value={areaSqM}
                onChange={(e) => setAreaSqM(Number(e.target.value))}
                className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#9CD01A] focus:outline-none"
              />
              <div className="flex justify-between text-[11px] font-mono text-white/40 mt-2">
                <span>200 m² (Compacta Luxury)</span>
                <span>600 m² (Villa Estándar)</span>
                <span>1.200 m² (Mansión de Autor)</span>
              </div>
            </div>

            {/* 3. Ubicación Exclusiva */}
            <div>
              <label className="text-xs font-bold tracking-wider text-white/50 uppercase block mb-3">
                3. Ubicación del Proyecto
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'cucuta', label: 'Cúcuta / N.D.S.', note: 'Residencial Top' },
                  { id: 'calima', label: 'Lago Calima', note: 'Villas Náuticas' },
                  { id: 'dapa', label: 'Dapa', note: 'Montaña & Vista' },
                  { id: 'cali_pance', label: 'Cali / Pance', note: 'Residencial Top' },
                  { id: 'rozo', label: 'Rozo / Cerrito', note: 'Grandes Lotes' },
                  { id: 'otra', label: 'Otra Región', note: 'A nivel nacional' },
                ].map((loc) => {
                  const active = locationZone === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setLocationZone(loc.id as LocationZone)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-[#9CD01A]/15 border-[#9CD01A] text-white shadow-[0_0_20px_rgba(156,208,26,0.25)]'
                          : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{loc.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{loc.note}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Nivel de Especificaciones & Acabados */}
            <div>
              <label className="text-xs font-bold tracking-wider text-white/50 uppercase block mb-3">
                4. Nivel de Acabados & Equipamiento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'contemporary',
                    title: 'Contemporary',
                    tag: '$3.8M/m²',
                    features: 'Concreto visto, ventanería hermética, carpintería arquitectónica en roble',
                  },
                  {
                    id: 'signature',
                    title: 'MASSA Signature',
                    tag: '$4.5M/m²',
                    features: 'Piscina infinity, domótica total Lutron, mármol italiano, doble altura',
                  },
                  {
                    id: 'masterpiece',
                    title: 'Masterpiece',
                    tag: '$5.4M/m²',
                    features: 'Spa turco integrado, energía solar total, espejo de agua, cava subterránea',
                  },
                ].map((tier) => {
                  const active = qualityTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setQualityTier(tier.id as QualityTier)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        active
                          ? 'bg-[#9CD01A]/15 border-[#9CD01A] text-white shadow-[0_0_25px_rgba(156,208,26,0.2)]'
                          : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-extrabold text-white">{tier.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${active ? 'bg-[#9CD01A] text-black font-bold' : 'bg-white/10 text-white/50'}`}>
                            {tier.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-snug mt-2">
                          {tier.features}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes de opciones adicionales */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-white/[0.08]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeLot}
                  onChange={(e) => setIncludeLot(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#9CD01A] accent-[#9CD01A] cursor-pointer"
                />
                <span className="text-xs font-semibold text-white/80 group-hover:text-white transition">
                  Incluir gestión y compra de lote / terreno
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={include360Tour}
                  onChange={(e) => setInclude360Tour(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#9CD01A] accent-[#9CD01A] cursor-pointer"
                />
                <span className="text-xs font-semibold text-white/80 group-hover:text-white transition">
                  Incluir Gemelo Digital 3D & Recorrido 360° en VR
                </span>
              </label>
            </div>

          </div>

          {/* COLUMNA 2: Dossier de Estimación en Tiempo Real (5 columnas) */}
          <div className="lg:col-span-5 sticky top-28 flex flex-col gap-4">
            <div className="bg-gradient-to-b from-[#18181B] to-[#0E0E10] border border-[#9CD01A]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(156,208,26,0.12)] relative overflow-hidden">
              
              {/* Badge Superior */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#9CD01A] uppercase px-3 py-1 rounded-full bg-[#9CD01A]/10 border border-[#9CD01A]/30">
                  ESTIMACIÓN DE INVERSIÓN LLAVE EN MANO
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-white/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9CD01A]" />
                  MASSA 2026
                </span>
              </div>

              {/* Título de la tipología elegida */}
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {getTypeName()}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  {areaSqM} m² • {getLocationName()} • {getTierName()}
                </p>
              </div>

              {/* Rango de Inversión Destacado */}
              <div className="p-5 rounded-2xl bg-[#09090B] border border-white/10 mb-6">
                <span className="text-[11px] font-bold tracking-wider text-white/40 uppercase block mb-1">
                  Inversión Proyectada Total (COP)
                </span>
                <div className="text-2xl sm:text-3xl md:text-3xl font-black text-[#9CD01A] tracking-tight font-mono">
                  {formatCOP(totalMinCOP)} - {formatCOP(totalMaxCOP)}
                </div>
                <div className="text-xs font-mono text-white/60 mt-1">
                  Aprox. {formatUSD(totalMinUSD)} - {formatUSD(totalMaxUSD)} USD
                </div>
                {includeLot && (
                  <div className="mt-2 text-[10px] font-semibold text-amber-400/90 flex items-center gap-1">
                    <span>* Incluye valor estimado del lote en {getLocationName()}</span>
                  </div>
                )}
              </div>

              {/* Desglose de Servicios Incluidos */}
              <div className="space-y-3 mb-6 text-xs text-white/80">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0 mt-0.5" />
                  <span><strong>Diseño Arquitectónico de Autor:</strong> Renders 4K, planos ejecutivos y volumetría 3D.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0 mt-0.5" />
                  <span><strong>Recorrido 360° Interactivo:</strong> Visualización previa fotorrealista para VR y móvil.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9CD01A] shrink-0 mt-0.5" />
                  <span><strong>Construcción Llave en Mano:</strong> Estructura, acabados de ultralujo y dirección de obra.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#9CD01A] shrink-0 mt-0.5" />
                  <span><strong>Tiempo Estimado:</strong> {estimatedMonths} desde licencia de construcción.</span>
                </div>
              </div>

              {/* CTA Botón Principal: WhatsApp Directo */}
              <button
                type="button"
                onClick={handleSendWhatsAppQuote}
                className="w-full py-4 px-6 rounded-2xl bg-[#9CD01A] hover:bg-[#aef01e] text-black font-black text-sm tracking-wide uppercase transition-all shadow-[0_10px_30px_rgba(156,208,26,0.4)] hover:shadow-[0_15px_40px_rgba(156,208,26,0.6)] flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-4 h-4 text-black" />
                <span>Enviar Cotización VIP por WhatsApp</span>
              </button>

              {onOpenConsultation && (
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
                  <span>Agendar Asesoría Presencial en Obra</span>
                </button>
              )}

              <p className="text-[10px] text-white/40 text-center mt-4 leading-normal">
                Valores referenciales calculados a costo de mercado 2026. La propuesta definitiva se elabora tras el estudio topográfico y requerimientos específicos del cliente.
              </p>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
