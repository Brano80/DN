import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { ContractDetailModal } from "@/components/ContractDetailModal";
import { useQuery } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";
import { FileText } from "lucide-react";

export default function MyContracts() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  // Load contracts from database
  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: [`/api/contracts?ownerEmail=jan.novak@example.com`],
  });

  const handleShowContract = (type: string) => {
    setSelectedContract(type);
  };

  const getContractStatusBadge = (type: string) => {
    // For now, all new contracts are "Čaká na podpis"
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
          <BackButton onClick={() => setLocation('/')} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Moje zmluvy</h2>
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
                <Card key={contract.id} className="p-4" data-testid={`card-contract-${contract.id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1" data-testid={`text-contract-title-${contract.id}`}>
                        {contract.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Vytvorené: {new Date(contract.createdAt).toLocaleDateString('sk-SK')}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Typ:</strong> {contract.type === 'vehicle' ? 'Kúpna zmluva vozidla' : 'Nájomná zmluva'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getContractStatusBadge(contract.type)}
                      <button 
                        onClick={() => handleShowContract(contract.id)} 
                        className="text-primary hover:underline text-sm" 
                        data-testid={`button-show-${contract.id}`}
                      >
                        Zobraziť
                      </button>
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
        contractType={selectedContract || ''}
      />
    </div>
  );
}
