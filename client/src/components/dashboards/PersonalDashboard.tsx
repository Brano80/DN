import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Contract, VirtualOffice } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface Mandate {
  mandateId: string;
  ico: string;
  companyName: string;
  role: string;
  status: string;
}

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mandates: Mandate[];
  activeContext: string | null;
}

export default function PersonalDashboard() {
  const [, setLocation] = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();

  // Fetch current user data including mandates
  const { data: userData, isLoading: isLoadingUser } = useQuery<CurrentUserResponse>({
    queryKey: ['/api/current-user'],
  });

  // Fetch contracts for the current user
  const { data: contracts } = useQuery<Contract[]>({
    queryKey: QUERY_KEYS.contracts(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  // Fetch virtual offices for the current user
  const { data: virtualOffices } = useQuery<VirtualOffice[]>({
    queryKey: QUERY_KEYS.virtualOffices(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  // Filter pending mandate invitations
  const pendingMandates = userData?.mandates?.filter(m => m.status === 'pending_confirmation') || [];

  // Calculate counts
  const contractsCount = contracts?.length || 0;
  const virtualOfficesCount = virtualOffices?.length || 0;
  const documentsCount = 0;

  // Accept mandate mutation
  const acceptMandateMutation = useMutation({
    mutationFn: async (mandateId: string) => {
      return await apiRequest('PATCH', `/api/mandates/${mandateId}`, { stav: 'active' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      toast({
        title: "Mandát prijatý",
        description: "Úspešne ste prijali pozvánku na spoluprácu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa prijať mandát.",
        variant: "destructive",
      });
    }
  });

  // Reject mandate mutation
  const rejectMandateMutation = useMutation({
    mutationFn: async (mandateId: string) => {
      return await apiRequest('PATCH', `/api/mandates/${mandateId}`, { stav: 'rejected' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-user'] });
      toast({
        title: "Mandát odmietnutý",
        description: "Pozvánka bola odmietnutá.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odmietnuť mandát.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="personal-dashboard">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Váš osobný profil</h1>
        <p className="text-muted-foreground">
          Spravujte svoje osobné dokumenty a digitálne úkony.
        </p>
      </div>

      {/* Quick Stats - Clickable Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2"
          onClick={() => setLocation('/my-contracts')}
          data-testid="card-my-contracts"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moje zmluvy</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsCount}</div>
            <p className="text-xs text-muted-foreground">Celkový počet zmlúv</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2"
          onClick={() => setLocation('/my-documents')}
          data-testid="card-my-documents"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-dokumenty</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsCount}</div>
            <p className="text-xs text-muted-foreground">Moje e-dokumenty</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2"
          onClick={() => setLocation('/virtual-office/list')}
          data-testid="card-virtual-offices"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtuálne kancelárie</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{virtualOfficesCount}</div>
            <p className="text-xs text-muted-foreground">Aktívne kancelárie</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2"
          onClick={() => {
            const element = document.getElementById('pending-mandates-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          data-testid="card-pending-mandates"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce úkony</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMandates.length}</div>
            <p className="text-xs text-muted-foreground">Pozvánky na spoluprácu</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Rýchle akcie</CardTitle>
          <CardDescription>
            Začnite s najčastejšími úkonmi vo vašom osobnom profile
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/create-document')}
            data-testid="button-create-document"
          >
            <FileText className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Vytvoriť dokument</div>
              <div className="text-xs text-muted-foreground">Nový digitálny dokument</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/verify-document')}
            data-testid="button-verify-document"
          >
            <Shield className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Overiť dokument</div>
              <div className="text-xs text-muted-foreground">Kontrola pravosti dokumentu</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => setLocation('/virtual-office')}
            data-testid="button-virtual-office"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Virtuálna kancelária</div>
              <div className="text-xs text-muted-foreground">Digitálne podpisovanie</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Mandate Invitations - Detail View */}
      {pendingMandates.length > 0 && (
        <Card id="pending-mandates-section">
          <CardHeader>
            <CardTitle>Pozvánky na spoluprácu</CardTitle>
            <CardDescription>Skontrolujte a potvrďte pozvánky od spoločností</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingMandates.map((mandate) => (
                <div
                  key={mandate.mandateId}
                  className="flex flex-col gap-4 p-4 border rounded-lg"
                  data-testid={`mandate-invitation-${mandate.mandateId}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-lg" data-testid="text-company-name">
                        {mandate.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-role">
                        Ponúknutá rola: <span className="font-medium">{mandate.role}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        IČO: {mandate.ico}
                      </p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      Boli ste pozvaní na spoluprácu s touto spoločnosťou. Prijatím pozvánky získate prístup k firemným funkciám a budete môcť konať v mene spoločnosti v rozsahu vašich oprávnení.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      size="default"
                      onClick={() => acceptMandateMutation.mutate(mandate.mandateId)}
                      disabled={acceptMandateMutation.isPending || rejectMandateMutation.isPending}
                      data-testid={`button-accept-${mandate.mandateId}`}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Prijať
                    </Button>
                    <Button
                      size="default"
                      variant="outline"
                      onClick={() => rejectMandateMutation.mutate(mandate.mandateId)}
                      disabled={acceptMandateMutation.isPending || rejectMandateMutation.isPending}
                      data-testid={`button-reject-${mandate.mandateId}`}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Odmietnuť
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Nedávna aktivita</CardTitle>
          <CardDescription>Vaše posledné úkony a zmeny</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Zatiaľ nemáte žiadnu aktivitu
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
