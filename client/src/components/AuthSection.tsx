import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

export default function AuthSection() {
  const handleOidcLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleJanLogin = () => {
    window.location.href = "/auth/mock-login";
  };

  const handlePetraLogin = () => {
    window.location.href = "/auth/mock-login-petra";
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleJanLogin}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-mock-login-jan"
          >
            <User className="w-4 h-4 mr-2" />
            <div className="text-left flex-1">
              <div className="font-medium">Ján Nováček</div>
              <div className="text-xs text-muted-foreground">eGarant s.r.o.</div>
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
            <div className="text-left flex-1">
              <div className="font-medium">Petra Ambroz</div>
              <div className="text-xs text-muted-foreground">ARIAN s.r.o.</div>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
}
