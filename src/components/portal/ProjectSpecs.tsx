import { ProjectPublicSpecs } from '../../services/portalService';
import { Button } from '../ui/Button';
import { ProjectFichaTecnica } from '../project/ProjectFichaTecnica';
import { getCanonicalProjectBySlugOrId } from '../../data/canonicalProjects';
import { getProjectIdentity } from '../../config/projectIdentityConfig';

interface ProjectSpecsProps {
  projectName: string;
  specs: ProjectPublicSpecs;
  onContactCommercial?: () => void;
  onOpen360Tour?: () => void;
}

export function ProjectSpecs({ 
  projectName, 
  specs, 
  onContactCommercial,
  onOpen360Tour 
}: ProjectSpecsProps) {
  const canonical = getCanonicalProjectBySlugOrId(projectName);
  const displayName = canonical?.nombre || projectName;
  const identity = getProjectIdentity(canonical?.id || projectName);

  const whatsappMsg = encodeURIComponent(
    `Hola, estoy explorando la ficha técnica de ${displayName} y quisiera agendar una asesoría para mi proyecto.`
  );
  const whatsappUrl = `https://wa.me/573104771967?text=${whatsappMsg}`;

  const handleAction = () => {
    if (onContactCommercial) {
      onContactCommercial();
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-36 text-left">
      <h1 className="text-3xl font-bold text-white">{displayName}</h1>
      <div className="flex flex-wrap gap-3">
        {onOpen360Tour && canonical?.hasTour360 && <Button onClick={onOpen360Tour}>Ver recorrido 360°</Button>}
        <Button onClick={handleAction}>Consultar el proyecto</Button>
      </div>
      <ProjectFichaTecnica project={canonical} technicalSpecs={specs.technicalSpecs} projectName={displayName} accentColor={identity.theme.primaryColor} />
    </div>
  );
}
