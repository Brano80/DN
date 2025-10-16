import DocumentTemplateCard from '../DocumentTemplateCard';
import { FileText } from 'lucide-react';

export default function DocumentTemplateCardExample() {
  return (
    <DocumentTemplateCard
      icon={FileText}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-100"
      title="Kúpna zmluva"
      description="Štandardná zmluva o kúpe tovaru alebo nehnuteľnosti"
      onSelect={() => console.log('Template selected')}
    />
  );
}
