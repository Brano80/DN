import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AuthSection() {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleOidcLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleJanLogin = () => {
    window.location.href = "/auth/mock-login";
  };

  const handlePetraLogin = () => {
    window.location.href = "/auth/mock-login-petra";
  };

  const handleAndresLogin = () => {
    window.location.href = "/auth/mock-login-andres";
  };

  const handleResetData = async () => {
    if (!confirm("Naozaj chcete vymazať všetky dáta a obnoviť základný stav? Táto akcia je nevratná.")) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      toast({
        title: "Dáta vymazané",
        description: "Všetky dáta boli vymazané a obnovené na základný stav.",
      });

      // Refresh page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vymazať dáta.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Overte svoju identitu</h2>
      <p className="text-muted-foreground mb-6">
        Pre spustenie procesu musíte overiť svoju totožnosť pomocou EU Digital Identity Wallet.
      </p>
      <div className="space-y-3">
        <Button
          onClick={handleOidcLogin}
          className="w-full"
          size="lg"
          data-testid="button-eudi-login"
        >
          Prihlásiť sa cez eIDentita
        </Button>
        
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Demo používatelia
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleJanLogin}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-mock-login-jan"
          >
            <User className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Ján Nováček</div>
              <div className="text-xs text-muted-foreground">eGarant s.r.o. (CZ)</div>
            </div>
          </Button>
          <Button
            onClick={handlePetraLogin}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-mock-login-petra"
          >
            <User className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Petra Ambroz</div>
              <div className="text-xs text-muted-foreground">ARIAN s.r.o. (SK)</div>
            </div>
          </Button>
          <Button
            onClick={handleAndresLogin}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-mock-login-andres"
          >
            <User className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Andres Elgueta</div>
              <div className="text-xs text-muted-foreground">Tekmain SpA (CL)</div>
            </div>
          </Button>
        </div>

        {/* Reset Data Button */}
        <div className="mt-6 pt-6 border-t">
          <Button
            onClick={handleResetData}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            disabled={isResetting}
            data-testid="button-reset-data"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            {isResetting ? "Vymazávam..." : "Vymazať všetky dáta"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
