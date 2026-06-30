import { useState, useRef } from 'react';
import { Project, Room, Hotspot } from '../data/tourData';
import { Settings, Save, Plus, ChevronLeft, Upload, Trash2 } from 'lucide-react';
import { saveProjectToSupabase, uploadImageToSupabase } from '../supabase';
import { HotspotEditor3D } from './HotspotEditor3D';
import { compressImage } from '../utils/imageCompressor';
import { Modal } from './Modal';

interface ConfiguratorProps {
  initialProject: Project;
  onClose: () => void;
  onSave?: (project: Project) => void;
}

export function ProjectConfigurator({ initialProject, onClose, onSave }: ConfiguratorProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialProject.initialRoomId);
  const [activeTab, setActiveTab] = useState<'settings' | '360' | 'map'>('settings');
  const [copied, setCopied] = useState(false);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal States
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const [hotspotModal, setHotspotModal] = useState<{
    isOpen: boolean;
    position: [number, number, number] | null;
    targetRoomId: string;
    label: string;
  }>({ isOpen: false, position: null, targetRoomId: '', label: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const minimapInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToSupabase = async () => {
    try {
      setSavingState('saving');

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tiempo de espera agotado al conectar con Supabase (límite 15s)")), 15000)
      );

      await Promise.race([
        saveProjectToSupabase(project),
        timeoutPromise
      ]);

      if (onSave) onSave(project);
      
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 3000);
    } catch (err: any) {
      console.error("Error al guardar en Supabase:", err);
      setSavingState('error');
    }
  };

  const generateId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000);

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    const id = generateId(newRoomName);
    setProject(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [id]: {
          id,
          name: newRoomName.trim(),
          description: '',
          imageUrl: '',
          minimapPosition: { x: 50, y: 50 },
          hotspots: []
        }
      }
    }));
    setSelectedRoomId(id);
    setIsAddRoomModalOpen(false);
    setNewRoomName('');
  };

  const handleDeleteRoom = (roomId: string) => {
    if (Object.keys(project.rooms).length <= 1) {
      alert("No puedes eliminar la única habitación del proyecto.");
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta habitación y todos sus puntos de navegación?')) {
      setProject(prev => {
        const newRooms = { ...prev.rooms };
        delete newRooms[roomId];
        return { ...prev, rooms: newRooms };
      });
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null); // Deselecciona la habitación eliminada
      }
    }
  };

  const handleUpdateRoom = (roomId: string, field: keyof Room, value: any) => {
    setProject(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomId]: {
          ...prev.rooms[roomId],
          [field]: value
        }
      }
    }));
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedRoomId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    handleUpdateRoom(selectedRoomId, 'minimapPosition', { x, y });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploadType: 'minimap' | 'room' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // --- AUTOCRECOMPRESIÓN DE IMÁGENES ---
      // Si la imagen es muy pesada, la convierte a JPG y reduce su tamaño para WebGL
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try {
          // Para recorridos 360 (room), el estándar seguro para móviles es 4K (4096x2048).
          // Para minimapas o miniaturas, basta con 1024px.
          const maxWidth = uploadType === 'room' ? 4096 : 1024;
          const maxHeight = uploadType === 'room' ? 2048 : 1024;
          fileToUpload = await compressImage(file, maxWidth, maxHeight);
        } catch (e) {
          console.warn("No se pudo comprimir la imagen, subiendo original", e);
        }
      }

      // Limpiamos el nombre del archivo para quitar espacios, tildes y caracteres especiales (ñ, etc)
      const sanitizedName = fileToUpload.name
        .normalize("NFD") // Descompone caracteres como 'ñ' o 'á'
        .replace(/[\u0300-\u036f]/g, "") // Remueve las tildes/acentos
        .replace(/[^a-zA-Z0-9.-]/g, "_"); // Reemplaza espacios y otros símbolos por guión bajo

      const prefix = uploadType === 'minimap' ? 'minimap' : uploadType === 'thumbnail' ? 'thumbnail' : selectedRoomId;
      const path = `projects/${project.id}/${prefix}-${sanitizedName}`;
      const url = await uploadImageToSupabase(fileToUpload, path);
      
      if (uploadType === 'minimap') {
        setProject(prev => ({ ...prev, minimapImage: url }));
      } else if (uploadType === 'thumbnail') {
        setProject(prev => ({ ...prev, thumbnail: url }));
      } else if (uploadType === 'room' && selectedRoomId) {
        handleUpdateRoom(selectedRoomId, 'imageUrl', url);
      }
    } catch (err: any) {
      alert("Error detallado de Supabase: " + (err.message || err) + "\n\nRevisa la consola (F12) para más detalles.");
      console.error(err);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddHotspotClick = (position: [number, number, number]) => {
    if (!selectedRoomId) return;
    
    // Predeterminar a la primera habitación disponible
    const otherRooms = Object.values(project.rooms).filter(r => r.id !== selectedRoomId);
    const initialTarget = otherRooms.length > 0 ? otherRooms[0].id : '';

    setHotspotModal({
      isOpen: true,
      position,
      targetRoomId: initialTarget,
      label: ''
    });
  };

  const handleAddHotspotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !hotspotModal.position || !hotspotModal.targetRoomId) return;
    
    const newHotspot: Hotspot = {
      id: 'h_' + Math.random().toString(36).substring(2, 9),
      position: hotspotModal.position,
      targetRoom: hotspotModal.targetRoomId,
      label: hotspotModal.label.trim()
    };

    setProject(prev => {
      const room = prev.rooms[selectedRoomId];
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [selectedRoomId]: {
            ...room,
            hotspots: [...room.hotspots, newHotspot]
          }
        }
      };
    });

    setHotspotModal({ isOpen: false, position: null, targetRoomId: '', label: '' });
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (!selectedRoomId) return;
    setProject(prev => {
      const room = prev.rooms[selectedRoomId];
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [selectedRoomId]: {
            ...room,
            hotspots: room.hotspots.filter(h => h.id !== hotspotId)
          }
        }
      };
    });
  };

  const handleExport = () => {
    const codeString = `
export const projectsData: Record<string, Project> = {
  '${project.id}': ${JSON.stringify(project, null, 2).replace(/"([^(")"]+)":/g, "$1:")}
};
`;
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-lime-400">
            <Settings className="w-5 h-5" />
            <h1 className="font-semibold tracking-wide">Configurador: {project.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveToSupabase}
            disabled={savingState === 'saving'}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all text-sm ${
              savingState === 'saving' ? 'bg-zinc-855/50 text-white/50 cursor-not-allowed border border-white/10' :
              savingState === 'saved' ? 'bg-green-500 text-white' :
              savingState === 'error' ? 'bg-red-500 text-white hover:bg-red-600' :
              'bg-lime-500 text-black hover:bg-lime-400'
            }`}
          >
            {savingState === 'saving' ? 'Guardando...' :
             savingState === 'saved' ? '¡Sincronizado!' :
             savingState === 'error' ? 'Reintentar Guardado' :
             'Guardar en Nube'}
          </button>

          <button 
            onClick={handleExport}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 ${
              copied ? 'text-green-400 border-green-500/30' : ''
            }`}
          >
            <Save className="w-4 h-4" />
            {copied ? '¡Copiado!' : 'Exportar Código'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Rooms List & Details */}
        <div className="w-[400px] border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto bg-black/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Habitaciones</h2>
            <button onClick={() => setIsAddRoomModalOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-lime-400 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {Object.values(project.rooms).map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedRoomId === room.id 
                    ? 'bg-lime-500/10 border-lime-500/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <h3 className="font-medium">{room.name}</h3>
              </button>
            ))}
          </div>

          {/* Active Room Editor */}
          {selectedRoomId && project.rooms[selectedRoomId] && (
            <div className="mt-2 p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-4 relative">
              <button
                onClick={() => handleDeleteRoom(selectedRoomId)}
                title="Eliminar esta habitación"
                className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Nombre a mostrar</label>
                <input 
                  type="text" 
                  value={project.rooms[selectedRoomId].name}
                  onChange={(e) => handleUpdateRoom(selectedRoomId, 'name', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Imagen 360</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'room')} />
                
                {project.rooms[selectedRoomId].imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video group">
                    <img src={project.rooms[selectedRoomId].imageUrl} alt="360 preview" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-lime-400 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> Cambiar Imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">{uploadingImage ? 'Subiendo...' : 'Subir Imagen 360'}</span>
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 mt-4 text-white/70 border-b border-white/10 pb-1">Puntos de Navegación (Hotspots)</h4>
                {project.rooms[selectedRoomId].hotspots.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No hay puntos. Usa la Vista 360 para añadirlos.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {project.rooms[selectedRoomId].hotspots.map(hotspot => {
                      const targetRoomName = project.rooms[hotspot.targetRoom]?.name || hotspot.targetRoom;
                      return (
                        <li key={hotspot.id} className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                          <span className="text-xs text-white/80">{hotspot.label || 'Sin texto'} → <span className="font-medium text-lime-400">{targetRoomName}</span></span>
                          <button onClick={() => handleDeleteHotspot(hotspot.id)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Tabs for 360 Editor / Minimap Editor */}
        <div className="flex-1 flex flex-col bg-[#050508] relative">
          
          <div className="flex gap-1 p-4 border-b border-white/10 bg-black/20">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-lime-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              1. Info General
            </button>
            <button 
              onClick={() => setActiveTab('360')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === '360' ? 'bg-lime-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              2. Editor 360
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'map' ? 'bg-lime-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              3. Mapa Interactivo
            </button>
          </div>

          <div className="flex-1 relative p-6">
            {activeTab === 'settings' && (
              <div className="w-full h-full p-8 flex flex-col gap-8 max-w-3xl mx-auto overflow-y-auto">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex flex-col gap-6">
                  <h2 className="text-2xl font-semibold text-lime-400 border-b border-white/10 pb-4">Ajustes Generales del Proyecto</h2>
                  
                  <div>
                    <label className="block text-sm text-white/70 mb-2 uppercase tracking-wider font-medium">Nombre del Proyecto</label>
                    <input 
                      type="text" 
                      value={project.name}
                      onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-lime-500 transition-colors"
                      placeholder="Ej: Apartamento Modelo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2 uppercase tracking-wider font-medium">Descripción</label>
                    <textarea 
                      value={project.description}
                      onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:border-lime-500 transition-colors"
                      placeholder="Describe este proyecto..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2 uppercase tracking-wider font-medium">Imagen de Portada (Thumbnail)</label>
                    <input type="file" accept="image/*" className="hidden" ref={thumbnailInputRef} onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                    
                    {project.thumbnail ? (
                      <div className="relative w-48 h-32 bg-black rounded-xl border border-white/10 overflow-hidden group">
                        <img src={project.thumbnail} alt="Portada" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="bg-lime-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-lime-400 transition-colors"
                          >
                            Cambiar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-48 h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">{uploadingImage ? 'Subiendo...' : 'Subir Portada'}</span>
                      </button>
                    )}
                    <p className="text-xs text-white/40 mt-3">Esta imagen se mostrará en el menú principal "Tus Recorridos".</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === '360' && selectedRoomId && project.rooms[selectedRoomId] && (
              <HotspotEditor3D 
                room={project.rooms[selectedRoomId]} 
                onAddHotspot={handleAddHotspotClick} 
              />
            )}
            {activeTab === '360' && !selectedRoomId && (
              <div className="w-full h-full flex items-center justify-center text-white/30">Selecciona una habitación a la izquierda</div>
            )}

            {activeTab === 'map' && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="mb-4 flex gap-4 items-center bg-white/5 px-6 py-3 rounded-full border border-white/10">
                  <span className="text-sm text-white/70">Plano actual:</span>
                  <input type="file" accept="image/*" className="hidden" ref={minimapInputRef} onChange={(e) => handleFileUpload(e, 'minimap')} />
                  <button 
                    onClick={() => minimapInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> {uploadingImage ? 'Subiendo...' : 'Subir Nuevo Plano'}
                  </button>
                </div>

                <div className="relative bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center min-w-[600px] min-h-[400px]">
                  <div className="relative inline-block cursor-default w-full h-full" onClick={handleMapClick}>
                    {project.minimapImage ? (
                      <img 
                        src={project.minimapImage} 
                        alt="Plano" 
                        className="max-h-[60vh] w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity pointer-events-none" 
                        onError={(e) => {
                          // Si falla, mostramos un fallback en el src para no romper el layout
                          (e.target as HTMLImageElement).style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('broken-image');
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl text-white/40 pointer-events-none">
                        👆 Haz clic en "Subir Nuevo Plano" para empezar
                      </div>
                    )}

                    {/* Si no hay imagen, los puntos se dibujarán sobre el recuadro vacío para no amontonarse. Si hay imagen, se dibujan sobre la imagen. */}
                    {Object.values(project.rooms).map(room => {
                      const isSelected = selectedRoomId === room.id;
                      return (
                        <div key={room.id} className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${isSelected ? 'z-20 scale-150' : 'z-10 opacity-60 grayscale'}`} style={{ left: `${room.minimapPosition.x}%`, top: `${room.minimapPosition.y}%` }}>
                          <div className={`w-4 h-4 rounded-full border-2 shadow-xl ${isSelected ? 'bg-lime-500 border-white animate-pulse' : 'bg-white border-black/50'}`} />
                          {isSelected && <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">{room.name}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODALES */}
      
      {/* Modal: Nueva Habitación */}
      <Modal 
        isOpen={isAddRoomModalOpen} 
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Crear Nueva Habitación"
      >
        <form onSubmit={handleAddRoomSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Nombre de la habitación</label>
            <input 
              type="text" 
              autoFocus
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Ej: Sala Principal, Baño Turco..."
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-lime-500 transition-colors text-white"
            />
          </div>
          <button 
            type="submit"
            disabled={!newRoomName.trim()}
            className="w-full bg-lime-500 text-black font-medium py-3 rounded-lg hover:bg-lime-400 transition-colors disabled:opacity-50 mt-2"
          >
            Crear Habitación
          </button>
        </form>
      </Modal>

      {/* Modal: Añadir Punto de Navegación */}
      <Modal
        isOpen={hotspotModal.isOpen}
        onClose={() => setHotspotModal({ isOpen: false, position: null, targetRoomId: '', label: '' })}
        title="Enlazar Habitación"
      >
        <form onSubmit={handleAddHotspotSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">¿A dónde lleva este botón?</label>
            <select
              value={hotspotModal.targetRoomId}
              onChange={(e) => setHotspotModal(prev => ({ ...prev, targetRoomId: e.target.value }))}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-lime-500 transition-colors text-white appearance-none"
            >
              {Object.values(project.rooms).filter(r => r.id !== selectedRoomId).map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-white/70 mb-2">Texto del botón (Opcional)</label>
            <input 
              type="text" 
              value={hotspotModal.label}
              onChange={(e) => setHotspotModal(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Ej: Ir al Pasillo"
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-lime-500 transition-colors text-white"
            />
          </div>

          <button 
            type="submit"
            disabled={!hotspotModal.targetRoomId}
            className="w-full bg-lime-500 text-black font-medium py-3 rounded-lg hover:bg-lime-400 transition-colors disabled:opacity-50 mt-2"
          >
            Guardar Enlace
          </button>
        </form>
      </Modal>

    </div>
  );
}
