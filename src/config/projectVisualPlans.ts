export interface ProjectVisualPlan {
  id: string;
  title: string;
  imageUrl: string;
}

// Imágenes ilustradas creadas fuera de la plataforma. Añadir aquí su ruta o URL
// cuando estén disponibles; los planos técnicos del tour se gestionan aparte.
export const PROJECT_VISUAL_PLANS: Record<string, ProjectVisualPlan[]> = {
  project_hacienda_f22: [
    { id: 'nivel-1', title: 'Primer piso', imageUrl: '/PLANOS 2D F22/PLANTA 1.png' },
    { id: 'nivel-2', title: 'Segundo piso', imageUrl: '/PLANOS 2D F22/PLANTA 2.png' },
    { id: 'nivel-3', title: 'Tercer piso', imageUrl: '/PLANOS 2D F22/PLANTA 3.png' },
  ],
  project_ibiza_a14: [
    { id: 'nivel-1', title: 'Primer piso', imageUrl: '/IBIZA A14/PLANTA 1.jpg' },
    { id: 'nivel-2', title: 'Segundo piso', imageUrl: '/IBIZA A14/PLANTA 2.jpg' },
  ],
};
