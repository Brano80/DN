import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Contract } from "@shared/schema";

interface SelectContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContract: (contractId: string) => void;
  ownerEmail: string;
}

export function SelectContractDialog({
  open,
  onOpenChange,
  onSelectContract,
  ownerEmail,
}: SelectContractDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: [`/api/contracts?ownerEmail=${ownerEmail}`],
    enabled: open && !!ownerEmail,
  });

  const handleConfirm = () => {
    if (selectedId) {
      onSelectContract(selectedId);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-select-contract">
        <DialogHeader>
          <DialogTitle>Vybrať zmluvu z "Moje zmluvy"</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading && (
            <p className="text-muted-foreground text-center py-8" data-testid="text-loading-contracts">
              Načítavam zmluvy...
            </p>
          )}

          {!isLoading && (!contracts || contracts.length === 0) && (
            <p className="text-muted-foreground text-center py-8" data-testid="text-no-contracts">
              Nenašli sa žiadne zmluvy. Vytvorte zmluvu v sekcii "Moje zmluvy".
            </p>
          )}

          {contracts && contracts.length > 0 && contracts.map((contract) => (
            <Card
              key={contract.id}
              className={`p-4 cursor-pointer hover-elevate ${
                selectedId === contract.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedId(contract.id)}
              data-testid={`card-contract-${contract.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium" data-testid={`text-contract-title-${contract.id}`}>
                    {contract.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Typ: {contract.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vytvorené: {new Date(contract.createdAt).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                {selectedId === contract.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedId(null);
            }}
            data-testid="button-cancel-select"
          >
            Zrušiť
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
            data-testid="button-confirm-select"
          >
            Potvrdiť výber
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
