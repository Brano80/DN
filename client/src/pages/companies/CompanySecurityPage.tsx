import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  activeContext: string | null;
}

interface Company {
  id: string;
  ico: string;
  nazov: string;
  enforceTwoFactorAuth: boolean;
}

export default function CompanySecurityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get current user and active context
  const { data: userData } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  const activeContext = userData?.activeContext;
  const isCompanyContext = activeContext && activeContext !== 'personal';
  const activeIco = isCompanyContext ? activeContext : null;

  // Find active company from mandates
  const activeCompany = isCompanyContext
    ? userData?.mandates.find(m => m.ico === activeContext)
    : null;

  // Fetch company profile to get current enforceTwoFactorAuth setting
  const { data: company, isLoading, isError, refetch } = useQuery<Company>({
    queryKey: ['/api/companies', activeIco, 'profile'],
    enabled: !!activeIco,
  });

  // Mutation to update security settings
  const updateSecurityMutation = useMutation({
    mutationFn: async (enforceTwoFactorAuth: boolean) => {
      if (!activeIco) throw new Error("No active company");
      
      return apiRequest("PATCH", `/api/companies/${activeIco}/security-settings`, {
        enforceTwoFactorAuth
      });
    },
    onSuccess: () => {
      toast({
        title: "Nastavenia uložené",
        description: "Bezpečnostné nastavenia boli úspešne aktualizované.",
      });
      // Refetch company profile to update UI
      refetch();
      // Also invalidate the profile query
      queryClient.invalidateQueries({ queryKey: ['/api/companies', activeIco, 'profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa aktualizovať nastavenia.",
        variant: "destructive",
      });
    },
  });

  const handleSwitchChange = (checked: boolean) => {
    updateSecurityMutation.mutate(checked);
  };

  // Error state: no company context
  if (!isCompanyContext || !activeCompany) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nastavenia zabezpečenia sú dostupné len v kontexte firmy. Prepnite na firemný profil cez navigáciu hore.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground" data-testid="text-loading">Načítavam...</p>
      </div>
    );
  }

  // Error state
  if (isError || !company) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nepodarilo sa načítať údaje firmy. Skúste to znova.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/companies')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Zabezpečenie</h1>
          <p className="text-muted-foreground mt-1">
            Nastavenia bezpečnosti pre firmu: {company.nazov}
          </p>
        </div>
      </div>

      {/* 2FA Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Dvojfaktorová autentifikácia (2FA)</CardTitle>
              <CardDescription>
                Zvýšte bezpečnosť firemného účtu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vynútiť 2FA pre všetkých používateľov s mandátom pre túto firmu. 
            Všetci používatelia budú musieť mať nastavenú dvojfaktorovú autentifikáciu 
            pre prístup k firemnému profilu a vykonávanie akcií v mene firmy.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-6">
          <div>
            <p className="font-medium">Vynútiť 2FA</p>
            <p className="text-sm text-muted-foreground">
              {company.enforceTwoFactorAuth ? 'Zapnuté' : 'Vypnuté'}
            </p>
          </div>
          <Switch
            checked={company.enforceTwoFactorAuth}
            onCheckedChange={handleSwitchChange}
            disabled={updateSecurityMutation.isPending}
            className="data-[state=checked]:bg-green-600"
            data-testid="switch-enforce-2fa"
          />
        </CardFooter>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Zmeny v nastaveniach zabezpečenia sa zaznamenávajú do audit logu a sú okamžite účinné.
          Všetky akcie v tejto sekcii môžu vykonávať len konatelia a prokuristi.
        </AlertDescription>
      </Alert>
    </div>
  );
}
