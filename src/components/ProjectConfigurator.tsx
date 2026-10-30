import { useState, useRef, useMemo, useEffect } from 'react';
import { Project, Room, Hotspot } from '../data/tourData';
import { Settings, Save, Plus, ChevronLeft, Upload, Trash2, ArrowUp, ArrowDown, Layers, Edit3 } from 'lucide-react';
import { saveProjectToSupabase, uploadImageToSupabase, deleteImageFromSupabase } from '../supabase';
import { HotspotEditor3D } from './HotspotEditor3D';
import { compressImage } from '../utils/imageCompressor';
import { Modal } from './Modal';

interface ConfiguratorProps {
  initialProject: Project;
  onClose: () => void;
  onSave?: (project: Project) => void;
  isNewProject?: boolean;
}

export function ProjectConfigurator({ initialProject, onClose, onSave, isNewProject = false }: ConfiguratorProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [hasSaved, setHasSaved] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialProject.initialRoomId || Object.keys(initialProject.rooms || {})[0] || null
  );
  const [activeTab, setActiveTab] = useState<'360' | 'map'>('360');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingMinimap, setDeletingMinimap] = useState(false);

  // Modal States
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const [hotspotModal, setHotspotModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    hotspotId?: string;
    position: [number, number, number] | null;
    targetRoomId: string;
    label: string;
  }>({
    isOpen: false,
    isEditing: false,
    hotspotId: undefined,
    position: null,
    targetRoomId: '',
    label: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const minimapInputRef = useRef<HTMLInputElement>(null);

  // Niveles / Plantas disponibles en el proyecto
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    if (project.floorPlans) {
      Object.keys(project.floorPlans).forEach(f => {
        if (f) set.add(f);
      });
    }
    Object.values(project.rooms || {}).forEach(r => {
      if (r.floorLevel) set.add(r.floorLevel);
    });
    // Si no hay ninguno especificado o es Hacienda F22, asegurar los 3 pisos canónicos
    if (set.size === 0) {
      set.add('Piso 1');
    }
    if (project.id === 'project_hacienda_f22' || project.id === 'hacienda-f22') {
      set.add('Piso 1');
      set.add('Piso 2');
      set.add('Piso 3');
    }
    const orderMap: Record<string, number> = {
      'Piso 1': 1, 'Nivel 1': 1,
      'Piso 2': 2, 'Nivel 2': 2,
      'Piso 3': 3, 'Nivel 3': 3, 'Rooftop': 4
    };
    return Array.from(set).sort((a, b) => (orderMap[a] || 99) - (orderMap[b] || 99));
  }, [project.floorPlans, project.rooms, project.id]);

  const [selectedFloor, setSelectedFloor] = useState<string>(() => {
    const initialRoom = initialProject.rooms?.[initialProject.initialRoomId];
    return initialRoom?.floorLevel || availableFloors[0] || 'Piso 1';
  });

  // Al seleccionar una habitación, sincronizar automáticamente el plano al nivel de esa habitación
  useEffect(() => {
    if (selectedRoomId && project.rooms[selectedRoomId]?.floorLevel) {
      setSelectedFloor(project.rooms[selectedRoomId].floorLevel!);
    }
  }, [selectedRoomId]);

  // Imagen del plano arquitectónico correspondiente a la planta seleccionada
  const activeFloorPlanImage = useMemo(() => {
    if (project.floorPlans && project.floorPlans[selectedFloor]) {
      return project.floorPlans[selectedFloor];
    }
    if (selectedFloor === 'Piso 1' && project.minimapImage) {
      return project.minimapImage;
    }
    // Buscar si alguna habitación de este piso tiene imagen de plano configurada
    const matchingRoom = Object.values(project.rooms || {}).find(
      r => r.floorLevel === selectedFloor && r.floorPlanImage
    );
    if (matchingRoom?.floorPlanImage) return matchingRoom.floorPlanImage;
    return project.minimapImage || '';
  }, [project.floorPlans, project.rooms, project.minimapImage, selectedFloor]);

  const handleSaveToSupabase = async () => {
    try {
      setSavingState('saving');

      const updatedProject: Project = {
        ...project,
        hasTour360: Object.keys(project.rooms || {}).length > 0,
      };

      // 1. Guardar de inmediato en almacenamiento local para persistencia instantánea
      try {
        const stored = localStorage.getItem('massa_custom_projects');
        const custom = stored ? JSON.parse(stored) : {};
        custom[updatedProject.id] = updatedProject;
        localStorage.setItem('massa_custom_projects', JSON.stringify(custom));
        localStorage.setItem('custom_projects_v4', JSON.stringify(custom));
        window.dispatchEvent(new Event('massa_project_updated'));
      } catch (localErr) {
        console.warn("Error escribiendo en almacenamiento local:", localErr);
      }

      // 2. Notificar al estado de React del portal
      if (onSave) onSave(updatedProject);

      // 3. Sincronizar con Supabase en la nube
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de espera agotado al conectar con Supabase (límite 10s)")), 10000)
        );

        await Promise.race([
          saveProjectToSupabase(updatedProject),
          timeoutPromise
        ]);
      } catch (cloudErr) {
        console.warn("Sincronización con Supabase en modo local/desconectado:", cloudErr);
      }

      setSavingState('saved');
      setHasSaved(true);
      setTimeout(() => setSavingState('idle'), 3000);
    } catch (err: any) {
      console.error("Error al guardar proyecto:", err);
      setSavingState('error');
    }
  };

  const handleClose = () => {
    if (isNewProject && !hasSaved) {
      const hasChanges = JSON.stringify(project) !== JSON.stringify(initialProject);
      if (hasChanges) {
        const confirmExit = window.confirm("Tienes cambios sin guardar en este nuevo proyecto. ¿Estás seguro de que deseas salir sin guardar? El proyecto no se creará.");
        if (!confirmExit) return;
      }
      onClose();
      return;
    }

    try {
      const stored = localStorage.getItem('massa_custom_projects');
      const custom = stored ? JSON.parse(stored) : {};
      custom[project.id] = project;
      localStorage.setItem('massa_custom_projects', JSON.stringify(custom));
      localStorage.setItem('custom_projects_v4', JSON.stringify(custom));
      window.dispatchEvent(new Event('massa_project_updated'));
    } catch {}

    if (onSave) onSave(project);
    onClose();
  };

  const generateId = (name: string) => {
    return 'room_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
  };

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
          floorLevel: selectedFloor,
          floorPlanImage: activeFloorPlanImage,
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
      const remainingIds = Object.keys(project.rooms).filter(id => id !== roomId);
      const nextRoomId = remainingIds.length > 0 ? remainingIds[0] : null;

      setProject(prev => {
        const newRooms = { ...prev.rooms };
        delete newRooms[roomId];
        
        Object.keys(newRooms).forEach(key => {
          if (newRooms[key] && newRooms[key].hotspots) {
            newRooms[key] = {
              ...newRooms[key],
              hotspots: newRooms[key].hotspots.filter(h => h && h.targetRoom !== roomId)
            };
          }
        });

        const newInitialRoomId = prev.initialRoomId === roomId && nextRoomId ? nextRoomId : prev.initialRoomId;
        return { ...prev, rooms: newRooms, initialRoomId: newInitialRoomId };
      });

      if (selectedRoomId === roomId) {
        setSelectedRoomId(nextRoomId);
      }
    }
  };

  const handleMoveRoom = (roomId: string, direction: 'up' | 'down') => {
    const keys = Object.keys(project.rooms);
    const index = keys.indexOf(roomId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= keys.length) return;

    const newKeys = [...keys];
    const temp = newKeys[index];
    newKeys[index] = newKeys[targetIndex];
    newKeys[targetIndex] = temp;

    const newRooms: Record<string, Room> = {};
    newKeys.forEach(k => {
      if (project.rooms[k]) {
        newRooms[k] = project.rooms[k];
      }
    });

    const newInitialRoomId = newKeys[0];
    setProject(prev => ({
      ...prev,
      rooms: newRooms,
      initialRoomId: newInitialRoomId
    }));
  };

  const handleAddFloor = () => {
    const floorName = prompt('Ingresa el nombre del nuevo piso o nivel (ej: Piso 2, Piso 3, Rooftop, Sótano):');
    if (!floorName || !floorName.trim()) return;
    const trimmed = floorName.trim();
    setProject(prev => ({
      ...prev,
      floorPlans: {
        ...(prev.floorPlans || {}),
        [trimmed]: prev.floorPlans?.[trimmed] || ''
      }
    }));
    setSelectedFloor(trimmed);
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

    setProject(prev => {
      const room = prev.rooms[selectedRoomId];
      if (!room) return prev;
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          [selectedRoomId]: {
            ...room,
            minimapPosition: { x, y },
            floorLevel: selectedFloor,
            floorPlanImage: activeFloorPlanImage || room.floorPlanImage
          }
        }
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploadType: 'minimap' | 'room' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try {
          const maxWidth = uploadType === 'room' ? 6144 : 2048;
          const maxHeight = uploadType === 'room' ? 3072 : 2048;
          fileToUpload = await compressImage(file, maxWidth, maxHeight);
        } catch (e) {
          console.warn("No se pudo optimizar la imagen, subiendo original", e);
        }
      }

      const sanitizedName = fileToUpload.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "_");

      const prefix = uploadType === 'minimap' 
        ? `plano_${selectedFloor.toLowerCase().replace(/[^a-z0-9]/g, '_')}` 
        : uploadType === 'thumbnail' ? 'thumbnail' : selectedRoomId;
      const path = `projects/${project.id}/${prefix}-${sanitizedName}`;
      
      let url = '';
      try {
        url = await uploadImageToSupabase(fileToUpload, path);
      } catch (uploadErr: any) {
        console.warn("Subiendo imagen localmente (fallback DataURL):", uploadErr);
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });
      }
      
      if (uploadType === 'minimap') {
        setProject(prev => {
          const updatedFloorPlans = {
            ...(prev.floorPlans || {}),
            [selectedFloor]: url
          };
          const updatedRooms = { ...prev.rooms };
          Object.keys(updatedRooms).forEach(rId => {
            if ((updatedRooms[rId].floorLevel || 'Piso 1') === selectedFloor) {
              updatedRooms[rId] = { ...updatedRooms[rId], floorPlanImage: url };
            }
          });
          return {
            ...prev,
            minimapImage: selectedFloor === 'Piso 1' ? url : (prev.minimapImage || url),
            floorPlans: updatedFloorPlans,
            rooms: updatedRooms
          };
        });
      } else if (uploadType === 'thumbnail') {
        setProject(prev => ({ ...prev, thumbnail: url }));
      } else if (uploadType === 'room' && selectedRoomId) {
        handleUpdateRoom(selectedRoomId, 'imageUrl', url);
      }
    } catch (err: any) {
      console.error("Error procesando archivo:", err);
      try {
        const fallbackUrl = URL.createObjectURL(file);
        if (uploadType === 'minimap') {
          setProject(prev => ({
            ...prev,
            floorPlans: {
              ...(prev.floorPlans || {}),
              [selectedFloor]: fallbackUrl
            }
          }));
        } else if (uploadType === 'thumbnail') {
          setProject(prev => ({ ...prev, thumbnail: fallbackUrl }));
        } else if (uploadType === 'room' && selectedRoomId) {
          handleUpdateRoom(selectedRoomId, 'imageUrl', fallbackUrl);
        }
      } catch (e2) {
        console.error("Error en fallback:", e2);
      }
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteMinimap = async () => {
    if (!activeFloorPlanImage) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el plano de ${selectedFloor}?`)) {
      return;
    }

    try {
      setDeletingMinimap(true);
      setSavingState('saving');

      try {
        await deleteImageFromSupabase(activeFloorPlanImage);
      } catch (err) {
        console.warn('Continuando con actualización de base de datos:', err);
      }

      const updatedFloorPlans = { ...(project.floorPlans || {}) };
      delete updatedFloorPlans[selectedFloor];

      const updatedProject = {
        ...project,
        minimapImage: selectedFloor === 'Piso 1' ? '' : project.minimapImage,
        floorPlans: updatedFloorPlans
      };
      setProject(updatedProject);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con Supabase (límite 15s)')), 15000)
      );

      await Promise.race([
        saveProjectToSupabase(updatedProject),
        timeoutPromise
      ]);

      if (onSave) onSave(updatedProject);

      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 3000);
    } catch (err: any) {
      console.error('Error al eliminar plano:', err);
      setSavingState('error');
    } finally {
      setDeletingMinimap(false);
    }
  };

  const handleAddHotspotClick = (position: [number, number, number]) => {
    const availableTargets = Object.keys(project.rooms).filter(id => id !== selectedRoomId);
    const defaultTarget = availableTargets[0] || '';
    setHotspotModal({
      isOpen: true,
      isEditing: false,
      hotspotId: undefined,
      position,
      targetRoomId: defaultTarget,
      label: project.rooms[defaultTarget]?.name ? `Ir a ${project.rooms[defaultTarget].name}` : ''
    });
  };

  const handleEditHotspotClick = (hotspot: Hotspot) => {
    setHotspotModal({
      isOpen: true,
      isEditing: true,
      hotspotId: hotspot.id,
      position: hotspot.position,
      targetRoomId: hotspot.targetRoom,
      label: hotspot.label || ''
    });
  };

  const handleSaveHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !hotspotModal.targetRoomId) return;

    if (hotspotModal.isEditing && hotspotModal.hotspotId) {
      // Modificar punto interactivo existente
      const currentHotspots = project.rooms[selectedRoomId].hotspots || [];
      const updatedHotspots = currentHotspots.map(hs => {
        if (hs.id === hotspotModal.hotspotId) {
          return {
            ...hs,
            targetRoom: hotspotModal.targetRoomId,
            label: hotspotModal.label.trim() || project.rooms[hotspotModal.targetRoomId]?.name || 'Ir a habitación'
          };
        }
        return hs;
      });
      handleUpdateRoom(selectedRoomId, 'hotspots', updatedHotspots);
    } else {
      // Crear nuevo punto interactivo
      if (!hotspotModal.position) return;
      const newHotspot: Hotspot = {
        id: 'hs_' + Date.now(),
        position: hotspotModal.position,
        targetRoom: hotspotModal.targetRoomId,
        label: hotspotModal.label.trim() || project.rooms[hotspotModal.targetRoomId]?.name || 'Ir a habitación'
      };
      const currentHotspots = project.rooms[selectedRoomId].hotspots || [];
      handleUpdateRoom(selectedRoomId, 'hotspots', [...currentHotspots, newHotspot]);
    }

    setHotspotModal({
      isOpen: false,
      isEditing: false,
      hotspotId: undefined,
      position: null,
      targetRoomId: '',
      label: ''
    });
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    if (!selectedRoomId) return;
    const currentHotspots = project.rooms[selectedRoomId].hotspots || [];
    handleUpdateRoom(selectedRoomId, 'hotspots', currentHotspots.filter(h => h.id !== hotspotId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0E] text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Header */}
      <header className="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            title="Volver al panel"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Settings className="w-4 h-4 text-lime-400" />
              <span>
                Estudio 360:{' '}
                {project.id === 'project_hacienda_f22' || project.name?.includes('F22') ? (
                  <>
                    <span className="text-white">HACIENDA</span>{' '}
                    <span className="text-[#DFC47B] font-black">F22</span>
                  </>
                ) : project.id === 'project_ibiza_a14' || project.name?.includes('A14') ? (
                  <>
                    <span className="text-white">IBIZA</span>{' '}
                    <span className="text-[#9CD01A] font-black">A14</span>
                  </>
                ) : (
                  project.name
                )}
              </span>
            </h1>
            <p className="text-xs text-white/50 hidden sm:block">Editor de gemelo digital, 3 planos de corte y navegación interactiva</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSaveToSupabase}
            disabled={savingState === 'saving'}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer ${
              savingState === 'saved'
                ? 'bg-emerald-500 text-black'
                : savingState === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-lime-500 hover:bg-lime-400 text-black shadow-lime-500/20 active:scale-95'
            }`}
          >
            <Save className={`w-4 h-4 ${savingState === 'saving' ? 'animate-spin' : ''}`} />
            <span>
              {savingState === 'saving' ? 'Guardando...' : savingState === 'saved' ? '¡Guardado!' : savingState === 'error' ? 'Reintentar' : 'Guardar Cambios'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Left Panel: Rooms List & Details */}
        <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-6 flex flex-col gap-6 max-h-[45vh] lg:max-h-full overflow-y-auto bg-black/20 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Ambientes ({Object.keys(project.rooms).length})</h2>
              <button 
                onClick={() => setIsAddRoomModalOpen(true)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-lime-400 transition-colors cursor-pointer" 
                title="Añadir nuevo ambiente"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/50">
              Ambiente <span className="text-lime-400 font-medium">#1</span> es la vista inicial del cliente. Organiza cada espacio en su respectiva planta.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {Object.values(project.rooms).map((room, index) => {
              const isFirst = index === 0;
              const isLast = index === Object.keys(project.rooms).length - 1;
              const isSelected = selectedRoomId === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-lime-500/15 border-lime-500/60 shadow-[0_0_20px_rgba(132,204,22,0.15)]' 
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <span className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded-lg flex-shrink-0 transition-colors ${
                      isFirst ? 'bg-lime-500 text-black font-extrabold shadow-md shadow-lime-500/30' : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-medium truncate text-sm sm:text-base text-white/90 group-hover:text-white">{room.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                          {room.floorLevel || 'Piso 1'}
                        </span>
                        {isFirst && (
                          <span className="text-[10px] text-lime-400 font-semibold tracking-wider uppercase flex items-center gap-1 animate-pulse">
                            ★ Inicio
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flechas para reordenar */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMoveRoom(room.id, 'up')}
                      disabled={isFirst}
                      title="Subir en el orden"
                      className="p-1.5 hover:bg-white/15 active:scale-95 rounded-lg text-white/70 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all border border-transparent hover:border-white/20 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRoom(room.id, 'down')}
                      disabled={isLast}
                      title="Bajar en el orden"
                      className="p-1.5 hover:bg-white/15 active:scale-95 rounded-lg text-white/70 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all border border-transparent hover:border-white/20 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Room Editor */}
          {selectedRoomId && project.rooms[selectedRoomId] && (
            <div className="mt-2 p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-4 relative">
              <button
                onClick={() => handleDeleteRoom(selectedRoomId)}
                title="Eliminar este ambiente"
                className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Nombre del ambiente</label>
                <input 
                  type="text" 
                  value={project.rooms[selectedRoomId].name}
                  onChange={(e) => handleUpdateRoom(selectedRoomId, 'name', e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500 text-white"
                />
              </div>

              {/* Selector de Planta / Nivel Arquitectónico */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-lime-400" />
                    <span>Planta / Nivel del Plano</span>
                  </label>
                  <span className="text-[10px] text-lime-400 font-mono">determina el plano</span>
                </div>
                <select
                  value={project.rooms[selectedRoomId].floorLevel || 'Piso 1'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__add_new__') {
                      const floorName = prompt('Nombre de la nueva planta (ej: Piso 4, Rooftop, Sótano):');
                      if (floorName && floorName.trim()) {
                        const trimmed = floorName.trim();
                        handleUpdateRoom(selectedRoomId, 'floorLevel', trimmed);
                        setProject(prev => ({
                          ...prev,
                          floorPlans: {
                            ...(prev.floorPlans || {}),
                            [trimmed]: prev.floorPlans?.[trimmed] || ''
                          }
                        }));
                        setSelectedFloor(trimmed);
                      }
                      return;
                    }
                    handleUpdateRoom(selectedRoomId, 'floorLevel', val);
                    const floorImg = project.floorPlans?.[val];
                    if (floorImg) {
                      handleUpdateRoom(selectedRoomId, 'floorPlanImage', floorImg);
                    }
                    setSelectedFloor(val);
                  }}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500 text-white"
                >
                  {availableFloors.map(floor => (
                    <option key={floor} value={floor} className="bg-[#141418] text-white">
                      {floor}
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-[#141418] text-lime-400 font-bold">
                    + Añadir nueva planta...
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Imagen Panorámica 360°</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'room')} />
                
                {project.rooms[selectedRoomId].imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video group">
                    <img src={project.rooms[selectedRoomId].imageUrl} alt="360 preview" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-lime-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-lime-400 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Cambiar Imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full border-2 border-dashed border-white/20 hover:border-lime-500/50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-white/50 hover:text-lime-400 transition-colors cursor-pointer"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Subir Fotografía 360°</span>
                  </button>
                )}
              </div>

              {/* Lista de hotspots en este ambiente */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Botones Interactivos ({project.rooms[selectedRoomId].hotspots?.length || 0})
                  </label>
                  <span className="text-[10px] text-lime-400/80 font-mono">Control Total 360</span>
                </div>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {(project.rooms[selectedRoomId].hotspots || []).map((hs) => (
                    <div key={hs.id} className="flex items-center justify-between bg-black/50 border border-white/10 px-3 py-2.5 rounded-xl text-xs group hover:border-lime-500/40 transition-colors">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-lime-400 shrink-0 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                          <span className="font-bold text-white truncate text-[11px]">
                            {hs.label || 'Botón de navegación'}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/50 pl-3.5 truncate">
                          Destino: <strong className="text-lime-300 font-semibold">{project.rooms[hs.targetRoom]?.name || hs.targetRoom}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          type="button"
                          onClick={() => handleEditHotspotClick(hs)}
                          className="p-1.5 text-white/70 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Editar texto y destino"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteHotspot(hs.id)}
                          className="p-1.5 text-red-400/80 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este botón"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!project.rooms[selectedRoomId].hotspots || project.rooms[selectedRoomId].hotspots.length === 0) && (
                    <div className="text-xs text-white/30 italic text-center py-3 border border-dashed border-white/10 rounded-xl">
                      Sin botones interactivos aún. Haz clic en "+ Añadir Punto de Navegación" y colócalo en la esfera 360.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Panel: Interactive Editor (360 or Floor Plans) */}
        <div className="flex-1 flex flex-col h-full bg-black/40 overflow-hidden">
          
          {/* Sub Navigation Bar */}
          <div className="flex border-b border-white/10 px-4 sm:px-6 shrink-0 bg-black/20">
            <button
              onClick={() => setActiveTab('360')}
              className={`py-3.5 px-4 font-medium text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
                activeTab === '360' ? 'border-lime-500 text-lime-400 font-bold' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              1. Navegación en Esfera 360°
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-3.5 px-4 font-medium text-xs sm:text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'map' ? 'border-lime-500 text-lime-400 font-bold' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Planos por Nivel ({availableFloors.length} plantas)</span>
            </button>
          </div>

          <div className="flex-1 relative p-3 sm:p-6 overflow-y-auto">
            {activeTab === '360' && selectedRoomId && project.rooms[selectedRoomId] && (
              <HotspotEditor3D 
                room={project.rooms[selectedRoomId]} 
                onAddHotspot={handleAddHotspotClick}
                onEditHotspot={handleEditHotspotClick} 
              />
            )}
            {activeTab === '360' && !selectedRoomId && (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                Selecciona o añade una habitación 360° a la izquierda
              </div>
            )}

            {/* TAB PLANOS POR NIVEL */}
            {activeTab === 'map' && (
              <div className="w-full h-full flex flex-col items-center justify-start py-2">
                
                {/* Selector de Plantas y Acciones */}
                <div className="w-full max-w-4xl mb-4 bg-white/5 p-2 sm:p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
                  
                  {/* Pestañas de Pisos */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-lime-400" />
                      <span>Planta:</span>
                    </span>
                    {availableFloors.map(floor => {
                      const isCurrent = selectedFloor === floor;
                      const roomCount = Object.values(project.rooms).filter(r => (r.floorLevel || 'Piso 1') === floor).length;
                      return (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => setSelectedFloor(floor)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                            isCurrent
                              ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/30 scale-102'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10'
                          }`}
                        >
                          <span>{floor}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            isCurrent ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-white/60'
                          }`}>
                            {roomCount} {roomCount === 1 ? 'espacio' : 'espacios'}
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleAddFloor}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-lime-500/10 text-lime-400 border border-dashed border-lime-500/40 hover:border-lime-400 transition-all flex items-center gap-1 cursor-pointer"
                      title="Añadir otra planta o nivel al proyecto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Planta</span>
                    </button>
                  </div>

                  {/* Acciones para la Planta Activa */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={minimapInputRef} 
                      onChange={(e) => handleFileUpload(e, 'minimap')} 
                    />
                    <button 
                      onClick={() => minimapInputRef.current?.click()}
                      disabled={uploadingImage || deletingMinimap}
                      className="flex items-center gap-1.5 text-xs font-bold text-lime-400 hover:text-lime-300 bg-lime-500/10 hover:bg-lime-500/20 px-3 py-1.5 rounded-xl border border-lime-500/30 transition-all disabled:opacity-50 cursor-pointer"
                      title={`Subir plano para ${selectedFloor}`}
                    >
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadingImage ? 'Subiendo...' : `Subir Plano (${selectedFloor})`}</span>
                    </button>
                    {activeFloorPlanImage && (
                      <button 
                        onClick={handleDeleteMinimap}
                        disabled={uploadingImage || deletingMinimap}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-xl border border-red-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        title={`Eliminar plano de ${selectedFloor}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtítulo de Instrucción */}
                <div className="text-center mb-3">
                  <p className="text-xs text-white/70">
                    Plano en pantalla: <strong className="text-lime-400 font-bold">{selectedFloor}</strong>. 
                    Haz clic en el plano para situar el punto de <strong className="text-white font-bold">{project.rooms[selectedRoomId || '']?.name || 'la habitación seleccionada'}</strong>.
                  </p>
                </div>

                {/* Canvas del Plano de Planta */}
                <div className={`relative bg-white/5 p-3 sm:p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center ${
                  !activeFloorPlanImage 
                    ? 'w-full min-w-[280px] max-w-[650px] min-h-[320px] sm:min-h-[420px]' 
                    : 'w-fit h-fit max-w-[92vw] max-h-[72vh]'
                }`}>
                  <div 
                    className={`relative inline-block cursor-crosshair ${
                      !activeFloorPlanImage 
                        ? 'w-full h-full min-w-[500px] min-h-[350px]' 
                        : 'w-fit h-fit max-w-full max-h-[66vh] shadow-2xl rounded-xl overflow-hidden border border-white/15 bg-black/40'
                    }`} 
                    onClick={handleMapClick}
                  >
                    {activeFloorPlanImage ? (
                      <img 
                        src={activeFloorPlanImage} 
                        alt={`Plano de ${selectedFloor}`} 
                        className="block max-h-[66vh] max-w-full w-auto h-auto object-contain opacity-95 hover:opacity-100 transition-opacity pointer-events-none select-none" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('broken-image');
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl text-white/50 p-6 text-center gap-2">
                        <Layers className="w-8 h-8 text-lime-400 mb-1" />
                        <p className="text-sm font-bold text-white">No hay plano cargado para {selectedFloor}</p>
                        <p className="text-xs text-white/50 max-w-sm">
                          Haz clic arriba en "Subir Plano ({selectedFloor})" para cargar el plano isométrico correspondiente.
                        </p>
                      </div>
                    )}

                    {/* Puntos interactivos: SOLO las habitaciones de la planta seleccionada */}
                    {Object.values(project.rooms)
                      .filter(room => (room.floorLevel || 'Piso 1') === selectedFloor)
                      .map(room => {
                        const isSelected = selectedRoomId === room.id;
                        return (
                          <div 
                            key={room.id} 
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${
                              isSelected ? 'z-20 scale-150' : 'z-10 opacity-75'
                            }`} 
                            style={{ left: `${room.minimapPosition.x}%`, top: `${room.minimapPosition.y}%` }}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 shadow-xl ${
                              isSelected ? 'bg-lime-500 border-white animate-pulse' : 'bg-white border-black/50'
                            }`} />
                            {isSelected && (
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                                {room.name}
                              </span>
                            )}
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

      {/* MODAL: Nueva Habitación */}
      <Modal 
        isOpen={isAddRoomModalOpen} 
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Crear Nuevo Ambiente"
      >
        <form onSubmit={handleAddRoomSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider font-semibold">
              Nombre del Ambiente
            </label>
            <input 
              type="text" 
              placeholder="Ej: Sala Social, Master Suite, Sky Lounge..." 
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-lime-500 text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider font-semibold">
              Asignar a Planta / Nivel
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-lime-500 text-white"
            >
              {availableFloors.map(floor => (
                <option key={floor} value={floor} className="bg-[#141418] text-white">
                  {floor}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddRoomModalOpen(false)}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newRoomName.trim()}
              className="px-5 py-2 bg-lime-500 hover:bg-lime-400 disabled:opacity-40 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-lime-500/20"
            >
              Crear Ambiente
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Punto de Navegación (Hotspot) - Crear y Editar con Control Total */}
      <Modal
        isOpen={hotspotModal.isOpen}
        onClose={() => setHotspotModal(prev => ({ ...prev, isOpen: false }))}
        title={hotspotModal.isEditing ? "Editar Botón Interactivo 360°" : "Crear Botón Interactivo 360°"}
      >
        <form onSubmit={handleSaveHotspot} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-white/70 mb-1.5 uppercase tracking-wider font-semibold">
              Texto del Botón (lo que verá el visitante)
            </label>
            <input 
              type="text"
              placeholder="Ej: Entrar al Estudio Privado"
              value={hotspotModal.label}
              onChange={(e) => setHotspotModal(prev => ({ ...prev, label: e.target.value }))}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-lime-500 text-white placeholder:text-white/30"
              autoFocus
            />
            <span className="text-[10px] text-white/40 block mt-1">
              Personaliza el texto que aparece en la píldora flotante bajo el botón interactivo.
            </span>
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1.5 uppercase tracking-wider font-semibold">
              Ambiente de Destino al Hacer Clic
            </label>
            <select
              value={hotspotModal.targetRoomId}
              onChange={(e) => {
                const targetId = e.target.value;
                setHotspotModal(prev => ({
                  ...prev,
                  targetRoomId: targetId,
                  label: prev.label || (project.rooms[targetId]?.name ? `Ir a ${project.rooms[targetId].name}` : '')
                }));
              }}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-lime-500 text-white"
            >
              {Object.values(project.rooms)
                .filter(r => r.id !== selectedRoomId)
                .map(room => (
                  <option key={room.id} value={room.id} className="bg-[#141418] text-white">
                    {room.name} ({room.floorLevel || 'Piso 1'})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
            {hotspotModal.isEditing && hotspotModal.hotspotId ? (
              <button
                type="button"
                onClick={() => {
                  if (hotspotModal.hotspotId) {
                    handleDeleteHotspot(hotspotModal.hotspotId);
                    setHotspotModal(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Botón</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHotspotModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!hotspotModal.targetRoomId}
                className="px-5 py-2.5 bg-lime-500 hover:bg-lime-400 disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-lime-500/25 cursor-pointer"
              >
                {hotspotModal.isEditing ? 'Guardar Cambios' : 'Insertar Punto'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
}
