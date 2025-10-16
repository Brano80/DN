import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContractDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType: string;
}

export function ContractDetailModal({ open, onOpenChange, contractType }: ContractDetailModalProps) {
  const getContractContent = () => {
    switch(contractType) {
      case 'bmw-x5':
        return (
          <div className="bg-background border border-border p-8 text-sm leading-relaxed">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">KÚPNO-PREDAJNÁ ZMLUVA</h2>
              <p className="text-muted-foreground">na predaj motorového vozidla</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">PREDÁVAJÚCI:</p>
                  <p>Peter Kováč</p>
                  <p>Rodné číslo: 751015/1234</p>
                  <p>Bydlisko: Hlavná 123, 811 01 Bratislava</p>
                  <p>Email: peter.kovac@email.sk</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KUPUJÚCA:</p>
                  <p>Anna Nováková</p>
                  <p>Rodné číslo: 825203/5678</p>
                  <p>Bydlisko: Nová 456, 821 01 Bratislava</p>
                  <p>Email: anna.novakova@email.sk</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-3">PREDMET ZMLUVY - MOTOROVÉ VOZIDLO:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Značka a typ:</strong> BMW X5</p>
                      <p><strong>Rok výroby:</strong> 2020</p>
                      <p><strong>VIN číslo:</strong> WBAXG71020P123456</p>
                      <p><strong>Evidenčné číslo:</strong> BL789XY</p>
                    </div>
                    <div>
                      <p><strong>Objem motora:</strong> 2993 cm³</p>
                      <p><strong>Výkon motora:</strong> 195 kW</p>
                      <p><strong>Palivo:</strong> Nafta</p>
                      <p><strong>Najazdené km:</strong> 45 000 km</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">KÚPNA CENA A PLATOBNÉ PODMIENKY:</p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-bold text-primary">Kúpna cena: 35 000,00 EUR</p>
                  <p className="text-sm mt-2">Platba: Bankovým prevodom</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa 10.12.2024</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Peter Kováč</p>
                      <p className="text-sm text-muted-foreground">predávajúci</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa 10.12.2024</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Anna Nováková</p>
                      <p className="text-sm text-muted-foreground">kupujúca</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'house':
        return (
          <div className="bg-background border border-border p-8 text-sm leading-relaxed">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">KÚPNO-PREDAJNÁ ZMLUVA</h2>
              <p className="text-muted-foreground">na predaj nehnuteľnosti</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">PREDÁVAJÚCI:</p>
                  <p>Ján Novák</p>
                  <p>Rodné číslo: 801201/1234</p>
                  <p>Bydlisko: Hlavná 456, 811 02 Bratislava</p>
                  <p>Email: jan.novak@email.sk</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KUPUJÚCA:</p>
                  <p>Mária Svobodová</p>
                  <p>Rodné číslo: 851015/5678</p>
                  <p>Bydlisko: Nová 456, 821 01 Bratislava</p>
                  <p>Email: maria.svobodova@email.sk</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-3">PREDMET ZMLUVY - NEHNUTEĽNOSŤ:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Typ:</strong> Rodinný dom</p>
                      <p><strong>Výmera pozemku:</strong> 600 m²</p>
                      <p><strong>Obytná plocha:</strong> 180 m²</p>
                    </div>
                    <div>
                      <p><strong>Adresa:</strong> Bratislava</p>
                      <p><strong>Číslo LV:</strong> 5678</p>
                      <p><strong>Parcela č.:</strong> 890/12</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">KÚPNA CENA A PLATOBNÉ PODMIENKY:</p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-bold text-primary">Kúpna cena: 250 000,00 EUR</p>
                  <p className="text-sm mt-2">Platba: Bankovým prevodom</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa 20.12.2024</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Ján Novák</p>
                      <p className="text-sm text-muted-foreground">predávajúci</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa ___________</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Mária Svobodová</p>
                      <p className="text-sm text-muted-foreground">kupujúca</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'octavia':
        return (
          <div className="bg-background border border-border p-8 text-sm leading-relaxed">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">KÚPNO-PREDAJNÁ ZMLUVA</h2>
              <p className="text-muted-foreground">na predaj motorového vozidla</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">PREDÁVAJÚCI:</p>
                  <p>Ján Novák</p>
                  <p>Rodné číslo: 801201/1234</p>
                  <p>Bydlisko: Hlavná 123, 811 01 Bratislava</p>
                  <p>Email: jan.novak@email.sk</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">KUPUJÚCI:</p>
                  <p>Tomáš Horváth</p>
                  <p>Rodné číslo: 850615/9876</p>
                  <p>Bydlisko: Nová 789, 821 01 Bratislava</p>
                  <p>Email: tomas.horvath@email.sk</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-3">PREDMET ZMLUVY - MOTOROVÉ VOZIDLO:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Značka a typ:</strong> Škoda Octavia Combi</p>
                      <p><strong>Rok výroby:</strong> 2019</p>
                      <p><strong>VIN číslo:</strong> TMBJF7NE5K0123456</p>
                      <p><strong>Evidenčné číslo:</strong> BA456CD</p>
                    </div>
                    <div>
                      <p><strong>Objem motora:</strong> 1598 cm³</p>
                      <p><strong>Výkon motora:</strong> 85 kW</p>
                      <p><strong>Palivo:</strong> Benzín</p>
                      <p><strong>Najazdené km:</strong> 85 000 km</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">KÚPNA CENA A PLATOBNÉ PODMIENKY:</p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-bold text-primary">Kúpna cena: 18 500,00 EUR</p>
                  <p className="text-sm mt-2">Platba: Bankovým prevodom do 7 dní od podpisu zmluvy</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa 22.12.2024</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Ján Novák</p>
                      <p className="text-sm text-muted-foreground">predávajúci</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa ___________</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Tomáš Horváth</p>
                      <p className="text-sm text-muted-foreground">kupujúci</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'power-attorney':
        return (
          <div className="bg-background border border-border p-8 text-sm leading-relaxed">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">SPLNOMOCNENIE</h2>
              <p className="text-muted-foreground">na zastupovanie</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-2">SPLNOMOCNITEĽ:</p>
                  <p>Ján Novák</p>
                  <p>Rodné číslo: 801201/1234</p>
                  <p>Bydlisko: Hlavná 456, 811 02 Bratislava</p>
                  <p>Email: jan.novak@email.sk</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">SPLNOMOCNENEC:</p>
                  <p>Peter Kováč</p>
                  <p>Rodné číslo: 751015/1234</p>
                  <p>Bydlisko: Hlavná 123, 811 01 Bratislava</p>
                  <p>Email: peter.kovac@email.sk</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-3">ROZSAH SPLNOMOCNENIA:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <p><strong>Účel:</strong> Zastupovanie na katastrálnom úrade</p>
                    <p><strong>Platnosť:</strong> Do 31.12.2024</p>
                    <p><strong>Rozsah:</strong> Podanie žiadostí, preberanie dokumentov, zastupovanie v konaniach</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">PRÁVA SPLNOMOCNENCA:</p>
                <p className="text-sm">Splnomocnenec je oprávnený konať v mene splnomocniteľa vo všetkých úkonoch týkajúcich sa katastrálneho konania podľa vyššie uvedeného účelu.</p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa 21.12.2024</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Ján Novák</p>
                      <p className="text-sm text-muted-foreground">splnomocniteľ</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="mb-4">V Bratislave, dňa ___________</p>
                    <div className="border-t border-border pt-2">
                      <p className="font-semibold">Peter Kováč</p>
                      <p className="text-sm text-muted-foreground">splnomocnenec</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Zmluva nenájdená</div>;
    }
  };

  const getTitle = () => {
    switch(contractType) {
      case 'bmw-x5':
        return 'Prevod vozidla - BMW X5';
      case 'house':
        return 'Kúpno-predajná zmluva - Rodinný dom';
      case 'octavia':
        return 'Predaj vozidla - Škoda Octavia';
      case 'power-attorney':
        return 'Splnomocnenie - Zastupovanie na úrade';
      default:
        return 'Detail zmluvy';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-contract-detail">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {getContractContent()}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-contract">
            Zavrieť
          </Button>
          <Button onClick={() => window.print()} data-testid="button-print-contract">
            Tlačiť
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
