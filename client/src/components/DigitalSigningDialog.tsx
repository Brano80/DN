import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, FileSignature, Smartphone, Building2, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DigitalSigningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractName: string;
  onComplete?: () => void;
}

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Array<{
    id: string;
    ico: string;
    companyName: string;
    rola: string;
    stav: string;
  }>;
  activeContext: string | null;
}

export function DigitalSigningDialog({ 
  open, 
  onOpenChange, 
  contractName,
  onComplete 
}: DigitalSigningDialogProps) {
  const [step, setStep] = useState<'intro' | 'auth' | 'signing' | 'complete'>('intro');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get current user and active context
  const { data: currentUserData } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const handleClose = (shouldOpen: boolean) => {
    if (!shouldOpen) {
      setStep('intro');
    }
    onOpenChange(shouldOpen);
  };

  const handleStartAuth = () => {
    setStep('auth');
  };

  const handleAuth = async () => {
    setIsProcessing(true);
    // Simulate EUDI authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('signing');
  };

  const handleSign = async () => {
    setIsProcessing(true);
    // Simulate digital signing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('complete');
  };

  const handleComplete = () => {
    // Get signing context information
    const userId = currentUserData?.user.id;
    const userName = currentUserData?.user.name;
    const activeContext = currentUserData?.activeContext;
    
    let signingInfo = {
      userId,
      userName,
      context: 'personal' as 'personal' | 'company',
      mandateId: null as string | null,
      companyName: null as string | null,
      role: null as string | null,
    };
    
    // Determine signing context
    if (activeContext && activeContext !== 'personal') {
      // User is signing on behalf of a company
      const activeMandate = currentUserData?.mandates.find(m => m.ico === activeContext && m.stav === 'active');
      if (activeMandate) {
        signingInfo = {
          ...signingInfo,
          context: 'company',
          mandateId: activeMandate.id,
          companyName: activeMandate.companyName,
          role: activeMandate.rola,
        };
      }
    }
    
    // Log signing information to console
    if (signingInfo.context === 'personal') {
      console.log(`[SIGN] Dokument "${contractName}" podpísaný používateľom ${userName} (${userId}) ako FYZICKÁ OSOBA`);
    } else {
      console.log(`[SIGN] Dokument "${contractName}" podpísaný používateľom ${userName} (${userId}) s mandátom ${signingInfo.mandateId} (${signingInfo.role} @ ${signingInfo.companyName})`);
    }
    
    setStep('intro');
    onComplete?.();
    handleClose(false);
  };
  
  // Determine current signing context for display
  const getSigningContext = () => {
    if (!currentUserData) return null;
    
    const activeContext = currentUserData.activeContext;
    const userName = currentUserData.user.name;
    
    if (!activeContext || activeContext === 'personal') {
      return {
        type: 'personal' as const,
        label: `${userName} (Fyzická osoba)`,
        icon: User,
      };
    }
    
    // Company context
    const activeMandate = currentUserData.mandates.find(m => m.ico === activeContext && m.stav === 'active');
    if (activeMandate) {
      return {
        type: 'company' as const,
        label: `${activeMandate.companyName} ako ${activeMandate.rola}`,
        icon: Building2,
      };
    }
    
    return null;
  };
  
  const signingContext = getSigningContext();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-digital-signing">
        <DialogHeader>
          <DialogTitle>Digitálne podpisovanie</DialogTitle>
          <DialogDescription>
            Proces digitálneho podpisovania s overením totožnosti cez EU Digital Identity Wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'intro' && (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <FileSignature className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Pripravené na podpis</h3>
                <p className="text-muted-foreground">
                  Budete podpisovať zmluvu: <strong>{contractName}</strong>
                </p>
              </div>

              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Proces digitálneho podpisovania
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Overenie identity cez EU Digital Identity Wallet (EUDI)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Kontrola obsahu zmluvy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>Digitálne podpísanie dokumentu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">4.</span>
                    <span>Overenie a uloženie podpísanej zmluvy</span>
                  </li>
                </ol>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleClose(false)}
                  data-testid="button-cancel-signing"
                >
                  Zrušiť
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleStartAuth}
                  data-testid="button-start-auth"
                >
                  Začať proces
                </Button>
              </div>
            </>
          )}

          {step === 'auth' && (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Overenie totožnosti</h3>
                <p className="text-muted-foreground">
                  Otvorte aplikáciu EU Digital Identity Wallet na vašom zariadení
                </p>
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30">
                <p className="text-sm text-center">
                  Postupujte podľa pokynov vo vašej EUDI aplikácii pre overenie totožnosti
                </p>
              </Card>

              <Button 
                className="w-full"
                onClick={handleAuth}
                disabled={isProcessing}
                data-testid="button-confirm-auth"
              >
                {isProcessing ? 'Overuje sa...' : 'Potvrdiť overenie'}
              </Button>
            </>
          )}

          {step === 'signing' && (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <FileSignature className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Podpisovanie zmluvy</h3>
                <p className="text-muted-foreground">
                  {contractName}
                </p>
              </div>

              {/* Signing Context Display */}
              {signingContext && (
                <Alert className="bg-primary/10 border-primary/20">
                  <signingContext.icon className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <span className="text-sm">
                      <strong>Podpisujete {signingContext.type === 'personal' ? 'ako' : 'v mene'}:</strong>{' '}
                      <span className="font-semibold">{signingContext.label}</span>
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Potvrdenie obsahu</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Skontrolujte si obsah zmluvy pred podpísaním. Digitálny podpis má rovnakú právnu platnosť ako vlastnoručný podpis.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-chart-2" />
                  <span>Totožnosť overená</span>
                </div>
              </Card>

              <Button 
                className="w-full"
                onClick={handleSign}
                disabled={isProcessing}
                data-testid="button-sign-document"
              >
                {isProcessing ? 'Podpisuje sa...' : 'Podpísať zmluvu'}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="flex items-center justify-center py-6">
                <div className="w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-chart-2" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-chart-2">Úspešne podpísané</h3>
                <p className="text-muted-foreground">
                  Zmluva bola úspešne digitálne podpísaná a uložená
                </p>
              </div>

              <Card className="p-4 bg-chart-2/10">
                <h4 className="font-medium mb-2">Digitálny podpis vytvorený</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Dokument digitálne podpísaný</p>
                  <p>✓ Časová pečiatka pridaná</p>
                  <p>✓ Uložené v zabezpečenom úložisku</p>
                  <p>✓ Druhá strana bude upozornená</p>
                </div>
              </Card>

              <Button 
                className="w-full"
                onClick={handleComplete}
                data-testid="button-complete-signing"
              >
                Dokončiť
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
