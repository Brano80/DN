import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { ContractDetailModal } from "@/components/ContractDetailModal";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";
import { FileText } from "lucide-react";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Array<{
    ico: string;
    companyName: string;
    role: string;
  }>;
  activeContext?: string | null;
}

export default function MyContracts() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const { data: currentUser, activeContext } = useCurrentUser();
  const { toast } = useToast();

  // Get vkId from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const vkId = urlParams.get('vkId');

  const { data: currentUserResponse } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: QUERY_KEYS.contracts(activeContext),
    enabled: !!currentUser,
  });

  // Determine if user is in company context
  const isCompanyContext = currentUserResponse?.activeContext && currentUserResponse.activeContext !== 'personal';
  const pageTitle = isCompanyContext ? "Firemné zmluvy" : "Moje zmluvy";

  // Mutation to add contract to VK
  const addContractToVkMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const response = await apiRequest("POST", `/api/virtual-offices/${vkId}/documents`, {
        contractId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/virtual-offices/${vkId}`] });
      toast({
        title: "Dokument pridaný",
        description: "Zmluva bola úspešne pridaná do virtuálnej kancelárie.",
      });
      setLocation(`/virtual-office/${vkId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať dokument do VK.",
        variant: "destructive",
      });
    },
  });

  const handleShowContract = (contractId: string) => {
    setSelectedContract(contractId);
  };

  const getContractStatusBadge = (contract: Contract) => {
    if (contract.status === 'completed') {
      return (
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
          Dokončené
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
        Čaká na podpis
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <BackButton onClick={() => vkId ? setLocation(`/virtual-office/${vkId}`) : setLocation('/')} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {vkId ? "Vyberte zmluvu na nahratie do VK" : pageTitle}
            </h2>
            <Button
              variant="outline"
              onClick={() => setLocation('/create-document')}
              data-testid="button-create-new-contract"
            >
              <FileText className="w-4 h-4 mr-2" />
              Vytvoriť novú zmluvu
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Načítavam zmluvy...</p>
            </div>
          ) : !contracts || contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Zatiaľ nemáte žiadne zmluvy</p>
              <Button onClick={() => setLocation('/create-document')} data-testid="button-create-first-contract">
                Vytvoriť prvú zmluvu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <Card 
                  key={contract.id} 
                  className="p-4" 
                  data-testid={`card-contract-${contract.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1" data-testid={`text-contract-title-${contract.id}`}>
                        {contract.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Vytvorené: {new Date(contract.createdAt).toLocaleDateString('sk-SK')}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Typ:</strong> {
                          contract.type === 'vehicle' ? 'Kúpna zmluva vozidla' :
                          contract.type === 'rental' ? 'Nájomná zmluva' :
                          contract.type === 'power_of_attorney' ? 'Splnomocnenie' :
                          contract.type === 'employment' ? 'Zamestnanecká zmluva' :
                          contract.type === 'custom' ? 'Vlastný dokument' :
                          'Iný dokument'
                        }</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getContractStatusBadge(contract)}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShowContract(contract.id)} 
                          data-testid={`button-show-${contract.id}`}
                        >
                          Zobraziť
                        </Button>
                        {vkId && (
                          <Button
                            size="sm"
                            onClick={() => addContractToVkMutation.mutate(contract.id)}
                            disabled={addContractToVkMutation.isPending}
                            data-testid={`button-add-to-vk-${contract.id}`}
                          >
                            Pridať do VK
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ContractDetailModal 
        open={selectedContract !== null} 
        onOpenChange={(open) => !open && setSelectedContract(null)}
        contractId={selectedContract}
      />
    </div>
  );
}
