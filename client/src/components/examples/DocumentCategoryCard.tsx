import DocumentCategoryCard from '../DocumentCategoryCard';
import { FileText } from 'lucide-react';

export default function DocumentCategoryCardExample() {
  const documents = [
    {
      id: 'id-card',
      title: 'Elektronický občiansky preukaz',
      subtitle: 'Platný do: 15.08.2034',
      status: 'Aktívny',
      statusVariant: 'default' as const,
    },
    {
      id: 'driving-license',
      title: 'Vodičský preukaz',
      subtitle: 'Platný do: 22.03.2032',
      status: 'Aktívny',
      statusVariant: 'default' as const,
    },
  ];

  return (
    <DocumentCategoryCard
      icon={FileText}
      iconColor="text-blue-600"
      iconBgColor="bg-blue-100"
      title="Doklady totožnosti"
      documents={documents}
      onDocumentClick={(id) => console.log('Document clicked:', id)}
    />
  );
}
