import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface CompletedTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function CompletedTransactionModal({ open, onOpenChange, transactionId }: CompletedTransactionModalProps) {
  if (transactionId !== 'bmw-x5') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-completed-transaction">
        <DialogHeader>
          <DialogTitle>Prevod vozidla - BMW X5</DialogTitle>
        </DialogHeader>
        
        <div>
          {/* Transaction Status */}
          <div className="bg-chart-2/20 p-4 rounded-lg border border-chart-2/40 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-chart-2/30 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-chart-2">Transakcia dokončená</h4>
                <p className="text-chart-2">Prevod vozidla bol úspešne dokončený 12.12.2024</p>
              </div>
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-background p-4 rounded-lg border">
              <h5 className="font-medium mb-3">Detaily vozidla</h5>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Značka a model:</strong> BMW X5</p>
                <p><strong>Rok výroby:</strong> 2020</p>
                <p><strong>VIN:</strong> WBAXG71020P123456</p>
                <p><strong>EČV:</strong> BL789XY</p>
                <p><strong>Najazdené km:</strong> 45 000 km</p>
                <p><strong>Farba:</strong> Čierna metalíza</p>
              </div>
            </div>
            
            <div className="bg-background p-4 rounded-lg border">
              <h5 className="font-medium mb-3">Strany transakcie</h5>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <p><strong>Predávajúci:</strong></p>
                  <p>Peter Kováč</p>
                  <p>RČ: 751015/1234</p>
                  <p>Email: peter.kovac@email.sk</p>
                </div>
                <div className="mt-3">
                  <p><strong>Kupujúca:</strong></p>
                  <p>Anna Nováková</p>
                  <p>RČ: 825203/5678</p>
                  <p>Email: anna.novakova@email.sk</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Financial Details */}
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-6">
            <h5 className="font-medium text-primary mb-3">Finančné detaily</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-primary/80"><strong>Kúpna cena:</strong></p>
                <p className="text-lg font-bold text-primary">35 000 €</p>
              </div>
              <div>
                <p className="text-primary/80"><strong>Poplatok DN:</strong></p>
                <p className="text-lg font-bold text-primary">65 €</p>
              </div>
              <div>
                <p className="text-primary/80"><strong>Celkom:</strong></p>
                <p className="text-lg font-bold text-primary">35 065 €</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-primary/80">
              <p><strong>Platba dokončená:</strong> 11.12.2024 09:15</p>
              <p><strong>Spôsob platby:</strong> Bankovým prevodom cez Escrow</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-background p-4 rounded-lg border mb-6">
            <h5 className="font-medium mb-4">Časová os transakcie</h5>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Zmluva podpísaná</p>
                  <p className="text-xs text-muted-foreground">10.12.2024 14:30</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Platba potvrdená</p>
                  <p className="text-xs text-muted-foreground">11.12.2024 09:15</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-chart-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Prevod dokončený</p>
                  <p className="text-xs text-muted-foreground">12.12.2024 15:00</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Documents */}
          <div className="bg-background p-4 rounded-lg border">
            <h5 className="font-medium mb-4">Dokumenty</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Kúpno-predajná zmluva</p>
                    <p className="text-sm text-muted-foreground">BMW X5 - podpísané oboma stranami</p>
                  </div>
                </div>
                <button className="text-primary hover:underline text-sm" data-testid="button-download-contract">Stiahnuť</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Potvrdenie z úradu</p>
                    <p className="text-sm text-muted-foreground">Registrácia zmeny držiteľa</p>
                  </div>
                </div>
                <button className="text-primary hover:underline text-sm" data-testid="button-download-confirmation">Stiahnuť</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-transaction">
            Zavrieť
          </Button>
          <Button variant="secondary" onClick={() => window.print()} data-testid="button-print-summary">
            Tlačiť súhrn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
