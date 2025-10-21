import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import DocumentCategoryCard from "@/components/DocumentCategoryCard";
import { FileText, Home } from "lucide-react";

export default function MyDocuments() {
  const [, setLocation] = useLocation();

  const identityDocuments = [
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

  const propertyDocuments = [
    {
      id: 'vehicle-registration',
      title: 'Osvedčenie o evidencii vozidla',
      subtitle: 'Škoda Octavia - BA 123AB',
      status: 'Aktívny',
      statusVariant: 'default' as const,
    },
    {
      id: 'property-deed',
      title: 'Výpis z listu vlastníctva',
      subtitle: 'Nehnuteľnosť Bratislava',
      status: 'Overený',
      statusVariant: 'default' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-6">E-dokumenty</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentCategoryCard
              icon={FileText}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              title="Doklady totožnosti"
              documents={identityDocuments}
              onDocumentClick={(id) => console.log('Document clicked:', id)}
            />

            <DocumentCategoryCard
              icon={Home}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              title="Majetok & Vozidlá"
              documents={propertyDocuments}
              onDocumentClick={(id) => console.log('Document clicked:', id)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
