import { useState, useRef } from 'react';
import { 
  Project, 
  Room, 
  Hotspot, 
  ProjectRenderItem 
} from '../data/tourData';
import { 
  Building2, 
  Save, 
  ArrowLeft, 
  Rotate3d, 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Eye, 
  MapPin, 
  DollarSign,
  Upload,
  Compass,
  ExternalLink,
  X,
  Play
} from 'lucide-react';
import { saveProjectToSupabase, uploadImageToSupabase } from '../supabase';
import { TourContainer } from './TourContainer';
import { compressImage } from '../utils/imageCompressor';
import { EmptyState } from './ui/EmptyState';

interface AdminProjectEditorProps {
  initialProject: Project;
  onClose: () => void;
  onSave?: (savedProject: Project) => void;
  isNewProject?: boolean;
}

export function AdminProjectEditor({
  initialProject,
  onClose,
  onSave,
  isNewProject = false
}: AdminProjectEditorProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState<'commercial' | 'renders' | 'tour3d' | 'preview'>('commercial');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estado para probar el recorrido 3D en vivo
  const [isLive3DTesting, setIsLive3DTesting] = useState(false);
  const [testRoomId, setTestRoomId] = useState<string>(initialProject.initialRoomId || Object.keys(initialProject.rooms || {})[0] || '');

  // Render modal
  const [isAddRenderModalOpen, setIsAddRenderModalOpen] = useState(false);
  const [newRenderTitle, setNewRenderTitle] = useState('');
  const [newRenderCategory, setNewRenderCategory] = useState<'Fachada' | 'Interiores' | 'Zonas Comunes' | 'Planos'>('Fachada');
  const [newRenderUrl, setNewRenderUrl] = useState('');
  const [newRenderDesc, setNewRenderDesc] = useState('');
  const [selectedRenderFilter, setSelectedRenderFilter] = useState<string>('all');

  // Room modal
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomImageUrl, setNewRoomImageUrl] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialProject.initialRoomId || Object.keys(initialProject.rooms || {})[0] || ''
  );

  // Hotspot modal
  const [isAddHotspotModalOpen, setIsAddHotspotModalOpen] = useState(false);
  const [newHotspotTarget, setNewHotspotTarget] = useState('');
  const [newHotspotLabel, setNewHotspotLabel] = useState('');

  // Uploading flags
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper para actualizar campos raíz
  const updateField = (field: keyof Project, value: any) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  // Guardar proyecto en Supabase y LocalStorage
  const handleSave = async () => {
    try {
      setSavingState('saving');
      setStatusMessage('Guardando proyecto y sincronizando catálogo comercial...');

      // Guardar en Supabase
      try {
        await saveProjectToSupabase(project);
      } catch (sbErr) {
        console.warn("Supabase no disponible o error al guardar, respaldando en almacenamiento local:", sbErr);
      }

      // Guardar también en localStorage para persistencia instantánea y offline
      try {
        const stored = localStorage.getItem('massa_custom_projects');
        const customProjects = stored ? JSON.parse(stored) : {};
        customProjects[project.id] = project;
        localStorage.setItem('massa_custom_projects', JSON.stringify(customProjects));
      } catch (lsErr) {
        console.warn("Error guardando en localStorage:", lsErr);
      }

      if (onSave) {
        onSave(project);
      }

      setSavingState('saved');
      setStatusMessage('¡Proyecto y recorrido 3D guardados con éxito!');
      setTimeout(() => {
        setSavingState('idle');
        setStatusMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setSavingState('error');
      setStatusMessage(err.message || 'Error al guardar el proyecto.');
    }
  };

  // Subir portada del proyecto
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 2000, 1500);
      const path = `projects/${project.id}/hero_${Date.now()}.jpg`;
      const url = await uploadImageToSupabase(compressed, path);
      updateField('heroImage', url);
      updateField('thumbnail', url);
    } catch (err) {
      console.warn("Error subiendo a Supabase Storage, creando URL local:", err);
      const localUrl = URL.createObjectURL(file);
      updateField('heroImage', localUrl);
      updateField('thumbnail', localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  // Agregar Render
  const handleAddRender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRenderTitle.trim() || !newRenderUrl.trim()) return;

    const newRender: ProjectRenderItem = {
      id: `render_${Date.now()}`,
      title: newRenderTitle.trim(),
      category: newRenderCategory,
      storage_path: newRenderUrl.trim(),
      description: newRenderDesc.trim() || undefined,
      order_index: (project.renders?.length || 0) + 1
    };

    const updatedRenders = [...(project.renders || []), newRender];
    updateField('renders', updatedRenders);

    // Reset modal
    setNewRenderTitle('');
    setNewRenderUrl('');
    setNewRenderDesc('');
    setIsAddRenderModalOpen(false);
  };

  // Eliminar Render
  const handleDeleteRender = (renderId: string) => {
    const updated = (project.renders || []).filter((r) => r.id !== renderId);
    updateField('renders', updated);
  };

  // Agregar Ambiente 360
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const roomId = `room_${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      name: newRoomName.trim(),
      description: '',
      imageUrl: newRoomImageUrl.trim(),
      minimapPosition: { x: 50, y: 50 },
      hotspots: []
    };

    setProject((prev) => ({
      ...prev,
      rooms: {
        ...(prev.rooms || {}),
        [roomId]: newRoom
      },
      initialRoomId: prev.initialRoomId || roomId
    }));

    setSelectedRoomId(roomId);
    setNewRoomName('');
    setNewRoomImageUrl('');
    setIsAddRoomModalOpen(false);
  };

  // Eliminar Ambiente 360
  const handleDeleteRoom = (roomId: string) => {
    const roomsCopy = { ...(project.rooms || {}) };
    delete roomsCopy[roomId];
    const remainingKeys = Object.keys(roomsCopy);
    const newInitial = project.initialRoomId === roomId ? (remainingKeys[0] || '') : project.initialRoomId;

    setProject((prev) => ({
      ...prev,
      rooms: roomsCopy,
      initialRoomId: newInitial
    }));

    if (selectedRoomId === roomId) {
      setSelectedRoomId(remainingKeys[0] || '');
    }
  };

  // Agregar Hotspot a la habitación seleccionada
  const handleAddHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !newHotspotTarget) return;

    const room = project.rooms?.[selectedRoomId];
    if (!room) return;

    const newHotspot: Hotspot = {
      id: `h_${Date.now()}`,
      position: [10, 0, 5],
      targetRoom: newHotspotTarget,
      label: newHotspotLabel.trim() || `Ir a ${project.rooms?.[newHotspotTarget]?.name || 'Habitación'}`
    };

    const updatedRoom: Room = {
      ...room,
      hotspots: [...(room.hotspots || []), newHotspot]
    };

    setProject((prev) => ({
      ...prev,
      rooms: {
        ...(prev.rooms || {}),
        [selectedRoomId]: updatedRoom
      }
    }));

    setNewHotspotTarget('');
    setNewHotspotLabel('');
    setIsAddHotspotModalOpen(false);
  };

  // Eliminar Hotspot
  const handleDeleteHotspot = (roomId: string, hotspotId: string) => {
    const room = project.rooms?.[roomId];
    if (!room) return;

    const updatedRoom: Room = {
      ...room,
      hotspots: (room.hotspots || []).filter((h) => h.id !== hotspotId)
    };

    setProject((prev) => ({
      ...prev,
      rooms: {
        ...(prev.rooms || {}),
        [roomId]: updatedRoom
      }
    }));
  };

  // Agregar highlight de venta
  const [newHighlightText, setNewHighlightText] = useState('');
  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    updateField('highlights', [...(project.highlights || []), newHighlightText.trim()]);
    setNewHighlightText('');
  };

  const handleDeleteHighlight = (index: number) => {
    const filtered = (project.highlights || []).filter((_, i) => i !== index);
    updateField('highlights', filtered);
  };

  // Render activo
  const filteredRenders = (project.renders || []).filter((r) => {
    if (selectedRenderFilter === 'all') return true;
    return r.category === selectedRenderFilter;
  });

  const currentRoom = project.rooms?.[selectedRoomId];

  // Si está activo el modo prueba 3D en vivo
  if (isLive3DTesting) {
    const testRoom = (project.rooms && project.rooms[testRoomId]) || Object.values(project.rooms || {})[0];
    return (
      <div className="relative w-full h-screen bg-black">
        {/* Floating Controls to exit test mode */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLive3DTesting(false)}
            className="px-4 py-2.5 rounded-xl bg-black/80 hover:bg-[#9CD01A] text-white hover:text-black border border-white/20 text-xs font-bold transition flex items-center gap-2 shadow-2xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Salir del Modo de Prueba 3D</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-[#9CD01A]/20 border border-[#9CD01A]/40 text-[#9CD01A] text-xs font-mono font-bold">
            PROBANDO RECORRIDO EN VIVO: {project.name}
          </div>
        </div>

        <TourContainer
          currentRoom={testRoom}
          rooms={project.rooms || {}}
          minimapImage={project.minimapImage || ''}
          onNavigate={(roomId) => setTestRoomId(roomId)}
          onBackToHome={() => setIsLive3DTesting(false)}
          tourEmbedUrl={project.tourType === 'matterport_iframe' ? project.tourEmbedUrl : undefined}
          projectName={project.name}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#090A0D] text-white font-sans selection:bg-[#9CD01A] selection:text-[#090A0D] flex flex-col">
      
      {/* 1. TOPBAR DEL EDITOR EJECUTIVO */}
      <header className="sticky top-0 z-30 w-full bg-[#0D0D11]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Izquierda: Volver & Nombre del Proyecto */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer shrink-0"
            title="Volver a lista de proyectos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9CD01A] shadow-[0_0_8px_#9CD01A]" />
              <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                {isNewProject ? 'CREANDO NUEVO PROYECTO' : 'EDITOR COMERCIAL & 3D MASSA'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
              {project.name || 'Nuevo Proyecto en Venta'}
            </h1>
          </div>
        </div>

        {/* Pestañas Superiores de Edición */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
          {[
            { id: 'commercial', label: '1. Ficha Comercial', icon: Building2 },
            { id: 'renders', label: '2. Renders & Secciones', icon: Camera },
            { id: 'tour3d', label: '3. Recorrido 3D', icon: Rotate3d },
            { id: 'preview', label: '4. Vista Previa', icon: Eye },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-[#9CD01A] text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Derecha: Botón Probar 3D & Guardar */}
        <div className="flex items-center gap-2">
          {/* Botón Probar Recorrido 3D en Vivo */}
          <button
            type="button"
            onClick={() => setIsLive3DTesting(true)}
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#9CD01A] text-white hover:text-black border border-white/15 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Probar rotación y navegación 3D en tiempo real"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Probar Recorrido 3D</span>
            <span className="sm:hidden">Probar 3D</span>
          </button>

          {/* Botón Guardar Cambios */}
          <button
            type="button"
            onClick={handleSave}
            disabled={savingState === 'saving'}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black text-xs font-black tracking-wider uppercase transition shadow-[0_0_20px_rgba(156,208,26,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-black" />
            <span>
              {savingState === 'saving'
                ? 'Guardando...'
                : savingState === 'saved'
                ? '¡Guardado!'
                : 'Guardar'}
            </span>
          </button>
        </div>

      </header>

      {/* Pestañas en Móvil */}
      <div className="md:hidden flex items-center gap-1 p-2 bg-[#0D0D11] border-b border-white/10 overflow-x-auto">
        {[
          { id: 'commercial', label: 'Comercial', icon: Building2 },
          { id: 'renders', label: 'Renders', icon: Camera },
          { id: 'tour3d', label: 'Tour 3D', icon: Rotate3d },
          { id: 'preview', label: 'Vista Previa', icon: Eye },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                active ? 'bg-[#9CD01A] text-black' : 'text-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mensaje de Estado / Feedback */}
      {statusMessage && (
        <div className={`w-full py-2 px-4 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 ${
          savingState === 'saved' ? 'bg-[#9CD01A]/20 text-[#9CD01A]' : savingState === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'
        }`}>
          {savingState === 'saved' && <Check className="w-4 h-4 text-[#9CD01A]" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ========================================================== */}
        {/* TAB 1: FICHA COMERCIAL & DATOS PRINCIPALES                 */}
        {/* ========================================================== */}
        {activeTab === 'commercial' && (
          <div className="space-y-8">
            
            {/* Banner de Información */}
            <div className="p-4 sm:p-6 rounded-3xl bg-[#131317] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                  INFORMACIÓN PÚBLICA VISIBLE POR EL COMPRADOR
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Ficha Descriptiva & Argumento de Venta
                </h2>
                <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
                  Todos los campos editados aquí se reflejan de inmediato en la tarjeta del catálogo comercial, en el buscador y en la presentación pública del proyecto.
                </p>
              </div>

              {/* Toggle de Destacado */}
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:border-[#9CD01A]/50 transition">
                <input
                  type="checkbox"
                  checked={!!project.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-4 h-4 rounded text-[#9CD01A] focus:ring-[#9CD01A] accent-[#9CD01A]"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#9CD01A]" />
                    <span>Destacar en Portada</span>
                  </div>
                  <div className="text-[10px] text-white/50">Mostrar en el carrusel principal</div>
                </div>
              </label>
            </div>

            {/* Grid de Formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Columna Izquierda (8 cols): Datos descriptivos */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Nombre y Eslogan */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A] flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Identidad del Proyecto</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Nombre del Proyecto
                      </label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Ej: RESIDENCIA JEJÉN"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm font-bold focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Categoría / Tipología
                      </label>
                      <select
                        value={project.category || 'villa'}
                        onChange={(e) => {
                          const cat = e.target.value;
                          updateField('category', cat);
                          const labels: Record<string, string> = {
                            villa: 'Villa Campestre',
                            urbana: 'Residencia Urbana',
                            penthouse: 'Penthouse Dúplex',
                            corporativo: 'Sede Corporativa'
                          };
                          updateField('categoryLabel', labels[cat] || 'Residencia de Autor');
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-[#18181D] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      >
                        <option value="villa">Villa Campestre</option>
                        <option value="urbana">Residencia Urbana</option>
                        <option value="penthouse">Penthouse Dúplex</option>
                        <option value="corporativo">Sede Corporativa</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                      Eslogan Comercial / Tagline
                    </label>
                    <input
                      type="text"
                      value={project.tagline || ''}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      placeholder="Ej: Residencia campestre de ultralujo con muelle privado y vista infinita"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                      Memoria Descriptiva Completa
                    </label>
                    <textarea
                      rows={4}
                      value={project.description || ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe la composición volumétrica, la integración con el entorno y los acabados nobles..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9CD01A] transition resize-y"
                    />
                  </div>
                </div>

                {/* Precios & Estado de Venta */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Inversión & Estado de Comercialización</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Precio en COP
                      </label>
                      <input
                        type="text"
                        value={project.priceCOP || ''}
                        onChange={(e) => updateField('priceCOP', e.target.value)}
                        placeholder="Ej: $1.850.000.000 COP"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Precio Referencial USD
                      </label>
                      <input
                        type="text"
                        value={project.priceUSD || ''}
                        onChange={(e) => updateField('priceUSD', e.target.value)}
                        placeholder="Ej: ~$460.000 USD"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Estado de Comercialización
                      </label>
                      <select
                        value={project.status || 'disponible'}
                        onChange={(e) => {
                          const status = e.target.value;
                          updateField('status', status);
                          const labels: Record<string, string> = {
                            disponible: 'Disponible para Construcción',
                            preventa: 'Preventa de Autor',
                            en_obra: 'En Ejecución • Obra Activa',
                            entregado: 'Obra Entregada',
                            vendido: '100% Vendido'
                          };
                          updateField('statusLabel', labels[status] || 'Disponible');
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-[#18181D] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      >
                        <option value="disponible">Disponible para Construcción</option>
                        <option value="preventa">Preventa de Autor</option>
                        <option value="en_obra">En Obra / Ejecución</option>
                        <option value="entregado">Obra Entregada</option>
                        <option value="vendido">Vendido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Texto de Estado Personalizado
                      </label>
                      <input
                        type="text"
                        value={project.statusLabel || ''}
                        onChange={(e) => updateField('statusLabel', e.target.value)}
                        placeholder="Ej: En Obra • 92% Avance"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación & Dimensiones */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Ubicación & Dimensiones Arquitectónicas</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={project.location || ''}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="Ej: Lago Calima, Valle del Cauca"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                        Zona Específica
                      </label>
                      <input
                        type="text"
                        value={project.zone || ''}
                        onChange={(e) => updateField('zone', e.target.value)}
                        placeholder="Ej: Calima VIP / Dapa Montaña"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-[#9CD01A] transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                        Área Construida
                      </label>
                      <input
                        type="text"
                        value={project.areaBuilt || ''}
                        onChange={(e) => updateField('areaBuilt', e.target.value)}
                        placeholder="480 m²"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                        Área de Lote
                      </label>
                      <input
                        type="text"
                        value={project.areaLot || ''}
                        onChange={(e) => updateField('areaLot', e.target.value)}
                        placeholder="1.850 m²"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                        Habitaciones
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={project.bedrooms ?? 4}
                        onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:border-[#9CD01A] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                        Baños
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={project.bathrooms ?? 5}
                        onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-mono focus:border-[#9CD01A] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Highlights / Puntos Fuertes de Venta */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Puntos Fuertes & Amenidades de Ultralujo</span>
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHighlightText}
                      onChange={(e) => setNewHighlightText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                      placeholder="Ej: Piscina infinity climatizada con muelle privado..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9CD01A] transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-4 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-bold text-xs transition cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(project.highlights || []).map((h, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/90"
                      >
                        <div className="flex items-center gap-2.5">
                          <Check className="w-3.5 h-3.5 text-[#9CD01A] shrink-0" />
                          <span>{h}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteHighlight(index)}
                          className="text-white/40 hover:text-red-400 p-1 transition cursor-pointer"
                          title="Eliminar punto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Columna Derecha (4 cols): Portada Hero & Previsualización */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Imagen de Portada Hero */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A] flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Portada Principal (Hero)</span>
                  </h3>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl group">
                    <img
                      src={project.heroImage || project.thumbnail || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                      alt="Portada del Proyecto"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div className="text-xs font-bold text-white">Vista Previa de Tarjeta</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                      URL de Imagen de Portada
                    </label>
                    <input
                      type="url"
                      value={project.heroImage || ''}
                      onChange={(e) => {
                        updateField('heroImage', e.target.value);
                        updateField('thumbnail', e.target.value);
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:border-[#9CD01A] transition"
                    />
                  </div>

                  {/* Subir archivo */}
                  <div className="pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleHeroUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white/90 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#9CD01A]" />
                      <span>{isUploading ? 'Subiendo...' : 'Subir Archivo de Portada'}</span>
                    </button>
                  </div>
                </div>

                {/* Resumen de Estado */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#9CD01A] font-bold">
                    ESTADO DE INTEGRACIÓN
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-white/60">Recorrido 3D:</span>
                      <span className={`font-bold font-mono ${project.hasTour360 ? 'text-[#9CD01A]' : 'text-white/40'}`}>
                        {project.hasTour360 ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-white/60">Ambientes 360°:</span>
                      <span className="font-bold font-mono text-white">
                        {Object.keys(project.rooms || {}).length} espacios
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="text-white/60">Renders en Galería:</span>
                      <span className="font-bold font-mono text-white">
                        {project.renders?.length || 0} imágenes
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: RENDERS Y SECCIONES DEL LUGAR                       */}
        {/* ========================================================== */}
        {activeTab === 'renders' && (
          <div className="space-y-6">
            
            {/* Cabecera & Filtros de Renders */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#131317] border border-white/10">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                  SECCIONES & GALERÍA VISUAL DEL LUGAR
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Renders Fotorrealistas por Sección
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Organiza las tomas de Fachada, Interiores, Zonas Comunes y Planos que explorará el visitante.
                </p>
              </div>

              {/* Botón Agregar Render */}
              <button
                type="button"
                onClick={() => setIsAddRenderModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-extrabold text-xs tracking-wider uppercase transition shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Agregar Render</span>
              </button>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'Todas las Secciones' },
                { id: 'Fachada', label: 'Fachada & Exteriores' },
                { id: 'Interiores', label: 'Interiores & Estancias' },
                { id: 'Zonas Comunes', label: 'Zonas Comunes & Spa' },
                { id: 'Planos', label: 'Planos & Distribución' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedRenderFilter(filter.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedRenderFilter === filter.id
                      ? 'bg-[#9CD01A] text-black shadow-md'
                      : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Grid de Renders */}
            {filteredRenders.length === 0 ? (
              <EmptyState
                variant="renders"
                title={selectedRenderFilter === 'all' ? 'No hay renders cargados' : `Sin renders en ${selectedRenderFilter}`}
                description="Haz clic en '+ Agregar Render' para subir fotografías arquitectónicas o renders fotorrealistas organizados por sección."
                badge={selectedRenderFilter === 'all' ? 'GALERÍA DE LA RESIDENCIA' : `SECCIÓN ${selectedRenderFilter.toUpperCase()}`}
                primaryAction={{
                  label: '+ Agregar Primer Render',
                  onClick: () => setIsAddRenderModalOpen(true),
                }}
                secondaryAction={
                  selectedRenderFilter !== 'all'
                    ? {
                        label: 'Ver Todas las Secciones',
                        onClick: () => setSelectedRenderFilter('all'),
                      }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRenders.map((render) => (
                  <div
                    key={render.id}
                    className="group rounded-3xl bg-[#131317] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#9CD01A]/60 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(156,208,26,0.15)] hover:-translate-y-1 shadow-xl"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-black overflow-hidden">
                        <img
                          src={render.storage_path}
                          alt={render.title}
                          className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-[#9CD01A] border border-[#9CD01A]/30 uppercase">
                            {render.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h4 className="text-base font-bold text-white">{render.title}</h4>
                        {render.description && (
                          <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">
                            {render.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteRender(render.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/20 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: CONFIGURACIÓN RECORRIDO 3D / 360°                   */}
        {/* ========================================================== */}
        {activeTab === 'tour3d' && (
          <div className="space-y-8">
            
            {/* Header del Tour 3D */}
            <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                  EXPERIENCIA INMERSIVA 360° / GEMELO DIGITAL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Configuración del Recorrido 3D
                </h2>
                <p className="text-xs text-white/60 mt-1 max-w-2xl">
                  Garantiza que el visitante pueda caminar de forma inmersiva por cada ambiente del proyecto en venta.
                </p>
              </div>

              {/* Botón Probar 3D Gigante */}
              <button
                type="button"
                onClick={() => setIsLive3DTesting(true)}
                className="px-6 py-3.5 rounded-2xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-black text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(156,208,26,0.4)] flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Probar Recorrido 3D en Vivo</span>
              </button>
            </div>

            {/* Activar / Desactivar Tour 3D */}
            <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Activar Recorrido 3D en la Ficha Pública</h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Muestra el botón "Tour 360°" y habilita la visualización inmersiva para los compradores.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!project.hasTour360}
                  onChange={(e) => updateField('hasTour360', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#9CD01A] peer-checked:after:bg-black" />
              </label>
            </div>

            {/* Selector de Modo 3D */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Modo 1: 360 Esférico Nativo MASSA */}
              <div
                onClick={() => updateField('tourType', '360_spheres')}
                className={`p-6 rounded-3xl border transition cursor-pointer ${
                  project.tourType !== 'matterport_iframe'
                    ? 'bg-[#18181E] border-[#9CD01A] shadow-[0_0_30px_rgba(156,208,26,0.15)]'
                    : 'bg-[#131317] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#9CD01A]/10 border border-[#9CD01A]/30 flex items-center justify-center text-[#9CD01A]">
                    <Rotate3d className="w-5 h-5" />
                  </div>
                  {project.tourType !== 'matterport_iframe' && (
                    <span className="text-[10px] font-mono font-bold text-[#9CD01A] uppercase tracking-wider">
                      SELECCIONADO
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">Recorrido 360° Esférico Nativo MASSA</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Motor Three.js propio con navegación punto a punto entre habitaciones, minimapa 2D interactivo y texturas panorámicas HD.
                </p>
              </div>

              {/* Modo 2: Recorrido 3D Externo (Matterport / Spline) */}
              <div
                onClick={() => updateField('tourType', 'matterport_iframe')}
                className={`p-6 rounded-3xl border transition cursor-pointer ${
                  project.tourType === 'matterport_iframe'
                    ? 'bg-[#18181E] border-[#9CD01A] shadow-[0_0_30px_rgba(156,208,26,0.15)]'
                    : 'bg-[#131317] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  {project.tourType === 'matterport_iframe' && (
                    <span className="text-[10px] font-mono font-bold text-[#9CD01A] uppercase tracking-wider">
                      SELECCIONADO
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">Recorrido 3D Externo / Iframe (Matterport)</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Incrustar un gemelo digital escaneado con Matterport, Kuula, Spline 3D o visor webgl externo a través de URL.
                </p>
              </div>

            </div>

            {/* Configuración según el modo seleccionado */}
            {project.tourType === 'matterport_iframe' ? (
              <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A]">
                  URL del Iframe o Recorrido 3D Externo
                </h3>
                <p className="text-xs text-white/60">
                  Ingresa la URL pública de tu modelo en Matterport o Spline (ej: https://my.matterport.com/show/?m=...).
                </p>
                <input
                  type="url"
                  value={project.tourEmbedUrl || ''}
                  onChange={(e) => updateField('tourEmbedUrl', e.target.value)}
                  placeholder="https://my.matterport.com/show/?m=..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#9CD01A] transition"
                />
              </div>
            ) : (
              /* Configuración de Habitaciones y Hotspots 360 */
              <div className="space-y-6">
                
                {/* Lista de Ambientes 360 */}
                <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CD01A]">
                        Ambientes / Habitaciones del Recorrido 360°
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        Define los puntos fotográficos donde el usuario podrá pararse a mirar en 360 grados.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddRoomModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Nuevo Ambiente</span>
                    </button>
                  </div>

                  {/* Selector horizontal de habitaciones o estado vacío */}
                  {Object.values(project.rooms || {}).length === 0 ? (
                    <EmptyState
                      variant="rooms"
                      title="Sin ambientes 360° definidos"
                      description="Agrega el primer espacio inmersivo (ej: Sala Principal, Master Suite, Terraza) para comenzar a configurar el recorrido."
                      badge="RECORRIDO EN BLANCO"
                      compact={true}
                      primaryAction={{
                        label: '+ Crear Primer Ambiente',
                        onClick: () => setIsAddRoomModalOpen(true),
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.values(project.rooms || {}).map((room) => {
                        const isSelected = selectedRoomId === room.id;
                        const isInitial = project.initialRoomId === room.id;
                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-1 ${
                              isSelected
                                ? 'bg-[#1A1A22] border-[#9CD01A] shadow-[0_10px_30px_rgba(156,208,26,0.15)] ring-1 ring-[#9CD01A]/30'
                                : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-white truncate">{room.name}</span>
                                {isInitial && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#9CD01A]/20 text-[#9CD01A] text-[9px] font-mono font-bold">
                                    INICIAL
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-white/50">
                                {(room.hotspots || []).length} conexiones / hotspots
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateField('initialRoomId', room.id);
                                }}
                                className="text-[10px] text-white/50 hover:text-[#9CD01A] transition cursor-pointer"
                              >
                                Fijar como Inicial
                              </button>

                              {Object.keys(project.rooms || {}).length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRoom(room.id);
                                  }}
                                  className="text-white/40 hover:text-red-400 p-1 transition cursor-pointer"
                                  title="Eliminar habitación"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Editor del Ambiente Seleccionado */}
                {currentRoom && (
                  <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                          EDITANDO AMBIENTE
                        </span>
                        <h4 className="text-lg font-bold text-white mt-0.5">{currentRoom.name}</h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTestRoomId(currentRoom.id);
                          setIsLive3DTesting(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-[#9CD01A] text-white hover:text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ver este ambiente en 360°</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                          Nombre del Ambiente
                        </label>
                        <input
                          type="text"
                          value={currentRoom.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProject((prev) => ({
                              ...prev,
                              rooms: {
                                ...(prev.rooms || {}),
                                [currentRoom.id]: { ...currentRoom, name: val }
                              }
                            }));
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:border-[#9CD01A] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-white/70 mb-1 font-semibold">
                          URL de Imagen Panorámica 360°
                        </label>
                        <input
                          type="text"
                          value={currentRoom.imageUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProject((prev) => ({
                              ...prev,
                              rooms: {
                                ...(prev.rooms || {}),
                                [currentRoom.id]: { ...currentRoom, imageUrl: val }
                              }
                            }));
                          }}
                          placeholder="https://... o dejar vacío para panorama arquitectónico generado"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:border-[#9CD01A] transition"
                        />
                      </div>
                    </div>

                    {/* Hotspots del Ambiente */}
                    <div className="pt-2 border-t border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            Puntos de Conexión (Hotspots de Navegación)
                          </h5>
                          <p className="text-[11px] text-white/50">
                            Puntos interactivos que el usuario toca para trasladarse a otro ambiente.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddHotspotModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#9CD01A] text-white hover:text-black text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Agregar Conexión</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(currentRoom.hotspots || []).length === 0 ? (
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-between text-xs text-white/50">
                            <div className="flex items-center gap-2.5">
                              <Compass className="w-4 h-4 text-[#9CD01A]/60" />
                              <span>No hay puntos de conexión (hotspots) definidos en esta estancia.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsAddHotspotModalOpen(true)}
                              className="text-xs text-[#9CD01A] font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>+ Añadir Punto</span>
                            </button>
                          </div>
                        ) : (
                          (currentRoom.hotspots || []).map((h) => {
                            const targetRoomName = project.rooms?.[h.targetRoom]?.name || h.targetRoom;
                            return (
                              <div
                                key={h.id}
                                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#9CD01A]/40 text-xs text-white/90 transition-all duration-200 group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Compass className="w-4 h-4 text-[#9CD01A] group-hover:rotate-45 transition-transform" />
                                  <span className="font-bold">{h.label}</span>
                                  <span className="text-white/40 font-mono text-[11px]">→ Destino: {targetRoomName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHotspot(currentRoom.id, h.id)}
                                  className="text-white/40 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-lg transition cursor-pointer"
                                  title="Eliminar hotspot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: VISTA PREVIA PÚBLICA ("EDITOR DE LA OTRA PANTALLA") */}
        {/* ========================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            <div className="p-6 rounded-3xl bg-[#131317] border border-white/10 text-center">
              <span className="text-[10px] font-mono tracking-widest text-[#9CD01A] uppercase font-bold">
                ASÍ SE VE EN LA PANTALLA PRINCIPAL DEL COMPRADOR
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Previsualización en Vivo de la Tarjeta
              </h2>
            </div>

            {/* Tarjeta de Catálogo tal como se renderiza en VipCommercialLanding */}
            <div className="max-w-md mx-auto bg-[#121215] border border-[#9CD01A]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={project.heroImage || project.thumbnail || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/40" />

                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                        {project.categoryLabel || 'Villa Campestre'}
                      </span>
                      {project.hasTour360 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#9CD01A] text-black font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                          <Rotate3d className="w-3 h-3 text-black" />
                          Tour 360°
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#161618]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#9CD01A] border border-[#9CD01A]/30 shrink-0">
                      {project.statusLabel || 'Disponible'}
                    </span>
                  </div>

                  {/* Título */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-white/70 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#9CD01A]" />
                      <span>{project.location || 'Valle del Cauca'}</span>
                    </div>
                  </div>
                </div>

                {/* Detalles de la tarjeta */}
                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                    {project.tagline || project.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.08] text-center">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase font-semibold">Área</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">{project.areaBuilt || '450 m²'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase font-semibold">Habitaciones</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">{project.bedrooms ?? 4} Hab.</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase font-semibold">Baños</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5">{project.bathrooms ?? 5} Baños</div>
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-white/50 uppercase">Precio Estimado</div>
                      <div className="text-lg font-black text-[#9CD01A] font-mono tracking-tight">
                        {project.priceCOP || '$1.850M COP'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/40">Referencial</div>
                      <div className="text-xs font-mono text-white/60">{project.priceUSD || '~$460.000 USD'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================== */}
      {/* MODAL: AGREGAR RENDER                                      */}
      {/* ========================================================== */}
      {isAddRenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#131317] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsAddRenderModalOpen(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Agregar Nuevo Render</h3>
            <p className="text-xs text-white/50 mb-4">
              Sube una imagen o pega la URL del render para incluirlo en la galería pública.
            </p>

            <form onSubmit={handleAddRender} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Título del Render</label>
                <input
                  type="text"
                  required
                  value={newRenderTitle}
                  onChange={(e) => setNewRenderTitle(e.target.value)}
                  placeholder="Ej: Fachada Principal al Atardecer"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Sección del Lugar</label>
                <select
                  value={newRenderCategory}
                  onChange={(e) => setNewRenderCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#18181D] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                >
                  <option value="Fachada">Fachada & Exteriores</option>
                  <option value="Interiores">Interiores & Estancias</option>
                  <option value="Zonas Comunes">Zonas Comunes & Spa</option>
                  <option value="Planos">Planos & Distribución</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">URL de la Imagen</label>
                <input
                  type="url"
                  required
                  value={newRenderUrl}
                  onChange={(e) => setNewRenderUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:border-[#9CD01A] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Descripción Breve (Opcional)</label>
                <input
                  type="text"
                  value={newRenderDesc}
                  onChange={(e) => setNewRenderDesc(e.target.value)}
                  placeholder="Ej: Iluminación crepuscular y voladizos en concreto pulido"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRenderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black text-xs font-bold transition"
                >
                  Agregar a la Galería
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: AGREGAR AMBIENTE 360                                */}
      {/* ========================================================== */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#131317] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsAddRoomModalOpen(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Nuevo Ambiente 360°</h3>
            <p className="text-xs text-white/50 mb-4">
              Crea un nuevo punto de vista panorámico para el recorrido virtual.
            </p>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Nombre del Ambiente</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Ej: Terraza & Piscina Infinity"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                  URL de Imagen Panorámica 360° (Opcional)
                </label>
                <input
                  type="text"
                  value={newRoomImageUrl}
                  onChange={(e) => setNewRoomImageUrl(e.target.value)}
                  placeholder="Dejar en blanco para generar panorama arquitectónico MASSA"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-mono focus:border-[#9CD01A] transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black text-xs font-bold transition"
                >
                  Crear Ambiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: AGREGAR HOTSPOT                                     */}
      {/* ========================================================== */}
      {isAddHotspotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#131317] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsAddHotspotModalOpen(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Nueva Conexión de Navegación</h3>
            <p className="text-xs text-white/50 mb-4">
              Enlaza este ambiente con otra habitación del proyecto.
            </p>

            <form onSubmit={handleAddHotspot} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Habitación de Destino</label>
                <select
                  required
                  value={newHotspotTarget}
                  onChange={(e) => {
                    const target = e.target.value;
                    setNewHotspotTarget(target);
                    const targetName = project.rooms?.[target]?.name;
                    if (targetName) setNewHotspotLabel(`Ir a ${targetName}`);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#18181D] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                >
                  <option value="">Selecciona destino...</option>
                  {Object.values(project.rooms || {})
                    .filter((r) => r.id !== selectedRoomId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/70 mb-1">Etiqueta del Hotspot</label>
                <input
                  type="text"
                  required
                  value={newHotspotLabel}
                  onChange={(e) => setNewHotspotLabel(e.target.value)}
                  placeholder="Ej: Ir al Baño Turco"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:border-[#9CD01A] transition"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHotspotModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newHotspotTarget}
                  className="flex-1 py-2.5 rounded-xl bg-[#9CD01A] hover:bg-[#b0eb1e] text-black text-xs font-bold transition disabled:opacity-40"
                >
                  Crear Hotspot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
