import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Shield, Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Contract, VirtualOffice } from "@shared/schema";

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
  const pendingTasksCount = pendingMandates.length;

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

        <Card data-testid="card-pending-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Čakajúce úkony</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground">Na podpis/schválenie</p>
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

      {/* Pending Mandate Invitations */}
      {pendingMandates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Čakajúce úkony</CardTitle>
            <CardDescription>Pozvánky na spoluprácu so spoločnosťami</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUser ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Načítavam úkony...
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMandates.map((mandate) => (
                  <div
                    key={mandate.mandateId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg"
                    data-testid={`mandate-invitation-${mandate.mandateId}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium" data-testid="text-company-name">
                        Pozvánka: {mandate.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid="text-role">
                        Ponúknutá rola: {mandate.role}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        IČO: {mandate.ico}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled
                        data-testid={`button-accept-${mandate.mandateId}`}
                      >
                        Prijať
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        data-testid={`button-reject-${mandate.mandateId}`}
                      >
                        Odmietnuť
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
