import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shield, FileCheck, FolderOpen, Building, LogOut, ArrowLeft } from "lucide-react";

interface MainMenuProps {
  userName: string;
  isCompanyContext?: boolean;
  onCreateDocument: () => void;
  onVerifyDocument: () => void;
  onMyContracts: () => void;
  onMyDocuments: () => void;
  onVirtualOffice: () => void;
  onBack: () => void;
  onLogoff: () => void;
}

export default function MainMenu({
  userName,
  isCompanyContext = false,
  onCreateDocument,
  onVerifyDocument,
  onMyContracts,
  onMyDocuments,
  onVirtualOffice,
  onBack,
  onLogoff,
}: MainMenuProps) {
  return (
    <Card className="p-8">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Späť
        </Button>
      </div>
      <h2 className="text-2xl font-semibold mb-6">Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          variant="secondary"
          className="justify-start gap-3 h-auto py-4"
          onClick={onCreateDocument}
          data-testid="button-create-document"
        >
          <FileText className="w-5 h-5" />
          <span>Vytvoriť digitálny dokument</span>
        </Button>
        <Button
          variant="secondary"
          className="justify-start gap-3 h-auto py-4"
          onClick={onVerifyDocument}
          data-testid="button-verify-document"
        >
          <Shield className="w-5 h-5" />
          <span>Overiť digitálny dokument</span>
        </Button>
        <Button
          variant="secondary"
          className="justify-start gap-3 h-auto py-4"
          onClick={onMyContracts}
          data-testid="button-my-contracts"
        >
          <FileCheck className="w-5 h-5" />
          <span>Moje zmluvy</span>
        </Button>
        <Button
          variant="secondary"
          className="justify-start gap-3 h-auto py-4"
          onClick={onMyDocuments}
          data-testid="button-my-documents"
        >
          <FolderOpen className="w-5 h-5" />
          <span>Moje e-dokumenty</span>
        </Button>
        <Button
          variant="secondary"
          className="justify-start gap-3 h-auto py-4 sm:col-span-2"
          onClick={onVirtualOffice}
          data-testid="button-virtual-office"
        >
          <Building className="w-5 h-5" />
          <span>Virtuálna kancelária</span>
        </Button>
      </div>
      <div className="mt-6 text-sm text-center text-muted-foreground">
        Prihlásený ako: <span className="font-medium text-foreground">{userName}</span>
      </div>
      <div className="mt-6 border-t pt-6">
        <Button
          variant="outline"
          className="w-full justify-center gap-3"
          onClick={onLogoff}
          data-testid="button-logoff"
        >
          <LogOut className="w-5 h-5" />
          <span>Odhlásiť sa</span>
        </Button>
      </div>
    </Card>
  );
}
