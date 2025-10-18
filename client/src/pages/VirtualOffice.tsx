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
  const [showWorkflowProgress, setShowWorkflowProgress] = useState(false);

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

    // Office detail view - DN v51 style
    const isSkodaOffice = office.name === 'Predaj vozidla - Škoda Octavia';
    const isCompleted = office.status === 'completed';
    
    // Workflow Progress View
    if (showWorkflowProgress) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-background p-4">
          <div className="max-w-5xl mx-auto">
            {/* Back Navigation */}
            <button 
              onClick={() => setShowWorkflowProgress(false)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Späť na virtuálnu kanceláriu</span>
            </button>

            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-6">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                {office.name}
              </h1>

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Priebeh procesu</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Krok 1 z 7</span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center space-x-2 mb-8">
                  {/* Step 1 - Active */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      1
                    </div>
                    <div className="h-1 w-full bg-blue-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-300 font-medium">Podpis<br/>zmluvy</p>
                  </div>

                  {/* Step 2 - Inactive */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      2
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Platba</p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      3
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Podanie na<br/>úrad</p>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      4
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Registrácia</p>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      5
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Notárska<br/>zápisnica</p>
                  </div>

                  {/* Step 6 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      6
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Archivácia</p>
                  </div>

                  {/* Step 7 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-2">
                      7
                    </div>
                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Dokončené</p>
                  </div>
                </div>
              </div>

              {/* Main Content Card */}
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                  Stav transakcie: {isSkodaOffice ? 'Predaj motorového vozidla' : 'Predaj vozidla'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Participants */}
                  <div className="space-y-4">
                    {/* Seller */}
                    <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ján Novák</h4>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                              Podpísané
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">(Predávajúci)</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Podpísané: 20.12.2024 14:30
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buyer */}
                    <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tomáš Horváth</h4>
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium">
                              Čaká
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">(Kupujúci)</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Čaká na podpis
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Vehicle Details */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily vozidla</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Vozidlo:</strong> Škoda Octavia Combi</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Rok výroby:</strong> 2019</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>VIN:</strong> TMBJF7NE5K0123456</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>EČV:</strong> BA456CD</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Najazdené km:</strong> 85 000 km</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Kúpna cena:</strong> 18 500 €</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewContractId(office.contractId || null)}
                      className="w-full mt-4 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
                      data-testid="button-view-contract"
                    >
                      Náhľad zmluvy
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-6">
                <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                  Čakáme na podpis kupujúceho...
                </p>
                <button
                  onClick={() => setShowSigning(true)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                  data-testid="button-simulate-buyer-sign"
                >
                  Simulovať podpis kupujúceho
                </button>
              </div>
            </div>
          </div>

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
    
    // Detail View
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* DN v51 Header */}
          <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border">
            <div className="p-6 border-b border-gray-200 dark:border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200" data-testid="text-office-name">
                {office.name}
              </h2>
              <button 
                onClick={() => setLocation('/virtual-office')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success Banner - DN v51 style */}
            {isCompleted && (
              <div className="mx-6 mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Transakcia dokončená</h3>
                    <p className="text-green-700 dark:text-green-300">Prevod vozidla bol úspešne dokončený 12.12.2024</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - DN v51 2-column layout */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column - Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {isSkodaOffice ? 'Detaily vozidla' : 'Detaily kancelárie'}
                  </h3>
                  <div className="space-y-3">
                    {isSkodaOffice ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Značka a model</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Škoda Octavia</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Rok výroby</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">2019</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Najazdené km</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">85 000 km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Farba</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Čierna metalíza</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vlastník</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200" data-testid="text-owner-email">{office.ownerEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Stav</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-200" data-testid="text-office-status">
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusDisplay(office.status).className}`}>
                              {getStatusDisplay(office.status).text}
                            </span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column - Parties */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {isSkodaOffice ? 'Strany transakcie' : 'Účastníci'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {isSkodaOffice ? 'Predávajúci' : 'Pozvaná strana'}
                      </p>
                      {isSkodaOffice ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Ján Novák</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">RČ: 801201/1234</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email: jan.novak@example.com</p>
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-800 dark:text-gray-200" data-testid="text-invited-email">{office.invitedEmail}</p>
                      )}
                    </div>
                    {isSkodaOffice && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Kupujúci</p>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Tomáš Horváth</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">RČ: 850615/5678</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email: tomas.horvath@example.com</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Details - DN v51 style */}
              {isSkodaOffice && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">Finančné detaily</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Kúpna cena:</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">18 500 €</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Poplatok DN:</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">65 €</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Celkom:</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">18 565 €</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Platba dokončená:</strong> 11.12.2024 09:15</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Spôsob platby:</strong> Bankovým prevodom cez Escrow</p>
                  </div>
                </div>
              )}

              {/* Timeline - DN v51 style */}
              {isSkodaOffice && isCompleted && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Časová os transakcie</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Zmluva podpísaná</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">10.12.2024 14:30</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Platba potvrdená</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">11.12.2024 09:15</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Podanie na úrad</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">11.12.2024 11:45</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Registrácia dokončená</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">12.12.2024 10:20</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Dokumenty archivované</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">12.12.2024 15:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-border">
                <button 
                  onClick={() => setLocation('/virtual-office')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Zavrieť
                </button>
                {!isCompleted && (
                  <button 
                    onClick={() => setShowWorkflowProgress(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    data-testid="button-start-signing"
                  >
                    Pokračovať v procese
                  </button>
                )}
                {isCompleted && (
                  <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Tlačiť súhrn
                  </button>
                )}
              </div>
            </div>
          </div>
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
                    
                    // DN v51: Škoda Octavia is COMPLETED (green background, completed status)
                    const getStatusText = () => {
                      if (isSkodaExample) return 'Dokončené';
                      return office.status === 'completed' ? 'Dokončené' : 'Aktívne';
                    };
                    
                    const displayDate = isSkodaExample ? 'Vytvorené: 22.12.2024 | Dokončené: 12.12.2024' : `Vytvorené: ${createdDate}`;
                    const buttonText = isSkodaExample ? 'Otvoriť' : (office.status === 'completed' ? 'Otvoriť' : 'Pokračovať v procese');
                    
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
