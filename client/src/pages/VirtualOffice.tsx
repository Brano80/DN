import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import { CompletedTransactionModal } from "@/components/CompletedTransactionModal";
import { SelectContractDialog } from "@/components/SelectContractDialog";
import { ContractDetailModal } from "@/components/ContractDetailModal";
import { DigitalSigningDialog } from "@/components/DigitalSigningDialog";
import { Plus, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VirtualOffice as VirtualOfficeType, Contract } from "@shared/schema";

type ViewType = 'create' | 'list';

const getStatusDisplay = (status: string | null): { text: string; className: string } => {
  switch (status) {
    case 'active':
      return { text: 'Aktívna', className: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
    case 'pending':
      return { text: 'Čaká', className: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
    case 'completed':
      return { text: 'Dokončená', className: 'bg-chart-2/20 text-chart-2' };
    default:
      return { text: 'Aktívna', className: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
  }
};

export default function VirtualOffice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute("/virtual-office/:id");
  const officeId = match ? params?.id : null;
  
  const [currentView, setCurrentView] = useState<ViewType>('create');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [officeName, setOfficeName] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [showSelectContract, setShowSelectContract] = useState(false);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const [showSigning, setShowSigning] = useState(false);

  // Load office data if ID is present
  const { data: office, isLoading: isLoadingOffice } = useQuery<VirtualOfficeType>({
    queryKey: [`/api/virtual-offices/${officeId}`],
    enabled: !!officeId,
  });

  // Load contract data for the office (for signing dialog)
  const { data: contract } = useQuery<Contract>({
    queryKey: [`/api/contracts/${office?.contractId}`],
    enabled: !!office?.contractId,
  });

  // Load all offices for the list view
  const ownerEmail = "jan.novak@example.com"; // TODO: Get from auth
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery<VirtualOfficeType[]>({
    queryKey: [`/api/virtual-offices?ownerEmail=${ownerEmail}`],
    enabled: currentView === 'list',
  });

  const createOfficeMutation = useMutation({
    mutationFn: async (data: { name: string; invitedEmail: string }) => {
      const response = await apiRequest("POST", "/api/virtual-offices", {
        name: data.name,
        ownerEmail: "jan.novak@example.com", // TODO: Get from auth
        invitedEmail: data.invitedEmail,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kancelária vytvorená",
        description: `Email odoslaný na ${data.invitedEmail}`,
      });
      // Invalidate offices list cache
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices?ownerEmail=${ownerEmail}`] });
      // Redirect to the new office
      setLocation(`/virtual-office/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť kanceláriu",
        variant: "destructive",
      });
    },
  });

  const attachContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const response = await apiRequest("PATCH", `/api/virtual-offices/${officeId}`, {
        contractId: contractId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices/${officeId}`] });
      toast({
        title: "Zmluva pripojená",
        description: "Zmluva bola úspešne pripojená k virtuálnej kancelárii",
      });
    },
    onError: () => {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pripojiť zmluvu",
        variant: "destructive",
      });
    },
  });

  const completeSigningMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/virtual-offices/${officeId}`, {
        status: 'completed',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices/${officeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices?ownerEmail=${ownerEmail}`] });
      toast({
        title: "Podpísané",
        description: "Zmluva bola úspešne podpísaná",
      });
    },
    onError: () => {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa dokončiť podpisovanie",
        variant: "destructive",
      });
    },
  });

  const handleCreateOffice = () => {
    if (!officeName || !invitedEmail) {
      toast({
        title: "Chyba",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    createOfficeMutation.mutate({
      name: officeName,
      invitedEmail: invitedEmail,
    });
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

  const handleCompleteSigning = () => {
    completeSigningMutation.mutate();
  };

  // Show detail view if we have an office ID
  if (officeId) {
    if (isLoadingOffice) {
      return (
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <BackButton onClick={() => setLocation('/virtual-office')} />
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground" data-testid="text-loading">Načítava sa kancelária...</p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (!office) {
      return (
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <BackButton onClick={() => setLocation('/virtual-office')} />
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground" data-testid="text-not-found">Kancelária nebola nájdená</p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    // Office detail view
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <BackButton onClick={() => setLocation('/virtual-office')} />
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2" data-testid="text-office-name">{office.name}</h2>
              <p className="text-muted-foreground">Virtuálna kancelária</p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vlastník</Label>
                  <p className="mt-1" data-testid="text-owner-email">{office.ownerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Pozvaná strana</Label>
                  <p className="mt-1" data-testid="text-invited-email">{office.invitedEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Stav</Label>
                  <p className="mt-1" data-testid="text-office-status">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusDisplay(office.status).className}`}>
                      {getStatusDisplay(office.status).text}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-4">Zmluva</h3>
                {!office.contractId ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSelectContract(true)}
                    data-testid="button-upload-contract"
                  >
                    Nahrať zmluvu z "Moje zmluvy"
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Pripojená zmluva:</p>
                      <p className="font-medium" data-testid="text-attached-contract-id">ID: {office.contractId}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowSelectContract(true)}
                        data-testid="button-change-contract"
                      >
                        Zmeniť zmluvu
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setViewContractId(office.contractId)}
                        data-testid="button-view-contract"
                      >
                        Zobraziť zmluvu
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow Progress */}
              {office.contractId && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Priebeh procesu</h3>
                  <div className="space-y-3">
                    {/* Step 1: Contract attached */}
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg" data-testid="workflow-step-contract">
                      <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-chart-2" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Zmluva pripojená</p>
                        <p className="text-sm text-muted-foreground">Zmluva bola úspešne pripojená k virtuálnej kancelárii</p>
                      </div>
                      <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm">Dokončené</span>
                    </div>

                    {/* Step 2: Waiting for signatures */}
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg" data-testid="workflow-step-signing">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        office.status === 'completed' 
                          ? 'bg-chart-2/30' 
                          : 'bg-yellow-100 dark:bg-yellow-900'
                      }`}>
                        {office.status === 'completed' ? (
                          <Check className="h-4 w-4 text-chart-2" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Digitálne podpísanie</p>
                        <p className="text-sm text-muted-foreground">
                          {office.status === 'completed' 
                            ? 'Zmluva bola podpísaná oboma stranami' 
                            : 'Čaká na podpis oboch strán'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        office.status === 'completed'
                          ? 'bg-chart-2/20 text-chart-2'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {office.status === 'completed' ? 'Dokončené' : 'Čaká'}
                      </span>
                    </div>

                    {/* Step 3: Process completed (only show if completed) */}
                    {office.status === 'completed' && (
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg" data-testid="workflow-step-completed">
                        <div className="w-8 h-8 bg-chart-2/30 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-chart-2" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Proces dokončený</p>
                          <p className="text-sm text-muted-foreground">Zmluva je platná a proces je dokončený</p>
                        </div>
                        <span className="px-3 py-1 bg-chart-2/20 text-chart-2 rounded-full text-sm">Dokončené</span>
                      </div>
                    )}

                    {/* Action button */}
                    {office.status !== 'completed' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => setShowSigning(true)}
                        data-testid="button-start-signing"
                      >
                        Začať digitálne podpisovanie
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </Card>
        </div>

        <SelectContractDialog
          open={showSelectContract}
          onOpenChange={setShowSelectContract}
          onSelectContract={(contractId) => attachContractMutation.mutate(contractId)}
          ownerEmail="jan.novak@example.com"
        />
        
        <ContractDetailModal
          open={viewContractId !== null}
          onOpenChange={(open) => !open && setViewContractId(null)}
          contractId={viewContractId}
        />

        <DigitalSigningDialog
          open={showSigning}
          onOpenChange={setShowSigning}
          contractName={contract?.title || office?.name || ''}
          onComplete={handleCompleteSigning}
        />
      </div>
    );
  }

  // Otherwise show create/list view
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => setLocation('/')} />
          <h2 className="text-2xl font-semibold mb-4">Virtuálna kancelária</h2>

          {/* Create Office View */}
          {currentView === 'create' && (
            <Card className="p-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-center">Vytvorte virtuálnu kanceláriu</h3>
              <p className="text-muted-foreground mb-6 text-center">Zadajte detaily pre novú virtuálnu kanceláriu</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="office-name" className="block text-sm font-medium mb-2">
                    Názov virtuálnej kancelárie
                  </Label>
                  <Input
                    id="office-name"
                    type="text"
                    placeholder="napr. Predaj vozidla - Škoda Octavia"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    data-testid="input-office-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invited-email" className="block text-sm font-medium mb-2">
                    Email adresa druhej strany
                  </Label>
                  <Input
                    id="invited-email"
                    type="email"
                    placeholder="email@example.com"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    data-testid="input-invited-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleCreateOffice} 
                  disabled={createOfficeMutation.isPending}
                  data-testid="button-create-office"
                >
                  {createOfficeMutation.isPending ? "Vytvára sa..." : "Vytvoriť novú kanceláriu"}
                </Button>
                <Button variant="outline" onClick={handleShowMyOffices} data-testid="button-my-offices">
                  Moje virtuálne kancelárie
                </Button>
              </div>
            </Card>
          )}

          {/* My Virtual Offices View */}
          {currentView === 'list' && (
            <div className="bg-white dark:bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Moje virtuálne kancelárie</h3>
              
              {isLoadingOffices ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground" data-testid="text-loading-offices">Načítava sa...</p>
                </div>
              ) : offices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4" data-testid="text-no-offices">Zatiaľ nemáte žiadne virtuálne kancelárie</p>
                  <Button onClick={handleShowCreateView} data-testid="button-create-first">
                    Vytvoriť prvú kanceláriu
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {offices.map((office) => {
                    const createdDate = office.createdAt 
                      ? new Date(office.createdAt).toLocaleDateString('sk-SK')
                      : 'Neznámy dátum';
                    
                    // DN v51 style - determine colors based on status
                    const getBgColor = () => {
                      if (office.status === 'completed') return 'bg-gray-50 dark:bg-gray-800/50';
                      if (office.name === 'Predaj vozidla - Škoda Octavia') return 'bg-green-50 dark:bg-green-900/20';
                      if (office.status === 'active') return 'bg-blue-50 dark:bg-blue-900/20';
                      return 'bg-orange-50 dark:bg-orange-900/20';
                    };
                    
                    const getBorderColor = () => {
                      if (office.status === 'completed') return 'border-gray-200 dark:border-gray-700';
                      if (office.name === 'Predaj vozidla - Škoda Octavia') return 'border-green-200 dark:border-green-800';
                      if (office.status === 'active') return 'border-blue-200 dark:border-blue-800';
                      return 'border-orange-200 dark:border-orange-800';
                    };
                    
                    const getStatusBadge = () => {
                      if (office.status === 'completed') {
                        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
                      }
                      if (office.name === 'Predaj vozidla - Škoda Octavia') {
                        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
                      }
                      if (office.status === 'active') {
                        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
                      }
                      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
                    };
                    
                    const getButtonStyle = () => {
                      if (office.status === 'completed') {
                        return 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800';
                      }
                      if (office.name === 'Predaj vozidla - Škoda Octavia') {
                        return 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800';
                      }
                      if (office.status === 'active') {
                        return 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
                      }
                      return 'bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800';
                    };
                    
                    const isSkodaExample = office.name === 'Predaj vozidla - Škoda Octavia';
                    
                    // DN v51: Škoda Octavia is ACTIVE (green), not completed
                    const getStatusText = () => {
                      if (isSkodaExample) return 'Aktívne';
                      return office.status === 'completed' ? 'Dokončené' : 'Aktívne';
                    };
                    
                    const displayDate = isSkodaExample ? 'Vytvorené: 22.12.2024 | Aktívne' : `Vytvorené: ${createdDate}`;
                    const buttonText = isSkodaExample ? 'Pokračovať v procese' : (office.status === 'completed' ? 'Otvoriť' : 'Pokračovať v procese');
                    
                    return (
                      <div 
                        key={office.id} 
                        className={`p-4 rounded-lg border ${getBgColor()} ${getBorderColor()}`}
                        data-testid={`card-office-${office.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200" data-testid={`text-office-name-${office.id}`}>
                              {office.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {displayDate}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge()}`}>
                            {getStatusText()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {isSkodaExample ? (
                            <>
                              <p><strong>Strany:</strong> Ján Novák → Tomáš Horváth</p>
                              <p><strong>Vozidlo:</strong> Škoda Octavia 2019, 85 000 km</p>
                              <p><strong>Cena:</strong> 18 500 €</p>
                              <p><strong>Stav:</strong> Čaká na podpis kupujúceho</p>
                            </>
                          ) : (
                            <>
                              <p><strong>Vlastník:</strong> {office.ownerEmail}</p>
                              <p><strong>Pozvaná strana:</strong> {office.invitedEmail}</p>
                              {office.contractId && (
                                <p><strong>Zmluva:</strong> Pripojená (ID: {office.contractId.substring(0, 8)}...)</p>
                              )}
                            </>
                          )}
                        </div>
                        <button 
                          className={`mt-3 px-4 py-2 rounded-lg text-sm transition-colors ${getButtonStyle()}`}
                          onClick={() => setLocation(`/virtual-office/${office.id}`)}
                          data-testid={`button-open-office-${office.id}`}
                        >
                          {buttonText}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button 
                onClick={handleShowCreateView} 
                className="mt-6 w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                data-testid="button-back-create"
              >
                Späť na vytvorenie kancelárie
              </button>
            </div>
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
