import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AuthSectionProps {
  onLogin: () => void;
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
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
      <Button
        onClick={onLogin}
        className="w-full"
        size="lg"
        data-testid="button-eudi-login"
      >
        Prihlásiť sa cez EUDI Wallet
      </Button>
    </Card>
  );
}
