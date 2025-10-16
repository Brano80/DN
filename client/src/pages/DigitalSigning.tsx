import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DigitalSigning() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const processType = params.type || 'house';
  const { toast } = useToast();
  const [isSigned, setIsSigned] = useState(false);

  const getProcessInfo = () => {
    switch(processType) {
      case 'house':
        return {
          title: 'Kúpno-predajná zmluva - Rodinný dom',
          seller: 'Ján Novák',
          buyer: 'Mária Svobodová',
          subject: 'Rodinný dom, Bratislava',
          price: '250 000 €',
          created: '20.12.2024'
        };
      case 'vehicle':
        return {
          title: 'Predaj vozidla - Škoda Octavia',
          seller: 'Ján Novák',
          buyer: 'Tomáš Horváth',
          subject: 'Škoda Octavia 2019, 85 000 km',
          price: '18 500 €',
          created: '22.12.2024'
        };
      case 'attorney':
        return {
          title: 'Splnomocnenie - Zastupovanie na úrade',
          seller: 'Ján Novák',
          buyer: 'Peter Kováč',
          subject: 'Zastupovanie na katastrálnom úrade',
          price: '-',
          created: '21.12.2024'
        };
      default:
        return {
          title: 'Digitálne podpisovanie',
          seller: '-',
          buyer: '-',
          subject: '-',
          price: '-',
          created: '-'
        };
    }
  };

  const info = getProcessInfo();

  const handleSimulateSignature = () => {
    console.log('Simulating second signature...');
    setIsSigned(true);
    toast({
      title: "Podpis úspešný",
      description: `${info.buyer} úspešne podpísal zmluvu. Proces je kompletný.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/virtual-office')} />
          <h2 className="text-2xl font-semibold mb-6">Digitálne podpisovanie zmluvy</h2>

          {/* Progress Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Priebeh procesu</h3>
              <span className="text-sm text-muted-foreground">
                {isSigned ? 'Krok 5 z 5' : 'Krok 1 z 5'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSigned ? 'bg-primary text-primary-foreground' : (index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}`}>
                    {isSigned || index === 0 ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {index < 4 && <div className={`flex-1 h-1 ${isSigned ? 'bg-primary' : (index === 0 ? 'bg-primary' : 'bg-muted')}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Contract Status */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Stav zmluvy: {info.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium">{info.seller} (Predávajúci)</p>
                      <p className="text-sm text-muted-foreground">Podpísané: {info.created} 14:30</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm">Podpísané</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSigned ? 'bg-chart-2/30' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                      {isSigned ? (
                        <Check className="h-4 w-4 text-chart-2" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{info.buyer} (Kupujúci)</p>
                      <p className="text-sm text-muted-foreground">
                        {isSigned ? `Podpísané: ${info.created} 15:45` : 'Čaká na podpis'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${isSigned ? 'bg-chart-2/20 text-chart-2' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
                    {isSigned ? 'Podpísané' : 'Čaká'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">Detaily zmluvy</h4>
                  <div className="text-sm text-primary/80 space-y-1">
                    <p><strong>Predmet:</strong> {info.subject}</p>
                    <p><strong>Kúpna cena:</strong> {info.price}</p>
                    <p><strong>Vytvorené:</strong> {info.created}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="p-6">
            {!isSigned ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Čakáme na podpis druhej strany...</p>
                <Button onClick={handleSimulateSignature} data-testid="button-simulate-signature">
                  Simulovať podpis druhej strany
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold text-chart-2">Zmluva úspešne podpísaná!</h3>
                <p className="text-muted-foreground">
                  Všetky strany podpísali zmluvu. Proces je kompletný.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <Button variant="outline" onClick={() => setLocation('/my-contracts')} data-testid="button-view-contracts">
                    Zobraziť moje zmluvy
                  </Button>
                  <Button onClick={() => setLocation('/virtual-office')} data-testid="button-back-office">
                    Späť do virtuálnej kancelárie
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Card>
      </div>
    </div>
  );
}
