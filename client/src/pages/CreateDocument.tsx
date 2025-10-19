import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import DocumentTemplateCard from "@/components/DocumentTemplateCard";
import { Home, Car, Upload, FileCheck, Briefcase } from "lucide-react";

export default function CreateDocument() {
  const [, setLocation] = useLocation();

  const templates = [
    {
      icon: Upload,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Nahrať vlastný dokument',
      description: 'Nahrajte váš vlastný dokument na digitálne podpísanie',
      route: '/create-upload-document',
    },
    {
      icon: Car,
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100',
      title: 'Kúpna zmluva vozidla',
      description: 'Štandardná slovenská kúpno-predajná zmluva na kúpu motorového vozidla',
      route: '/create-vehicle-contract',
    },
    {
      icon: Home,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Nájomná zmluva',
      description: 'Štandardná slovenská zmluva o nájme bytu, domu alebo nebytového priestoru',
      route: '/create-rental-contract',
    },
    {
      icon: FileCheck,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      title: 'Splnomocnenie',
      description: 'Štandardné slovenské splnomocnenie na zastupovanie',
      route: '/create-power-of-attorney',
    },
    {
      icon: Briefcase,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      title: 'Zamestnanecká zmluva',
      description: 'Štandardná slovenská pracovná zmluva podľa Zákonníka práce',
      route: '/create-employment-contract',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-2">Vytvoriť digitálny dokument</h2>
          <p className="text-muted-foreground mb-6">
            Vyberte šablónu zmluvy
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <DocumentTemplateCard
                key={template.title}
                {...template}
                onSelect={() => setLocation(template.route)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
