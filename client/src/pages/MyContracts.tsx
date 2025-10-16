import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

export default function MyContracts() {
  const [, setLocation] = useLocation();

  const handleShowContract = (type: string) => {
    console.log('Showing contract:', type);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-4">Moje zmluvy</h2>
          
          <div className="space-y-3">
            {/* Prevod vozidla BMW X5 - Completed */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Prevod vozidla - BMW X5</h3>
                  <p className="text-sm text-muted-foreground mb-2">Vytvorené: 10.12.2024</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p><strong>Predávajúci:</strong> Peter Kováč</p>
                    <p><strong>Kupujúci:</strong> Anna Nováková</p>
                    <p><strong>Vozidlo:</strong> BMW X5 2020</p>
                    <p><strong>Kúpna cena:</strong> 35 000 €</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm">Podpísané</span>
                  <button onClick={() => handleShowContract('bmw-x5')} className="text-primary hover:underline text-sm" data-testid="button-show-bmw">
                    Zobraziť
                  </button>
                </div>
              </div>
            </Card>

            {/* Kúpno-predajná zmluva - Rodinný dom - Active */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Kúpno-predajná zmluva - Rodinný dom</h3>
                  <p className="text-sm text-muted-foreground mb-2">Vytvorené: 20.12.2024</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p><strong>Predávajúci:</strong> Ján Novák</p>
                    <p><strong>Kupujúci:</strong> Mária Svobodová</p>
                    <p><strong>Nehnuteľnosť:</strong> Rodinný dom, Bratislava</p>
                    <p><strong>Kúpna cena:</strong> 250 000 €</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">Čaká na podpis</span>
                  <button onClick={() => handleShowContract('house')} className="text-primary hover:underline text-sm" data-testid="button-show-house">
                    Zobraziť
                  </button>
                </div>
              </div>
            </Card>

            {/* Predaj vozidla - Škoda Octavia - Active */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Predaj vozidla - Škoda Octavia</h3>
                  <p className="text-sm text-muted-foreground mb-2">Vytvorené: 22.12.2024</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p><strong>Predávajúci:</strong> Ján Novák</p>
                    <p><strong>Kupujúci:</strong> Tomáš Horváth</p>
                    <p><strong>Vozidlo:</strong> Škoda Octavia 2019, 85 000 km</p>
                    <p><strong>Kúpna cena:</strong> 18 500 €</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">Čaká na podpis</span>
                  <button onClick={() => handleShowContract('octavia')} className="text-primary hover:underline text-sm" data-testid="button-show-octavia">
                    Zobraziť
                  </button>
                </div>
              </div>
            </Card>

            {/* Splnomocnenie - Zastupovanie na úrade - Active */}
            <Card className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Splnomocnenie - Zastupovanie na úrade</h3>
                  <p className="text-sm text-muted-foreground mb-2">Vytvorené: 21.12.2024</p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p><strong>Splnomocniteľ:</strong> Ján Novák</p>
                    <p><strong>Splnomocnenec:</strong> Peter Kováč</p>
                    <p><strong>Účel:</strong> Zastupovanie na katastrálnom úrade</p>
                    <p><strong>Platnosť:</strong> Do 31.12.2024</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">Čaká na podpis</span>
                  <button onClick={() => handleShowContract('power-attorney')} className="text-primary hover:underline text-sm" data-testid="button-show-attorney">
                    Zobraziť
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
