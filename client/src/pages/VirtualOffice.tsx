import { useState, useEffect } from "react";
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
import { Plus, Check, Clock, QrCode, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VirtualOffice as VirtualOfficeType, Contract } from "@shared/schema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import QRCode from "qrcode";

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
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [matchList] = useRoute("/virtual-office/list");
  const [matchDetail, params] = useRoute("/virtual-office/:id");
  
  // "list" is not a valid office ID - it's the list view route
  const officeId = (matchDetail && params?.id !== 'list') ? params?.id : null;
  
  // Derive currentView directly from URL route
  const currentView: ViewType = matchList ? 'list' : 'create';
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [officeName, setOfficeName] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [showSelectContract, setShowSelectContract] = useState(false);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const [showSigning, setShowSigning] = useState(false);
  const [showWorkflowProgress, setShowWorkflowProgress] = useState(false);
  const [sellerSigned, setSellerSigned] = useState(false);
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isProcessCompleted, setIsProcessCompleted] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const { data: currentUser } = useCurrentUser();

  const { data: offices = [], isLoading: isLoadingOffices } = useQuery<VirtualOfficeType[]>({
    queryKey: [`/api/virtual-offices?ownerEmail=${currentUser?.email || ''}`],
    enabled: currentView === 'list' && !!currentUser?.email,
  });

  // Initialize signing state based on office status when office changes
  useEffect(() => {
    if (office?.status === 'completed') {
      setSellerSigned(true);
      setBuyerSigned(true);
    } else {
      setSellerSigned(false);
      setBuyerSigned(false);
    }
  }, [officeId, office?.status]);

  const createOfficeMutation = useMutation({
    mutationFn: async (data: { name: string; invitedEmail: string }) => {
      const response = await apiRequest("POST", "/api/virtual-offices", {
        name: data.name,
        ownerEmail: currentUser?.email || '',
        invitedEmail: data.invitedEmail,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices?ownerEmail=${currentUser?.email || ''}`] });
      setLocation(`/virtual-office/${data.id}`);
    },
    onError: () => {
    },
  });

  const attachContractMutation = useMutation({
    mutationFn: async (contractId: string) => {
      // Get contract to extract its title
      const contractResponse = await apiRequest("GET", `/api/contracts/${contractId}`);
      const contractData = await contractResponse.json();
      
      const response = await apiRequest("PATCH", `/api/virtual-offices/${officeId}`, {
        contractId: contractId,
        name: contractData.title, // Update office name with contract title
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices/${officeId}`] });
      setShowSelectContract(false);
    },
    onError: () => {
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
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices?ownerEmail=${currentUser?.email || ''}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts?ownerEmail=${currentUser?.email || ''}`] });
    },
    onError: () => {
    },
  });

  const handleCreateOffice = () => {
    if (!officeName || !invitedEmail) {
      return;
    }

    createOfficeMutation.mutate({
      name: officeName,
      invitedEmail: invitedEmail,
    });
  };


  const handleShowMyOffices = () => {
    setLocation('/virtual-office/list');
  };

  const handleShowCreateView = () => {
    setLocation('/virtual-office');
  };

  const handleOpenTransaction = (transactionId: string) => {
    setSelectedTransaction(transactionId);
  };

  const handleContinueProcess = (processType: string) => {
    setLocation(`/digital-signing/${processType}`);
  };

  const handleCompleteSigning = () => {
    setShowSigning(false);
    if (!sellerSigned) {
      setSellerSigned(true);
    } else if (!buyerSigned) {
      setBuyerSigned(true);
      completeSigningMutation.mutate();
    }
  };

  const generateQRCode = async () => {
    if (!office || !contract) return;
    
    const transactionData = {
      id: office.id,
      name: office.name,
      type: contract.type,
      status: office.status,
      contractId: contract.id,
      contractTitle: contract.title,
    };
    
    try {
      const url = await QRCode.toDataURL(JSON.stringify(transactionData), {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(url);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress) return;
    
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowEmailForm(false);
      setEmailAddress("");
      alert(`Dokument bol úspešne odoslaný na adresu: ${emailAddress}`);
    }, 1000);
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

              {/* Show message if no contract attached */}
              {!office.contractId || !contract ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Najprv pripojte zmluvu k tejto virtuálnej kancelárii</p>
                  <button
                    onClick={() => {
                      setShowWorkflowProgress(false);
                      setShowSelectContract(true);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Nahrať zmluvu
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Priebeh procesu</h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Krok {
                          contract?.type === 'power_of_attorney' 
                            ? (isProcessCompleted ? '3' : isArchived ? '3' : sellerSigned && buyerSigned ? '2' : '1')
                            : (sellerSigned && buyerSigned ? '2' : '1')
                        } z {contract?.type === 'power_of_attorney' ? '3' : '7'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {contract?.type === 'power_of_attorney' ? (
                      <div className="relative flex items-start mb-8">
                        {/* Step 1 - Podpis zmluvy */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 relative z-10 ${
                            sellerSigned && buyerSigned
                              ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-100 dark:ring-green-900/50'
                              : !sellerSigned || !buyerSigned
                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-md'
                          }`}>
                            1
                          </div>
                          <p className={`text-sm text-center ${
                            sellerSigned && buyerSigned
                              ? 'text-green-700 dark:text-green-300 font-semibold'
                              : !sellerSigned || !buyerSigned
                              ? 'text-gray-800 dark:text-gray-200 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Podpis<br/>zmluvy</p>
                          <div className={`absolute top-7 left-1/2 w-full h-0.5 ${
                            sellerSigned && buyerSigned ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        </div>

                        {/* Step 2 - Archivácia */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 relative z-10 ${
                            isArchived
                              ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-100 dark:ring-green-900/50'
                              : sellerSigned && buyerSigned && !isArchived
                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-md'
                          }`}>
                            2
                          </div>
                          <p className={`text-sm text-center ${
                            isArchived
                              ? 'text-green-700 dark:text-green-300 font-semibold'
                              : sellerSigned && buyerSigned && !isArchived
                              ? 'text-gray-800 dark:text-gray-200 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Archivácia</p>
                          <div className={`absolute top-7 left-1/2 w-full h-0.5 ${
                            isArchived ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        </div>

                        {/* Step 3 - Dokončené */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 relative z-10 ${
                            isProcessCompleted
                              ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-100 dark:ring-green-900/50'
                              : isArchived && !isProcessCompleted
                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-md'
                          }`}>
                            3
                          </div>
                          <p className={`text-sm text-center ${
                            isProcessCompleted
                              ? 'text-green-700 dark:text-green-300 font-semibold'
                              : isArchived && !isProcessCompleted
                              ? 'text-gray-800 dark:text-gray-200 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Dokončené</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex items-start mb-8">
                        {/* Step 1 - Podpis zmluvy */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 relative z-10 ${
                            sellerSigned && buyerSigned
                              ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-100 dark:ring-green-900/50'
                              : !sellerSigned || !buyerSigned
                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-md'
                          }`}>
                            1
                          </div>
                          <p className={`text-sm text-center ${
                            sellerSigned && buyerSigned
                              ? 'text-green-700 dark:text-green-300 font-semibold'
                              : !sellerSigned || !buyerSigned
                              ? 'text-gray-800 dark:text-gray-200 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Podpis<br/>zmluvy</p>
                          <div className={`absolute top-7 left-1/2 w-full h-0.5 ${
                            sellerSigned && buyerSigned ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        </div>

                        {/* Step 2 - Platba */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 relative z-10 ${
                            sellerSigned && buyerSigned
                              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-md'
                          }`}>
                            2
                          </div>
                          <p className={`text-sm text-center ${
                            sellerSigned && buyerSigned
                              ? 'text-gray-800 dark:text-gray-200 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Platba</p>
                          <div className="absolute top-7 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-3 shadow-md relative z-10">
                            3
                          </div>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Podanie na<br/>úrad</p>
                          <div className="absolute top-7 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-3 shadow-md relative z-10">
                            4
                          </div>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Registrácia</p>
                          <div className="absolute top-7 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-3 shadow-md relative z-10">
                            5
                          </div>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Notárska<br/>zápisnica</p>
                          <div className="absolute top-7 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Step 6 */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-3 shadow-md relative z-10">
                            6
                          </div>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Archivácia</p>
                          <div className="absolute top-7 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Step 7 */}
                        <div className="flex flex-col items-center flex-1 relative">
                          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-lg font-bold mb-3 shadow-md relative z-10">
                            7
                          </div>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Dokončené</p>
                        </div>
                      </div>
                    )}
              </div>

              {/* Main Content Card */}
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                  Stav transakcie: {
                    contract?.type === 'power_of_attorney' ? 'Splnomocnenie' :
                    contract?.type === 'rental' ? 'Nájomná zmluva' :
                    contract?.type === 'employment' ? 'Zamestnanecká zmluva' :
                    contract?.type === 'custom' ? 'Vlastný dokument' :
                    isSkodaOffice ? 'Predaj motorového vozidla' : 'Predaj vozidla'
                  }
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Participants */}
                  <div className="space-y-4">
                    {/* First Party */}
                    <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          sellerSigned 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          {sellerSigned ? (
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ján Novák</h4>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              sellerSigned
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {sellerSigned ? 'Podpísané' : 'Čaká'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ({contract?.type === 'power_of_attorney' ? 'Splnomocniteľ' : 
                              contract?.type === 'rental' ? 'Prenajímateľ' : 'Predávajúci'})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {sellerSigned ? 'Podpísané: 20.12.2024 14:30' : 'Čaká na podpis'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Second Party */}
                    <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          buyerSigned 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          {buyerSigned ? (
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                              {contract?.type === 'power_of_attorney' ? 'Peter Kováč' : 'Tomáš Horváth'}
                            </h4>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              buyerSigned
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            }`}>
                              {buyerSigned ? 'Podpísané' : 'Čaká'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ({contract?.type === 'power_of_attorney' ? 'Splnomocnenec' : 
                              contract?.type === 'rental' ? 'Nájomca' : 'Kupujúci'})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {buyerSigned ? 'Podpísané: 20.12.2024 15:15' : 'Čaká na podpis'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Contract Details */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                    {!office.contractId ? (
                      <div className="text-center py-8">
                        <p className="text-blue-700 dark:text-blue-300 mb-4">Zatiaľ nebola pripojená žiadna zmluva</p>
                        <button
                          onClick={() => setShowSelectContract(true)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          data-testid="button-upload-contract-workflow"
                        >
                          Nahrať zmluvu
                        </button>
                      </div>
                    ) : contract ? (
                      <>
                        {contract.type === 'vehicle' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily vozidla</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Vozidlo:</strong> {content.vehicle?.brand} {content.vehicle?.model}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Rok výroby:</strong> {content.vehicle?.year}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>VIN:</strong> {content.vehicle?.vin}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>EČV:</strong> {content.vehicle?.licensePlate}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Najazdené km:</strong> {content.vehicle?.mileage} km
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Kúpna cena:</strong> {content.price} €
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : contract.type === 'rental' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily prenájmu</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Adresa:</strong> {content.property?.address}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Typ nehnuteľnosti:</strong> {content.property?.type}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Výmera:</strong> {content.property?.floorArea} m²
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Počet izieb:</strong> {content.property?.rooms}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Mesačné nájomné:</strong> {content.rent} €
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Dátum začiatku nájmu:</strong> {content.startDate}
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : contract.type === 'power_of_attorney' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily splnomocnenia</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Splnomocniteľ:</strong> {content.principal?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Splnomocnenec:</strong> {content.attorney?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Rozsah splnomocnenia:</strong> {content.authorizedActions}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Platnosť od:</strong> {content.validFrom || 'Neuvedené'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Platnosť do:</strong> {content.validUntil || 'Do odvolania'}
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : contract.type === 'property' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily nehnuteľnosti</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Adresa:</strong> {content.property?.address}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Typ:</strong> {content.property?.type}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Výmera:</strong> {content.property?.floorArea} m²
                                    </p>
                                  </div>
                                  {content.property?.cadastralArea && (
                                    <div>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Katastrálne územie:</strong> {content.property.cadastralArea}
                                      </p>
                                    </div>
                                  )}
                                  {content.property?.landRegistryNumber && (
                                    <div>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>LV číslo:</strong> {content.property.landRegistryNumber}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Kúpna cena:</strong> {content.price} €
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : contract.type === 'employment' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily zamestnania</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Zamestnanec:</strong> {content.employee?.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Pozícia:</strong> {content.employment?.position}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Miesto výkonu práce:</strong> {content.employment?.workLocation}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Mzda:</strong> {content.employment?.salary} €
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Pracovný čas:</strong> {content.employment?.workHours}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Nástup:</strong> {content.employment?.startDate}
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : contract.type === 'custom' ? (() => {
                          try {
                            const content = JSON.parse(contract.content);
                            return (
                              <>
                                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Detaily dokumentu</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      <strong>Názov:</strong> {contract.title}
                                    </p>
                                  </div>
                                  {content.description && (
                                    <div>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Popis:</strong> {content.description}
                                      </p>
                                    </div>
                                  )}
                                  {content.documentType && (
                                    <div>
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Typ dokumentu:</strong> {content.documentType}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          } catch (e) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-red-700 dark:text-red-300">Chyba pri načítaní detailov zmluvy</p>
                              </div>
                            );
                          }
                        })() : null}

                        <button
                          onClick={() => setViewContractId(office.contractId)}
                          className="w-full mt-4 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
                          data-testid="button-view-contract"
                        >
                          Náhľad zmluvy
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-blue-700 dark:text-blue-300">Načítava sa zmluva...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Area */}
              {!sellerSigned || !buyerSigned ? (
                <div className="mt-8 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-6">
                  <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                    {!sellerSigned ? 
                      (contract?.type === 'power_of_attorney' ? 'Čakáme na podpis splnomocniteľa...' : 
                       contract?.type === 'rental' ? 'Čakáme na podpis prenajímateľa...' : 
                       'Čakáme na podpis predávajúceho...') : 
                      (contract?.type === 'power_of_attorney' ? 'Čakáme na podpis splnomocnenca...' : 
                       contract?.type === 'rental' ? 'Čakáme na podpis nájomcu...' : 
                       'Čakáme na podpis kupujúceho...')}
                  </p>
                  <button
                    onClick={() => setShowSigning(true)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                    data-testid={!sellerSigned ? "button-simulate-seller-sign" : "button-simulate-buyer-sign"}
                  >
                    {!sellerSigned ? 
                      (contract?.type === 'power_of_attorney' ? 'Simulovať podpis splnomocniteľa' : 
                       contract?.type === 'rental' ? 'Simulovať podpis prenajímateľa' : 
                       'Simulovať podpis predávajúceho') : 
                      (contract?.type === 'power_of_attorney' ? 'Simulovať podpis splnomocnenca' : 
                       contract?.type === 'rental' ? 'Simulovať podpis nájomcu' : 
                       'Simulovať podpis kupujúceho')}
                  </button>
                </div>
              ) : (
                <div className="mt-8 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-6">
                  {contract?.type === 'power_of_attorney' || contract?.type === 'employment' ? (
                    <>
                      {!isArchived ? (
                        <>
                          <p className="text-center text-green-700 dark:text-green-300 mb-4 font-semibold">
                            Obe strany podpísali zmluvu!
                          </p>
                          <button
                            onClick={() => {
                              setIsArchived(true);
                            }}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                            data-testid="button-archive"
                          >
                            Archivácia
                          </button>
                        </>
                      ) : !isProcessCompleted ? (
                        <>
                          <p className="text-center text-green-700 dark:text-green-300 mb-4 font-semibold">
                            Archivované
                          </p>
                          <button
                            onClick={() => {
                              setIsProcessCompleted(true);
                            }}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                            data-testid="button-complete-process"
                          >
                            Dokončiť
                          </button>
                        </>
                      ) : (
                        <p className="text-center text-green-700 dark:text-green-300 font-semibold text-lg">
                          Proces úspešne dokončený
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-center text-green-700 dark:text-green-300 mb-4 font-semibold">
                        Obe strany podpísali zmluvu!
                      </p>
                      <button
                        onClick={() => {
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                        data-testid="button-continue-payment"
                      >
                        Pokračovať na platbu
                      </button>
                    </>
                  )}
                </div>
              )}
                </>
              )}
            </div>
          </div>

          <SelectContractDialog
            open={showSelectContract}
            onOpenChange={setShowSelectContract}
            onSelectContract={(contractId) => attachContractMutation.mutate(contractId)}
            ownerEmail={currentUser?.email || ""}
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
                    <p className="text-green-700 dark:text-green-300">
                      {contract?.type === 'vehicle' ? 'Prevod vozidla bol úspešne dokončený' :
                       contract?.type === 'power_of_attorney' ? 'Splnomocnenie bolo úspešne podpísané' :
                       contract?.type === 'employment' ? 'Pracovná zmluva bola úspešne podpísaná' :
                       contract?.type === 'rental' ? 'Nájomná zmluva bola úspešne podpísaná' :
                       contract?.type === 'custom' ? 'Dokument bol úspešne podpísaný' :
                       'Transakcia bola úspešne dokončená'}
                    </p>
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
              {isCompleted && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Časová os transakcie</h3>
                  <div className="space-y-3">
                    {isSkodaOffice ? (
                      <>
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
                      </>
                    ) : contract?.type === 'power_of_attorney' ? (
                      <>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Podpis zmluvy</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('sk-SK')} {new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Archivácia</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('sk-SK')} {new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">Dokončené</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('sk-SK')} {new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Proces dokončený</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('sk-SK')} {new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code Display */}
              {isCompleted && showQRCode && qrCodeUrl && (
                <div className="mt-4 mb-6 p-6 bg-muted rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-4">QR Kód transakcie</h3>
                  <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Naskenujte tento QR kód pre zobrazenie detailov transakcie
                  </p>
                </div>
              )}

              {/* Email Form */}
              {isCompleted && showEmailForm && (
                <div className="mt-4 mb-6 p-6 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Preposlať dokument emailom</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-address-vo">Emailová adresa príjemcu</Label>
                      <Input
                        id="email-address-vo"
                        type="email"
                        placeholder="priklad@email.sk"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        data-testid="input-forward-email-vo"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowEmailForm(false);
                          setEmailAddress("");
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        data-testid="button-cancel-email-vo"
                      >
                        Zrušiť
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={!emailAddress || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        data-testid="button-send-email-vo"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSending ? 'Odosiela sa...' : 'Odoslať'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-border">
                <div className="flex space-x-2">
                  {isCompleted && (
                    <>
                      <button
                        onClick={generateQRCode}
                        disabled={showQRCode}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        data-testid="button-generate-qr-vo"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Generate QR code</span>
                      </button>
                      <button
                        onClick={() => setShowEmailForm(!showEmailForm)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2"
                        data-testid="button-forward-vo"
                      >
                        <Send className="w-4 h-4" />
                        <span>Preposlať</span>
                      </button>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
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
                    <button 
                      onClick={() => window.print()}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Tlačiť súhrn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SelectContractDialog
          open={showSelectContract}
          onOpenChange={setShowSelectContract}
          onSelectContract={(contractId) => attachContractMutation.mutate(contractId)}
          ownerEmail={currentUser?.email || ""}
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
