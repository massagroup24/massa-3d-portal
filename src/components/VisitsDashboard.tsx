import React, { useState, useEffect } from 'react';
import { getProjectVisits, VisitRecord } from '../supabase';
import { RefreshCw, Activity, X, Smartphone, Monitor } from 'lucide-react';

interface VisitsDashboardProps {
  onClose: () => void;
}

export function VisitsDashboard({ onClose }: VisitsDashboardProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    setLoading(true);
    const data = await getProjectVisits();
    setVisits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e110f] border border-[#99cc33]/30 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#99cc33]/20 border border-[#99cc33]/40 flex items-center justify-center text-[#99cc33]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Registro de Visitas
              </h3>
              <p className="text-xs text-gray-400">
                Historial de apertura de los recorridos 360°
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVisits}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <div className="border border-white/10 rounded-2xl bg-black/40 min-h-[200px]">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#99cc33]" />
                <span className="text-xs">Cargando métricas...</span>
              </div>
            ) : visits.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Activity className="w-8 h-8 text-white/20" />
                <span className="text-sm">Aún no hay visitas registradas.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/90 backdrop-blur-md z-10">
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-3.5 px-4">Fecha y Hora</th>
                    <th className="py-3.5 px-4">Proyecto</th>
                    <th className="py-3.5 px-4">Dispositivo</th>
                    <th className="py-3.5 px-4">Referencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 text-white font-medium whitespace-nowrap">
                        {formatDate(v.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-[#99cc33] font-semibold">
                        {v.project_name || v.project_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          {v.platform === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-lime-400" /> : <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                          {v.platform || 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 max-w-[200px] truncate" title={v.referrer || 'Directo'}>
                        {v.referrer || 'Directo'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
