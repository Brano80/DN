import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, TestTube } from "lucide-react";

export default function AuthSection() {
  const handleOidcLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleMockLogin = () => {
    window.location.href = "/auth/mock-login";
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
        <Button
          onClick={handleMockLogin}
          variant="outline"
          className="w-full"
          size="lg"
          data-testid="button-mock-login"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Prihlásiť sa ako Test User (Mock)
        </Button>
      </div>
    </Card>
  );
}
