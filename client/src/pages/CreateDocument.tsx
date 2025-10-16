import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import DocumentTemplateCard from "@/components/DocumentTemplateCard";
import UploadDocumentCard from "@/components/UploadDocumentCard";
import { FileText, Home, Gift, Briefcase, Users, Car } from "lucide-react";

export default function CreateDocument() {
  const [, setLocation] = useLocation();

  const templates = [
    {
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Kúpna zmluva',
      description: 'Štandardná zmluva o kúpe tovaru alebo nehnuteľnosti',
    },
    {
      icon: Home,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Nájomná zmluva',
      description: 'Zmluva o nájme bytu, domu alebo nebytového priestoru',
    },
    {
      icon: Gift,
      iconColor: 'text-pink-600',
      iconBgColor: 'bg-pink-100',
      title: 'Darovacia zmluva',
      description: 'Zmluva o bezodplatnom prevode majetku',
    },
    {
      icon: Briefcase,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      title: 'Pracovná zmluva',
      description: 'Zmluva medzi zamestnávateľom a zamestnancom',
    },
    {
      icon: Users,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      title: 'Zmluva o dielo',
      description: 'Zmluva na vykonanie konkrétnej práce alebo služby',
    },
    {
      icon: Car,
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100',
      title: 'Kúpna zmluva vozidla',
      description: 'Špecializovaná zmluva na kúpu motorového vozidla',
    },
  ];

  const handleFileUpload = (file: File) => {
    console.log('Document uploaded:', file.name);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-2">Vytvoriť digitálny dokument</h2>
          <p className="text-muted-foreground mb-6">
            Vyberte šablónu dokumentu alebo nahrajte vlastný dokument
          </p>
          
          <div className="space-y-4">
            <UploadDocumentCard onUpload={handleFileUpload} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <DocumentTemplateCard
                  key={template.title}
                  {...template}
                  onSelect={() => console.log('Template selected:', template.title)}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
