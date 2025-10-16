import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import { CompletedTransactionModal } from "@/components/CompletedTransactionModal";
import { Plus, CheckCircle, Copy } from "lucide-react";

type ViewType = 'create' | 'list' | 'created';

export default function VirtualOffice() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<ViewType>('create');
  const [meetingLink] = useState('https://digital-notary.sk/meeting/ABC123XYZ');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleCreateOffice = () => {
    setCurrentView('created');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  const handleSendEmail = () => {
    console.log('Sending email...');
  };

  const handleResetOfficeCreation = () => {
    setCurrentView('create');
  };

  const handleShowMyOffices = () => {
    setCurrentView('list');
  };

  const handleShowCreateView = () => {
    setCurrentView('create');
  };

  const handleOpenTransaction = (transactionId: string) => {
    setSelectedTransaction(transactionId);
  };

  const handleContinueProcess = (processType: string) => {
    setLocation(`/digital-signing/${processType}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-4">Virtuálna kancelária</h2>

          {/* Create Office View */}
          {currentView === 'create' && (
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Vytvorte virtuálnu kanceláriu</h3>
              <p className="text-muted-foreground mb-6">Vygenerujte link pre stretnutie s druhou stranou</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleCreateOffice} data-testid="button-create-office">
                  Vytvoriť virtuálnu kanceláriu
                </Button>
                <Button variant="outline" onClick={handleShowMyOffices} data-testid="button-my-offices">
                  Moje virtuálne kancelárie
                </Button>
              </div>
            </Card>
          )}

          {/* My Virtual Offices View */}
          {currentView === 'list' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Moje virtuálne kancelárie</h3>
              <div className="space-y-4">
                {/* Completed transaction */}
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Prevod vozidla - BMW X5</h4>
                      <p className="text-sm text-muted-foreground">Vytvorené: 10.12.2024 | Dokončené: 12.12.2024</p>
                    </div>
                    <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm">Dokončené</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Strany:</strong> Peter Kováč → Anna Nováková</p>
                    <p><strong>Cena:</strong> 35 000 €</p>
                    <p><strong>Stav:</strong> Prevod dokončený, dokumenty odoslané</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleOpenTransaction('bmw-x5')} data-testid="button-open-bmw">
                    Otvoriť
                  </Button>
                </Card>

                {/* Active transaction - House sale */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Kúpno-predajná zmluva - Rodinný dom</h4>
                      <p className="text-sm text-muted-foreground">Vytvorené: 20.12.2024 | Aktívne</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">Aktívne</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Strany:</strong> Ján Novák → Mária Svobodová</p>
                    <p><strong>Cena:</strong> 250 000 €</p>
                    <p><strong>Stav:</strong> Čaká na podpis druhej strany</p>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => handleContinueProcess('house')} data-testid="button-continue-house">
                    Pokračovať v procese
                  </Button>
                </Card>

                {/* Active transaction - Vehicle Sale */}
                <Card className="p-4 bg-green-50 dark:bg-green-950/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Predaj vozidla - Škoda Octavia</h4>
                      <p className="text-sm text-muted-foreground">Vytvorené: 22.12.2024 | Aktívne</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">Aktívne</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Strany:</strong> Ján Novák → Tomáš Horváth</p>
                    <p><strong>Vozidlo:</strong> Škoda Octavia 2019, 85 000 km</p>
                    <p><strong>Cena:</strong> 18 500 €</p>
                    <p><strong>Stav:</strong> Čaká na podpis kupujúceho</p>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => handleContinueProcess('vehicle')} data-testid="button-continue-vehicle">
                    Pokračovať v procese
                  </Button>
                </Card>

                {/* Active transaction - Power of Attorney */}
                <Card className="p-4 bg-orange-50 dark:bg-orange-950/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Splnomocnenie - Zastupovanie na úrade</h4>
                      <p className="text-sm text-muted-foreground">Vytvorené: 21.12.2024 | Aktívne</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">Aktívne</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Strany:</strong> Ján Novák → Peter Kováč</p>
                    <p><strong>Účel:</strong> Zastupovanie na katastrálnom úrade</p>
                    <p><strong>Stav:</strong> Pripravené na podpis</p>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => handleContinueProcess('attorney')} data-testid="button-continue-attorney">
                    Pokračovať v procese
                  </Button>
                </Card>
              </div>
              <Button variant="outline" onClick={handleShowCreateView} className="mt-6 w-full" data-testid="button-back-create">
                Späť na vytvorenie kancelárie
              </Button>
            </Card>
          )}

          {/* Office Created View */}
          {currentView === 'created' && (
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="text-lg font-medium mb-2">Virtuálna kancelária vytvorená</h3>
                <p className="text-muted-foreground mb-4">Pošlite tento link druhej strane</p>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-4">
                <Label className="block text-sm font-medium mb-2">Link na stretnutie:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    readOnly
                    value={meetingLink}
                    className="flex-1"
                    data-testid="input-meeting-link"
                  />
                  <Button variant="outline" onClick={handleCopyLink} data-testid="button-copy-link">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <Label className="block text-sm font-medium mb-2">Email adresa druhej strany:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    className="flex-1"
                    data-testid="input-recipient-email"
                  />
                  <Button onClick={handleSendEmail} data-testid="button-send-email">
                    Poslať
                  </Button>
                </div>
              </div>

              <Button variant="outline" onClick={handleResetOfficeCreation} className="w-full" data-testid="button-new-office">
                Vytvoriť novú kanceláriu
              </Button>
            </Card>
          )}
        </Card>
      </div>

      <CompletedTransactionModal 
        open={selectedTransaction !== null} 
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
        transactionId={selectedTransaction || ''}
      />
    </div>
  );
}
